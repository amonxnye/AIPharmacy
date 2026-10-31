"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { procurementService } from "@/lib/services/procurementService";
import { productService } from "@/lib/services/productService";
import { formatCurrency } from "@/lib/format";
import PurchaseOrderModal from "@/components/modals/PurchaseOrderModal";
import GoodsReceiptModal from "@/components/modals/GoodsReceiptModal";
import { Plus, Package, Truck, Loader2 } from "lucide-react";
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Procurement</h1>
          <p className="mt-1 text-sm text-gray-500">{selectedBranch ? selectedBranch.name : "Purchase orders and goods receipts"}</p>
        </div>
        <button
          onClick={() => {
            setSelectedPO(null);
            setShowPOModal(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
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
                className={`flex items-center gap-2 border-b-2 px-1 py-3 text-sm font-medium ${
                  activeTab === tab.id
                    ? "border-teal-600 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
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
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <Package className="mx-auto h-8 w-8 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No purchase orders</h3>
              <p className="mt-1 text-sm text-gray-500">Orders you place with suppliers appear here.</p>
              <button
                onClick={() => setShowPOModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                Create Purchase Order
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full">
                <thead className="border-b border-gray-200">
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
                        className={`px-6 py-3 text-xs font-medium text-gray-500 ${h === "Items" || h === "Total" || h === "Action" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pos.map((po) => (
                    <tr key={po.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{po.poNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{po.supplier}</td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600 tabular-nums">{po.items.length}</td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900 tabular-nums">
                        {formatCurrency(po.total, organization?.currency || "UGX")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm ${
                            po.status === "ordered" ? "font-medium text-gray-900" : "text-gray-500"
                          }`}
                        >
                          {po.status.charAt(0).toUpperCase() + po.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm">
                        {po.status === "ordered" && (
                          <button
                            onClick={() => {
                              setSelectedPO(po);
                              setShowGRNModal(true);
                            }}
                            className="font-medium text-teal-700 hover:text-teal-800"
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
            <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
              <Truck className="mx-auto h-8 w-8 text-gray-300" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                No goods receipts yet
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                A receipt is created when you receive a purchase order.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    {["GRN Number", "PO Number", "Items", "Received At", "Status"].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-medium text-gray-500 ${h === "Items" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {grns.map((grn) => (
                    <tr key={grn.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{grn.grnNumber}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {pos.find((po) => po.id === grn.poId)?.poNumber || grn.poId}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-600 tabular-nums">{grn.items.length}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 tabular-nums">
                        {new Date(grn.receivedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">Completed</td>

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
