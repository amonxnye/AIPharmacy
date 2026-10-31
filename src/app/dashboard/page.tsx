"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { productService } from "@/lib/services/productService";
import { salesService } from "@/lib/services/salesService";
import { formatCurrency } from "@/lib/format";
import type { Sale } from "@/types/sale";
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";

const LOW_STOCK_THRESHOLD = 20;
const EXPIRY_WINDOW_DAYS = 30;

interface StockRow {
  productId: string;
  name: string;
  quantity: number;
}

export default function DashboardPage() {
  const { userProfile } = useAuth();
  const { organization, selectedBranch, branches } = useOrganization();

  const orgId = userProfile?.organizationId;
  const currency = organization?.currency || "USD";
  const branch = selectedBranch || null;

  const [loading, setLoading] = useState(true);
  const [salesToday, setSalesToday] = useState({ total: 0, count: 0 });
  const [productCount, setProductCount] = useState(0);
  const [lowStock, setLowStock] = useState<StockRow[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);

  const load = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const [products, batches, summary, recent] = await Promise.all([
        productService.getProducts(orgId),
        productService.getStockBatches(orgId, branch?.id),
        salesService.getSalesSummary(orgId, startOfDay, branch?.id),
        salesService.getRecentSales(orgId, branch?.id, 5),
      ]);

      setProductCount(products.length);
      setSalesToday(summary);
      setRecentSales(recent);

      const nameById: Record<string, string> = {};
      products.forEach((p) => (nameById[p.id] = p.name));

      const qtyByProduct: Record<string, number> = {};
      const soon = new Date();
      soon.setDate(soon.getDate() + EXPIRY_WINDOW_DAYS);
      let expiring = 0;
      for (const b of batches) {
        qtyByProduct[b.productId] = (qtyByProduct[b.productId] || 0) + b.quantity;
        if (b.quantity > 0 && b.expiryDate <= soon) expiring += 1;
      }
      setExpiringCount(expiring);

      const low: StockRow[] = Object.entries(qtyByProduct)
        .filter(([, qty]) => qty <= LOW_STOCK_THRESHOLD)
        .map(([productId, quantity]) => ({
          productId,
          name: nameById[productId] || "Unknown product",
          quantity,
        }))
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 6);
      setLowStock(low);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [orgId, branch]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">
          {organization?.name || "Pharmacy"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Main metric — Sales Today (focal point) */}
      <div className="rounded-2xl bg-white p-8 border border-gray-200">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-600">Sales Today</p>
          <h2 className="mt-1 text-5xl font-bold text-gray-900 tabular-nums">
            {formatCurrency(salesToday.total, currency)}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {salesToday.count} transaction{salesToday.count === 1 ? "" : "s"}
          </p>
        </div>

        {/* Sales trend visualization placeholder */}
        <div className="h-24 rounded-lg bg-gradient-to-r from-teal-50 to-transparent border border-teal-100 flex items-end gap-1 px-4 py-4">
          {[40, 45, 35, 50, 60, 55, 65].map((height, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm bg-teal-600 opacity-60 transition-all hover:opacity-100"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>

      {/* Secondary metrics grid */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Products */}
        <div className="rounded-lg bg-white p-6 border border-gray-200">
          <p className="text-sm text-gray-600">Products</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {productCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {branch ? branch.name : `${branches.length} outlet${branches.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {/* Expiring Soon */}
        {expiringCount > 0 && (
          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-gray-400" />
              <p className="text-sm text-gray-600">Expiring</p>
            </div>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {expiringCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Next {EXPIRY_WINDOW_DAYS} days
            </p>
          </div>
        )}

        {/* Low Stock Count */}
        {lowStock.length > 0 && (
          <div className="rounded-lg bg-white p-6 border border-gray-200">
            <p className="text-sm text-gray-600">Low Stock</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {lowStock.length}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Below {LOW_STOCK_THRESHOLD} units
            </p>
          </div>
        )}
      </div>

      {/* Lists */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <div className="rounded-lg bg-white p-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Sales</h2>
          {recentSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No sales yet. Completed transactions appear here.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {sale.receiptNumber}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.items.length} item{sale.items.length === 1 ? "" : "s"} · {sale.cashierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 tabular-nums">
                      {formatCurrency(sale.total, currency)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {sale.createdAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Items */}
        <div className="rounded-lg bg-white p-6 border border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Low Stock</h2>
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No items below {LOW_STOCK_THRESHOLD} units.
            </p>
          ) : (
            <div className="space-y-3">
              {lowStock.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <p className="text-sm text-gray-900">{item.name}</p>
                  <p className="text-sm font-medium text-gray-600 tabular-nums">
                    {item.quantity}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
