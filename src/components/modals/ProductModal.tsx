"use client";

import { useState } from "react";
import { productService } from "@/lib/services/productService";
import type { Product, CreateProductData } from "@/types/product";
import { X, Loader2, Package } from "lucide-react";

interface Branch {
  id: string;
  name: string;
}

interface ProductModalProps {
  orgId: string;
  branches: Branch[];
  defaultBranchId?: string;
  product?: Product | null; // when set, edit mode
  onClose: () => void;
  onSaved: () => void;
}

const FORMS: Product["form"][] = [
  "tablet",
  "capsule",
  "syrup",
  "injection",
  "cream",
  "drops",
  "inhaler",
  "other",
];

export default function ProductModal({
  orgId,
  branches,
  defaultBranchId,
  product,
  onClose,
  onSaved,
}: ProductModalProps) {
  const isEdit = !!product;

  const [form, setForm] = useState<CreateProductData>({
    name: product?.name || "",
    genericName: product?.genericName || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    category: product?.category || "",
    strength: product?.strength || "",
    form: product?.form || "tablet",
    packSize: product?.packSize || "",
    manufacturer: product?.manufacturer || "",
    requiresPrescription: product?.requiresPrescription || false,
  });

  // Initial stock (create mode only).
  const [addStock, setAddStock] = useState(false);
  const [stock, setStock] = useState({
    branchId: defaultBranchId || branches[0]?.id || "",
    batchNumber: "",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    expiryDate: "",
    supplier: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateProductData>(key: K, value: CreateProductData[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.sku.trim() || !form.category.trim()) {
      setError("Name, SKU, and category are required.");
      return;
    }
    if (addStock && !isEdit) {
      if (!stock.branchId) return setError("Select an outlet for the initial stock.");
      if (!stock.expiryDate) return setError("Enter the batch expiry date.");
      if (stock.quantity <= 0) return setError("Stock quantity must be greater than zero.");
    }

    setSaving(true);
    try {
      if (isEdit && product) {
        await productService.updateProduct(orgId, product.id, form);
      } else {
        const productId = await productService.createProduct(orgId, form);
        if (addStock) {
          await productService.createStockBatch(orgId, {
            productId,
            branchId: stock.branchId,
            batchNumber: stock.batchNumber || "N/A",
            quantity: Math.floor(stock.quantity),
            costPrice: stock.costPrice,
            sellingPrice: stock.sellingPrice,
            expiryDate: new Date(stock.expiryDate),
            receivedDate: new Date(),
            supplier: stock.supplier || undefined,
          });
        }
      }
      onSaved();
    } catch (err) {
      console.error("Error saving product:", err);
      setError("Could not save the product. Check your access and try again.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <Package className="h-6 w-6 text-teal-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEdit ? "Edit Product" : "Add Product"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Product Name *">
              <input className={input} value={form.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <Field label="Generic Name">
              <input className={input} value={form.genericName} onChange={(e) => set("genericName", e.target.value)} />
            </Field>
            <Field label="SKU *">
              <input className={input} value={form.sku} onChange={(e) => set("sku", e.target.value)} />
            </Field>
            <Field label="Barcode">
              <input className={input} value={form.barcode} onChange={(e) => set("barcode", e.target.value)} />
            </Field>
            <Field label="Category *">
              <input className={input} value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="e.g. Analgesics" />
            </Field>
            <Field label="Form">
              <select className={input} value={form.form} onChange={(e) => set("form", e.target.value as Product["form"])}>
                {FORMS.map((f) => (
                  <option key={f} value={f} className="capitalize">
                    {f}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Strength">
              <input className={input} value={form.strength} onChange={(e) => set("strength", e.target.value)} placeholder="e.g. 500mg" />
            </Field>
            <Field label="Pack Size">
              <input className={input} value={form.packSize} onChange={(e) => set("packSize", e.target.value)} placeholder="e.g. 30 tablets" />
            </Field>
            <Field label="Manufacturer">
              <input className={input} value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.requiresPrescription}
              onChange={(e) => set("requiresPrescription", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
            />
            Requires prescription
          </label>

          {!isEdit && (
            <div className="rounded-lg border border-gray-200 p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <input
                  type="checkbox"
                  checked={addStock}
                  onChange={(e) => setAddStock(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                Add opening stock now
              </label>

              {addStock && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Outlet">
                    <select
                      className={input}
                      value={stock.branchId}
                      onChange={(e) => setStock((s) => ({ ...s, branchId: e.target.value }))}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Batch Number">
                    <input className={input} value={stock.batchNumber} onChange={(e) => setStock((s) => ({ ...s, batchNumber: e.target.value }))} />
                  </Field>
                  <Field label="Quantity">
                    <input type="number" min="0" className={input} value={stock.quantity} onChange={(e) => setStock((s) => ({ ...s, quantity: parseInt(e.target.value) || 0 }))} />
                  </Field>
                  <Field label="Expiry Date">
                    <input type="date" className={input} value={stock.expiryDate} onChange={(e) => setStock((s) => ({ ...s, expiryDate: e.target.value }))} />
                  </Field>
                  <Field label="Cost Price">
                    <input type="number" min="0" step="0.01" className={input} value={stock.costPrice} onChange={(e) => setStock((s) => ({ ...s, costPrice: parseFloat(e.target.value) || 0 }))} />
                  </Field>
                  <Field label="Selling Price">
                    <input type="number" min="0" step="0.01" className={input} value={stock.sellingPrice} onChange={(e) => setStock((s) => ({ ...s, sellingPrice: parseFloat(e.target.value) || 0 }))} />
                  </Field>
                  <Field label="Supplier">
                    <input className={input} value={stock.supplier} onChange={(e) => setStock((s) => ({ ...s, supplier: e.target.value }))} />
                  </Field>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : isEdit ? "Save Changes" : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}
