"use client";

import { useState } from "react";
import { procurementService } from "@/lib/services/procurementService";
import { X, Loader2, Plus, Trash2 } from "lucide-react";
import type { Product } from "@/types/product";
import type { CreatePurchaseOrderData, PurchaseOrderItem } from "@/types/procurement";

interface PurchaseOrderModalProps {
  isOpen: boolean;
  orgId: string;
  branchId: string;
  userId: string;
  allProducts: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function PurchaseOrderModal({
  isOpen,
  orgId,
  branchId,
  userId,
  allProducts,
  onClose,
  onSuccess,
}: PurchaseOrderModalProps) {
  const [supplier, setSupplier] = useState("");
  const [items, setItems] = useState<PurchaseOrderItem[]>([
    { productId: "", productName: "", quantity: 0, unitCost: 0, lineTotal: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateItem = (idx: number, field: string, value: string | number) => {
    const newItems = [...items];
    const item = newItems[idx];

    if (field === "productId") {
      const product = allProducts.find((p) => p.id === String(value));
      item.productId = String(value);
      item.productName = product?.name || "";
    } else if (field === "quantity") {
      item.quantity = parseInt(String(value)) || 0;
    } else if (field === "unitCost") {
      item.unitCost = parseFloat(String(value)) || 0;
    }

    item.lineTotal = item.quantity * item.unitCost;
    newItems[idx] = item;
    setItems(newItems);
  };

  const addLine = () => {
    setItems([
      ...items,
      { productId: "", productName: "", quantity: 0, unitCost: 0, lineTotal: 0 },
    ]);
  };

  const removeLine = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplier.trim()) {
      setError("Please enter a supplier name.");
      return;
    }

    const validItems = items.filter((item) => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      setError("Please add at least one product.");
      return;
    }

    setSaving(true);
    try {
      const data: CreatePurchaseOrderData = {
        branchId,
        supplier: supplier.trim(),
        items: validItems,
      };

      await procurementService.createPO(orgId, userId, data);
      setSupplier("");
      setItems([{ productId: "", productName: "", quantity: 0, unitCost: 0, lineTotal: 0 }]);
      onSuccess();
    } catch {
      setError("Could not create purchase order. Please try again.");
      setSaving(false);
    }
  };

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create Purchase Order</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier *</label>
            <input
              type="text"
              disabled={saving}
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Pharma Supplies Ltd"
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
            />
          </div>

          {/* Items */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Products *</label>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="grid gap-3 sm:grid-cols-4">
                  <select
                    disabled={saving}
                    value={item.productId}
                    onChange={(e) => updateItem(idx, "productId", e.target.value)}
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                  >
                    <option value="">Select product</option>
                    {allProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    disabled={saving}
                    min="0"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    placeholder="Qty"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                  />
                  <input
                    type="number"
                    disabled={saving}
                    min="0"
                    step="0.01"
                    value={item.unitCost}
                    onChange={(e) => updateItem(idx, "unitCost", e.target.value)}
                    placeholder="Cost"
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                  />
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-right text-sm font-medium text-gray-900">
                      {item.lineTotal.toFixed(2)}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        disabled={saving}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addLine}
              disabled={saving}
              className="mt-3 flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add Line
            </button>
          </div>

          {/* Total */}
          <div className="flex justify-end rounded-lg bg-gray-50 p-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{subtotal.toFixed(2)}</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create PO"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
