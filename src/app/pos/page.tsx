"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { productService } from "@/lib/services/productService";
import { salesService } from "@/lib/services/salesService";
import { subscriptionService } from "@/lib/services/subscriptionService";
import { formatCurrency } from "@/lib/format";
import ReceiptModal from "@/components/ReceiptModal";
import SubscriptionRenewalModal from "@/components/modals/SubscriptionRenewalModal";
import type { Product } from "@/types/product";
import type { SaleItem, Sale } from "@/types/sale";
import {
  Search,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

interface CartItem {
  product: Product;
  price: number;
  available: number;
  quantity: number;
}

export default function POSPage() {
  const { userProfile, globalProfile, currentMembership } = useAuth();
  const { organization, selectedBranch, branches } = useOrganization();

  const orgId = userProfile?.organizationId;
  const currency = organization?.currency || "USD";
  const taxRate = organization?.taxRate ?? 0; // stored as a decimal (e.g. 0.18)
  const branch = selectedBranch || branches[0] || null;

  const [products, setProducts] = useState<Product[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>({});
  const [priceByProduct, setPriceByProduct] = useState<Record<string, number>>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "mobile_money" | "card">("cash");
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState(0);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);

  const loadData = useCallback(async () => {
    if (!orgId || !branch) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [prods, batches] = await Promise.all([
        productService.getProducts(orgId),
        productService.getStockBatches(orgId, branch.id),
      ]);
      const stock: Record<string, number> = {};
      const price: Record<string, number> = {};
      for (const b of batches) {
        stock[b.productId] = (stock[b.productId] || 0) + b.quantity;
        // Use the most recent batch's selling price as the current price.
        price[b.productId] = b.sellingPrice;
      }
      setProducts(prods);
      setStockByProduct(stock);
      setPriceByProduct(price);
    } catch {
      setMessage({ type: "error", text: "Could not load products. Check your access." });
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!orgId || !organization?.subscription) return;

      const endDate = organization.subscription.endDate;
      setSubscriptionEndDate(endDate);
      const days = subscriptionService.daysUntilExpiry(endDate);
      setDaysUntilExpiry(days);
      const expired = subscriptionService.isSubscriptionExpired(endDate);
      setSubscriptionExpired(expired);

      if (expired || days <= 7) {
        setShowRenewalModal(true);
      }
    };

    checkSubscription();
  }, [orgId, organization?.subscription]);

  const addToCart = (product: Product) => {
    const available = stockByProduct[product.id] || 0;
    const price = priceByProduct[product.id] || 0;
    if (available <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= available) return prev;
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { product, price, available, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === id
            ? { ...i, quantity: Math.max(0, Math.min(i.available, i.quantity + delta)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => prev.filter((i) => i.product.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [products, searchQuery]
  );

  const canSell =
    !currentMembership || ["owner", "manager", "pharmacist", "cashier"].includes(currentMembership.role);

  const handleCheckout = async () => {
    if (!orgId || !branch || cart.length === 0) return;
    if (!canSell) {
      setMessage({ type: "error", text: "Your role can't process sales." });
      return;
    }

    // Final validation: verify subscription is still active immediately before checkout
    // This prevents race conditions where subscription expires between UI check and sale creation
    try {
      const hasActive = await subscriptionService.hasActiveSubscription(orgId);
      if (!hasActive) {
        setMessage({ type: "error", text: "Subscription has expired. Renew to process sales." });
        setSubscriptionExpired(true);
        return;
      }
    } catch (error) {
      setMessage({ type: "error", text: "Could not verify subscription. Please try again." });
      return;
    }

    setCheckingOut(true);
    setMessage(null);
    try {
      const items: SaleItem[] = cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.price,
        lineTotal: i.price * i.quantity,
      }));

      const { saleId, receiptNumber } = await salesService.createSale(orgId, {
        branchId: branch.id,
        cashierId: globalProfile?.uid || userProfile?.uid || "",
        cashierName: globalProfile?.displayName || userProfile?.name || "Cashier",
        items,
        subtotal,
        tax,
        total,
        paymentMethod,
      });

      // Fetch the created sale to display in receipt modal
      const sale = await salesService.getSale(orgId, saleId);
      if (sale) {
        setCurrentSale(sale);
        setMessage(null);
      } else {
        setMessage({ type: "success", text: `Sale complete — receipt ${receiptNumber}.` });
      }

      setCart([]);
      await loadData(); // refresh stock levels
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed. Please try again.";
      setMessage({
        type: "error",
        text: message.includes("permission") ? "You don't have permission to create sales." : "Checkout failed. Please try again.",
      });
    } finally {
      setCheckingOut(false);
    }
  };

  if (!branch) {
    return (
      <div className="flex h-96 items-center justify-center text-center">
        <div>
          <AlertCircle className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-3 text-sm text-gray-600">
            No outlet selected. Create an outlet to start selling.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Left — product selection */}
      <div className="flex flex-1 flex-col space-y-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Point of Sale</h1>
          <p className="mt-1 text-sm text-gray-500">
            {branch.name} · prices in {currency}
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, or barcode"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
          />
        </div>

        <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
              No products yet. Add products in Inventory to sell them here.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {filteredProducts.map((product) => {
                const available = stockByProduct[product.id] || 0;
                const price = priceByProduct[product.id] || 0;
                const out = available <= 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={out}
                    className="rounded-lg border border-gray-200 p-4 text-left hover:border-teal-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className={`mt-1 text-xs tabular-nums ${out ? "text-red-700" : "text-gray-500"}`}>
                      {out ? "Out of stock" : `${available} in stock`}
                    </p>
                    <p className="mt-4 text-base font-semibold text-gray-900 tabular-nums">
                      {formatCurrency(price, currency)}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right — cart & checkout */}
      <div className="flex w-96 flex-col rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Current sale</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center">
              <p className="text-sm text-gray-500">
                Cart is empty. Select a product to add it.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-3 py-3 first:pt-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                    <p className="text-xs text-gray-500 tabular-nums">
                      {formatCurrency(item.price, currency)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="rounded border border-gray-200 p-1 text-gray-600 hover:bg-gray-100"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-medium tabular-nums">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.available}
                      className="rounded border border-gray-200 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="ml-2 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-6">
          {message && (
            <div
              className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
                message.type === "success"
                  ? "border-teal-200 bg-teal-50 text-teal-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              {message.text}
            </div>
          )}

          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-gray-500">Payment method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
            >
              <option value="cash">Cash</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="card">Card</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(subtotal, currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%)</span>
              <span className="font-medium text-gray-900 tabular-nums">{formatCurrency(tax, currency)}</span>
            </div>
            <div className="flex items-baseline justify-between border-t border-gray-200 pt-3">
              <span className="text-sm font-medium text-gray-900">Total</span>
              <span className="text-3xl font-semibold text-gray-900 tabular-nums">{formatCurrency(total, currency)}</span>
            </div>
          </div>

          {subscriptionExpired && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Subscription expired. Renew to process sales.</span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkingOut || subscriptionExpired}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {checkingOut ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : subscriptionExpired ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Subscription Expired
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />

                Complete Sale
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      <ReceiptModal
        sale={currentSale}
        organizationName={organization?.name}
        outletName={branch?.name}
        currency={currency}
        onClose={() => {
          setCurrentSale(null);
          setMessage(null);
        }}
      />

      {/* Subscription Renewal Modal */}
      {subscriptionEndDate && (
        <SubscriptionRenewalModal
          isOpen={showRenewalModal}
          daysUntilExpiry={daysUntilExpiry}
          expiryDate={subscriptionEndDate}
          onClose={() => setShowRenewalModal(false)}
          onRenew={() => {
            // TODO: Redirect to payment page or show payment modal
            setShowRenewalModal(false);
          }}
        />
      )}
    </div>
  );
}
