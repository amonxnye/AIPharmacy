import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { productService } from "./productService";
import type {
  PurchaseOrder,
  GoodsReceipt,
  CreatePurchaseOrderData,
  CreateGoodsReceiptData,
  POStatus,
} from "@/types/procurement";

export const procurementService = {
  // Generate unique PO number
  async generatePONumber(organizationId: string): Promise<string> {
    const posRef = collection(db, "organizations", organizationId, "purchaseOrders");
    const snapshot = await getDocs(
      query(posRef, orderBy("createdAt", "desc"))
    );
    const lastPO = snapshot.docs[0];
    const lastNum = lastPO
      ? parseInt(lastPO.data().poNumber.split("-")[1] || "0", 10)
      : 0;
    return `PO-${String(lastNum + 1).padStart(5, "0")}`;
  },

  // Generate unique GRN number
  async generateGRNNumber(organizationId: string): Promise<string> {
    const grnsRef = collection(db, "organizations", organizationId, "goodsReceipts");
    const snapshot = await getDocs(
      query(grnsRef, orderBy("createdAt", "desc"))
    );
    const lastGRN = snapshot.docs[0];
    const lastNum = lastGRN
      ? parseInt(lastGRN.data().grnNumber.split("-")[1] || "0", 10)
      : 0;
    return `GRN-${String(lastNum + 1).padStart(5, "0")}`;
  },

  // Create purchase order
  async createPO(
    organizationId: string,
    createdBy: string,
    data: CreatePurchaseOrderData
  ): Promise<string> {
    const poNumber = await this.generatePONumber(organizationId);
    const poRef = doc(
      collection(db, "organizations", organizationId, "purchaseOrders")
    );

    await setDoc(poRef, {
      poNumber,
      organizationId,
      branchId: data.branchId,
      supplier: data.supplier,
      items: data.items,
      subtotal: data.items.reduce((sum, item) => sum + item.lineTotal, 0),
      tax: 0, // simplified: no tax on PO
      total: data.items.reduce((sum, item) => sum + item.lineTotal, 0),
      expectedDelivery: data.expectedDelivery ? new Date(data.expectedDelivery) : null,
      notes: data.notes,
      status: "ordered" as const,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return poRef.id;
  },

  // Get all POs for org
  async getPOs(organizationId: string): Promise<PurchaseOrder[]> {
    const posRef = collection(db, "organizations", organizationId, "purchaseOrders");
    const snapshot = await getDocs(
      query(posRef, orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId: data.organizationId,
        branchId: data.branchId,
        poNumber: data.poNumber,
        status: data.status,
        supplier: data.supplier,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        expectedDelivery: data.expectedDelivery?.toDate(),
        notes: data.notes,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    });
  },

  // Get single PO
  async getPO(organizationId: string, poId: string): Promise<PurchaseOrder | null> {
    try {
      const poDoc = await getDoc(
        doc(db, "organizations", organizationId, "purchaseOrders", poId)
      );

      if (!poDoc.exists()) return null;

      const data = poDoc.data();
      return {
        id: poDoc.id,
        organizationId: data.organizationId,
        branchId: data.branchId,
        poNumber: data.poNumber,
        status: data.status,
        supplier: data.supplier,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        expectedDelivery: data.expectedDelivery?.toDate(),
        notes: data.notes,
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    } catch {
      return null;
    }
  },

  // Update PO status
  async updatePOStatus(
    organizationId: string,
    poId: string,
    status: POStatus
  ): Promise<void> {
    await updateDoc(
      doc(db, "organizations", organizationId, "purchaseOrders", poId),
      {
        status,
        updatedAt: serverTimestamp(),
      }
    );
  },

  // Create goods receipt (and auto-create stock batches)
  async createGRN(
    organizationId: string,
    branchId: string,
    data: CreateGoodsReceiptData
  ): Promise<string> {
    const grnNumber = await this.generateGRNNumber(organizationId);
    const grnRef = doc(
      collection(db, "organizations", organizationId, "goodsReceipts")
    );

    // Create GRN record
    await setDoc(grnRef, {
      grnNumber,
      organizationId,
      branchId,
      poId: data.poId,
      status: "completed" as const,
      items: data.items,
      receivedBy: data.receivedBy,
      receivedAt: serverTimestamp(),
      notes: data.notes,
      createdAt: serverTimestamp(),
    });

    // Auto-create stock batches for each received item
    for (const item of data.items) {
      await productService.createStockBatch(organizationId, {
        productId: item.productId,
        branchId,
        batchNumber: item.batchNumber,
        quantity: item.receivedQuantity,
        costPrice: item.costPrice,
        sellingPrice: item.costPrice * 1.5, // rough markup; user can adjust in inventory
        expiryDate: item.expiryDate,
        receivedDate: new Date(),
        supplier: undefined,
      });
    }

    // Update PO status to received
    await this.updatePOStatus(organizationId, data.poId, "received");

    return grnRef.id;
  },

  // Get all GRNs for org
  async getGRNs(organizationId: string): Promise<GoodsReceipt[]> {
    const grnsRef = collection(db, "organizations", organizationId, "goodsReceipts");
    const snapshot = await getDocs(
      query(grnsRef, orderBy("createdAt", "desc"))
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId: data.organizationId,
        branchId: data.branchId,
        grnNumber: data.grnNumber,
        poId: data.poId,
        status: data.status,
        items: data.items,
        receivedBy: data.receivedBy,
        receivedAt: data.receivedAt?.toDate() || new Date(),
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  },

  // Get GRNs by PO
  async getGRNsByPO(organizationId: string, poId: string): Promise<GoodsReceipt[]> {
    const grnsRef = collection(db, "organizations", organizationId, "goodsReceipts");
    const snapshot = await getDocs(
      query(grnsRef, where("poId", "==", poId))
    );

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId: data.organizationId,
        branchId: data.branchId,
        grnNumber: data.grnNumber,
        poId: data.poId,
        status: data.status,
        items: data.items,
        receivedBy: data.receivedBy,
        receivedAt: data.receivedAt?.toDate() || new Date(),
        notes: data.notes,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  },
};
