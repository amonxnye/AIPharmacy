"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { productService } from "@/lib/services/productService";
import ProductModal from "@/components/modals/ProductModal";
import type { Product } from "@/types/product";
import { Plus, Search, Package, AlertCircle, Edit, Trash2, Loader2 } from "lucide-react";

const LOW_STOCK_THRESHOLD = 20;
const EXPIRY_WINDOW_DAYS = 30;

export default function InventoryPage() {
  const { userProfile } = useAuth();
  const { selectedBranch, branches } = useOrganization();
  const orgId = userProfile?.organizationId;
  const branchId = selectedBranch?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [stockByProduct, setStockByProduct] = useState<Record<string, number>>({});
  const [expiringProductIds, setExpiringProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [prods, batches] = await Promise.all([
        productService.getProducts(orgId),
        productService.getStockBatches(orgId, branchId),
      ]);
      const stock: Record<string, number> = {};
      const expiring = new Set<string>();
      const soon = new Date();
      soon.setDate(soon.getDate() + EXPIRY_WINDOW_DAYS);
      for (const b of batches) {
        stock[b.productId] = (stock[b.productId] || 0) + b.quantity;
        if (b.quantity > 0 && b.expiryDate <= soon) expiring.add(b.productId);
      }
      setProducts(prods);
      setStockByProduct(stock);
      setExpiringProductIds(expiring);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDelete = async (product: Product) => {
    if (!orgId) return;
    if (userProfile?.role !== "owner" && userProfile?.role !== "manager" && userProfile?.role !== "inventory_officer") {
      alert("Only owners, managers, and inventory officers can delete products.");
      return;
    }
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setBusyId(product.id);
    try {
      await productService.deleteProduct(orgId, product.id);
      await load();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(message.includes("permission") ? "You don't have permission to delete this product." : "Could not delete this product. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnits = Object.values(stockByProduct).reduce((a, b) => a + b, 0);
  const lowStockCount = products.filter(
    (p) => (stockByProduct[p.id] || 0) <= LOW_STOCK_THRESHOLD
  ).length;

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  const stockBadge = (qty: number) => {
    if (qty <= 0) return <span className="inline-flex items-center gap-1 text-red-600"><span className="h-2 w-2 rounded-full bg-red-500" />Out of stock</span>;
    if (qty <= LOW_STOCK_THRESHOLD) return <span className="inline-flex items-center gap-1 text-orange-600"><span className="h-2 w-2 rounded-full bg-orange-500" />{qty} low</span>;
    return <span className="inline-flex items-center gap-1 text-green-600"><span className="h-2 w-2 rounded-full bg-green-500" />{qty} in stock</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selectedBranch ? `${selectedBranch.name} — ` : ""}manage products and stock levels
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by name, generic name, or SKU..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard color="bg-blue-500" icon={Package} label="Total Products" value={products.length} />
        <StatCard color="bg-green-500" icon={Package} label="Units in Stock" value={totalUnits} />
        <StatCard color="bg-orange-500" icon={AlertCircle} label="Low Stock" value={lowStockCount} />
        <StatCard color="bg-red-500" icon={AlertCircle} label="Expiring Soon" value={expiringProductIds.size} />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                {["Product", "SKU", "Category", "Form", "Stock", "Actions"].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? "Try adjusting your search" : "Get started by adding your first product"}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={openAdd}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Product
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const qty = stockByProduct[product.id] || 0;
                  return (
                    <tr key={product.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{product.name}</div>
                        {product.genericName && (
                          <div className="text-sm text-gray-500">{product.genericName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{product.category}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium capitalize text-gray-800">
                          {product.form}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm tabular-nums">{stockBadge(qty)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button onClick={() => openEdit(product)} className="text-blue-600 hover:text-blue-700" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={busyId === product.id}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && orgId && (
        <ProductModal
          orgId={orgId}
          branches={branches}
          product={editing}
          defaultBranchId={branchId}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await load();
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  color,
  icon: Icon,
  label,
  value,
}: {
  color: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
      <div className={`inline-flex rounded-lg ${color} p-3`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
      </div>
    </div>
  );
}
