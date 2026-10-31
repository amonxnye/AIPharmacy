"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { productService } from "@/lib/services/productService";
import ProductModal from "@/components/modals/ProductModal";
import type { Product } from "@/types/product";
import { Plus, Search, Package, Edit, Trash2, Loader2 } from "lucide-react";

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
    if (qty <= 0) return <span className="font-medium text-red-700">Out of stock</span>;
    if (qty <= LOW_STOCK_THRESHOLD) return <span className="font-medium text-gray-900">{qty} <span className="font-normal text-gray-500">low</span></span>;
    return <span className="text-gray-900">{qty}</span>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            {selectedBranch ? selectedBranch.name : "All outlets"}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name, generic name, or SKU"
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={products.length} />
        <StatCard label="Units in stock" value={totalUnits} />
        <StatCard label="Low stock" value={lowStockCount} />
        <StatCard label={`Expiring in ${EXPIRY_WINDOW_DAYS} days`} value={expiringProductIds.size} />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                {["Product", "SKU", "Category", "Form", "Stock", "Actions"].map((h) => (
                  <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-500 ${h === "Stock" || h === "Actions" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-8 w-8 text-gray-300" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No products found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? "No product matches that search." : "Add a product to start tracking stock."}
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
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        {product.genericName && (
                          <div className="text-xs text-gray-500">{product.genericName}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                      <td className="px-6 py-4 text-sm capitalize text-gray-600">{product.form}</td>
                      <td className="px-6 py-4 text-right text-sm tabular-nums">{stockBadge(qty)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center justify-end gap-4">
                          <button onClick={() => openEdit(product)} className="text-gray-400 hover:text-gray-900" title="Edit">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            disabled={busyId === product.id}
                            className="text-gray-400 hover:text-red-700 disabled:opacity-50"
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

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
    </div>
  );
}
