"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { productService } from "@/lib/services/productService";
import type { Product } from "@/types/product";
import { Plus, Search, Package, AlertCircle, Edit, Trash2 } from "lucide-react";

export default function InventoryPage() {
  const { userProfile } = useAuth();
  const { selectedBranch } = useOrganization();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [userProfile?.organizationId]);

  const loadProducts = async () => {
    if (!userProfile?.organizationId) return;

    setLoading(true);
    try {
      const data = await productService.getProducts(
        userProfile.organizationId
      );
      setProducts(data);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your products and stock levels
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-blue-500 p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Total Products</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {products.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-green-500 p-3">
              <Package className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">In Stock</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {products.filter((p) => p.category !== "Out of Stock").length}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-orange-500 p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Low Stock</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-red-500 p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">0</p>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Form
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">
                      No products found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm
                        ? "Try adjusting your search"
                        : "Get started by adding your first product"}
                    </p>
                    {!searchTerm && (
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                      >
                        <Plus className="h-4 w-4" />
                        Add Product
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {product.name}
                        </div>
                        {product.genericName && (
                          <div className="text-sm text-gray-500">
                            {product.genericName}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 capitalize">
                        {product.form}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <span className="inline-flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                        In Stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button className="text-blue-600 hover:text-blue-700">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
