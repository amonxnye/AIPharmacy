export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  organizationId: string;
  branchId: string;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "mobile_money" | "card";
  status: "completed" | "void" | "refunded";
  receiptNumber: string;
  createdAt: Date;
}

export interface CreateSaleData {
  branchId: string;
  cashierId: string;
  cashierName: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: Sale["paymentMethod"];
}
