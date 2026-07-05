"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { procurementService } from "@/lib/services/procurementService";
import { productService } from "@/lib/services/productService";
import { formatCurrency } from "@/lib/format";
import PurchaseOrderModal from "@/components/modals/PurchaseOrderModal";
import GoodsReceiptModal from "@/components/modals/GoodsReceiptModal";
import { Plus, Package, Truck, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import type { PurchaseOrder, GoodsReceipt } from "@/types/procurement";
import type { Product } from "@/types/product";

export default function ProcurementPage() {
  const { userProfile } = useAuth();
  const { organization, selectedBranch } = useOrganization();
  const orgId = userProfile?.organizationId;
  const branchId = selectedBranch?.id;

  const [products, setProducts] = useState<Product[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<GoodsReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPOModal, setShowPOModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [activeTab, setActiveTab] = useState<"po" | "grn">("po");

  const loadData = useCallback(async () => {
    if (!orgId || !branchId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [allPos, allGrns, allProducts] = await Promise.all([
        procurementService.getPOs(orgId),
        procurementService.getGRNs(orgId),
        productService.getProducts(orgId),
      ]);

      // Filter POs and GRNs for this branch
      setPos(allPos.filter((po) => po.branchId === branchId));
      setGrns(allGrns.filter((grn) => grn.branchId === branchId));
      setProducts(allProducts);
    } catch {
      // Silent failure, show empty lists
    } finally {
      setLoading(false);
    }
  }, [orgId, branchId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  const handlePOCreated = async () => {
    setShowPOModal(false);
    await loadData();
  };

  const handleGRNCreated = async () => {
    setShowGRNModal(false);
    setSelectedPO(null);
    await loadData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Procurement</h1>
          <p className="mt-1 text-sm text-gray-500">Manage purchase orders and stock receipt</p>
        </div>
        <button
          onClick={() => {
            setSelectedPO(null);
            setShowPOModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          New Purchase Order
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-8">
          {[
            { id: "po", label: "Purchase Orders", icon: Package },
            { id: "grn", label: "Goods Receipts", icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "po" | "grn")}
                className={`flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Purchase Orders Tab */}
      {activeTab === "po" && (
        <div className="space-y-4">
          {pos.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No purchase orders</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating your first PO</p>
              <button
                onClick={() => setShowPOModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                Create Purchase Order
              </button>
            </div>
          ) : (
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {[
                      "PO Number",
                      "Supplier",
                      "Items",
                      "Total",
                      "Status",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pos.map((po) => (
                    <tr key={po.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{po.poNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{po.supplier}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{po.items.length}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {formatCurrency(po.total, organization?.currency || "UGX")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                            po.status === "received"
                              ? "bg-green-100 text-green-700"
                              : po.status === "ordered"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {po.status === "received" && <CheckCircle className="h-3 w-3" />}
                          {po.status === "ordered" && <AlertCircle className="h-3 w-3" />}
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {po.status === "ordered" && (
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              setShowGRNModal(true);
                            }}
                            className="text-teal-600 hover:text-teal-700 font-medium"
                          >
                            Receive
                          </button>
                        )}
                        {po.status === "received" && (
                          <span className="text-gray-500 text-xs">Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Goods Receipts Tab */}
      {activeTab === "grn" && (
        <div className="space-y-4">
          {grns.length === 0 ? (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
              <Truck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No goods receipts yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Goods receipts are created when you receive PO shipments
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-white shadow-sm ring-1 ring-gray-900/5">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["GRN Number", "PO Number", "Items", "Received At", "Status"].map((h) => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {grns.map((grn) => (
                    <tr key={grn.id} className="transition-colors hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900">{grn.grnNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pos.find((po) => po.id === grn.poId)?.poNumber || grn.poId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{grn.items.length}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(grn.receivedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {orgId && branchId && (
        <>
          <PurchaseOrderModal
            isOpen={showPOModal}
            orgId={orgId}
            branchId={branchId}
            userId={userProfile?.uid || ""}
            allProducts={products}
            onClose={() => setShowPOModal(false)}
            onSuccess={handlePOCreated}
          />

          <GoodsReceiptModal
            isOpen={showGRNModal}
            orgId={orgId}
            branchId={branchId}
            po={selectedPO}
            userId={userProfile?.uid || ""}
            onClose={() => {
              setShowGRNModal(false);
              setSelectedPO(null);
            }}
            onSuccess={handleGRNCreated}
          />
        </>
      )}
    </div>
  );
}
