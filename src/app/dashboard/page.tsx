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

      // Aggregate stock per product for low-stock + expiry insight.
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

  const stats = [
    {
      name: "Sales Today",
      value: formatCurrency(salesToday.total, currency),
      sub: `${salesToday.count} transaction${salesToday.count === 1 ? "" : "s"}`,
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      name: "Products",
      value: productCount.toLocaleString(),
      sub: branch ? branch.name : `${branches.length} outlet(s)`,
      icon: Package,
      color: "bg-blue-500",
    },
    {
      name: "Transactions Today",
      value: salesToday.count.toLocaleString(),
      sub: "Since midnight",
      icon: ShoppingCart,
      color: "bg-purple-500",
    },
    {
      name: "Expiring Soon",
      value: expiringCount.toLocaleString(),
      sub: `Next ${EXPIRY_WINDOW_DAYS} days`,
      icon: AlertCircle,
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          {organization?.name ? `${organization.name} — ` : ""}here&apos;s what&apos;s happening today.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-lg ${stat.color} p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Sales */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Sales</h2>
          </div>
          {recentSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No sales yet. Completed sales from the POS appear here.
            </p>
          ) : (
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{sale.receiptNumber}</p>
                    <p className="text-sm text-gray-500">
                      {sale.items.length} item{sale.items.length === 1 ? "" : "s"} · {sale.cashierName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 tabular-nums">
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

        {/* Low Stock */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Low Stock Alert</h2>
            <AlertCircle className="h-5 w-5 text-orange-500" />
          </div>
          {lowStock.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              Nothing running low. Stock at or below {LOW_STOCK_THRESHOLD} units shows here.
            </p>
          ) : (
            <div className="space-y-4">
              {lowStock.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                >
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800 tabular-nums">
                    {item.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
