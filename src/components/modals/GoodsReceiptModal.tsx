"use client";

import { useState } from "react";
import { procurementService } from "@/lib/services/procurementService";
import { X, Loader2 } from "lucide-react";
import type { PurchaseOrder } from "@/types/procurement";

interface GoodsReceiptModalProps {
  isOpen: boolean;
  orgId: string;
  branchId: string;
  po: PurchaseOrder | null;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoodsReceiptModal({
  isOpen,
  orgId,
  branchId,
  po,
  userId,
  onClose,
  onSuccess,
}: GoodsReceiptModalProps) {
  const [receivedQties, setReceivedQties] = useState<Record<number, number>>({});
  const [batchNumbers, setBatchNumbers] = useState<Record<number, string>>({});
  const [expiryDates, setExpiryDates] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !po) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that all items have been received
    const items = po.items.map((item, idx) => {
      const receivedQty = receivedQties[idx] || 0;
      const batchNum = batchNumbers[idx] || "";
      const expiryDate = expiryDates[idx] || "";

      if (receivedQty <= 0) {
        throw new Error(`Please enter quantity for ${item.productName}`);
      }
      if (!batchNum.trim()) {
        throw new Error(`Please enter batch number for ${item.productName}`);
      }
      if (!expiryDate) {
        throw new Error(`Please enter expiry date for ${item.productName}`);
      }

      return {
        poItemIndex: idx,
        productId: item.productId,
        productName: item.productName,
        orderedQuantity: item.quantity,
        receivedQuantity: receivedQty,
        batchNumber: batchNum.trim(),
        expiryDate: new Date(expiryDate),
        costPrice: item.unitCost,
      };
    });

    setSaving(true);
    try {
      await procurementService.createGRN(orgId, branchId, {
        poId: po.id,
        items,
        receivedBy: userId,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create goods receipt.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Receive Goods</h2>
            <p className="mt-1 text-sm text-gray-600">PO {po.poNumber} from {po.supplier}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Items */}
          <div className="space-y-4">
            {po.items.map((item, idx) => (
              <div key={idx} className="rounded-lg border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900">{item.productName}</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Ordered: {item.quantity} units @ {item.unitCost.toFixed(2)} each
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Quantity Received *
                    </label>
                    <input
                      type="number"
                      disabled={saving}
                      min="0"
                      max={item.quantity}
                      value={receivedQties[idx] || ""}
                      onChange={(e) =>
                        setReceivedQties({ ...receivedQties, [idx]: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Batch Number *
                      </label>
                      <input
                        type="text"
                        disabled={saving}
                        value={batchNumbers[idx] || ""}
                        onChange={(e) =>
                          setBatchNumbers({ ...batchNumbers, [idx]: e.target.value })
                        }
                        placeholder="e.g. BATCH-2025-001"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Expiry Date *
                      </label>
                      <input
                        type="date"
                        disabled={saving}
                        value={expiryDates[idx] || ""}
                        onChange={(e) =>
                          setExpiryDates({ ...expiryDates, [idx]: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
                  Receiving...
                </>
              ) : (
                "Complete Receipt"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
