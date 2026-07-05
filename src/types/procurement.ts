export type POStatus = "draft" | "ordered" | "received" | "cancelled";
export type GRNStatus = "pending" | "completed";

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  receivedQuantity?: number; // tracks what's been received via GRN
}

export interface PurchaseOrder {
  id: string;
  organizationId: string;
  branchId: string;
  poNumber: string;
  status: POStatus;
  supplier: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  expectedDelivery?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePurchaseOrderData {
  branchId: string;
  supplier: string;
  items: PurchaseOrderItem[];
  expectedDelivery?: string;
  notes?: string;
}

export interface GoodsReceiptItem {
  poItemIndex: number; // index into PO.items
  productId: string;
  productName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  batchNumber: string;
  expiryDate: Date;
  costPrice: number; // from PO
}

export interface GoodsReceipt {
  id: string;
  organizationId: string;
  branchId: string;
  grnNumber: string;
  poId: string;
  status: GRNStatus;
  items: GoodsReceiptItem[];
  receivedBy: string;
  receivedAt: Date;
  notes?: string;
  createdAt: Date;
}

export interface CreateGoodsReceiptData {
  poId: string;
  items: GoodsReceiptItem[];
  receivedBy: string;
  notes?: string;
}
