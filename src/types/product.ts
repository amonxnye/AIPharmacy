export interface Product {
  id: string;
  organizationId: string;
  name: string;
  genericName?: string;
  sku: string;
  barcode?: string;
  category: string;
  strength?: string;
  form: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops" | "inhaler" | "other";
  packSize?: string;
  description?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockBatch {
  id: string;
  productId: string;
  organizationId: string;
  branchId: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  receivedDate: Date;
  createdAt: Date;
}

export interface CreateProductData {
  name: string;
  genericName?: string;
  sku: string;
  barcode?: string;
  category: string;
  strength?: string;
  form: Product["form"];
  packSize?: string;
  description?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
}

export interface CreateStockBatchData {
  productId: string;
  branchId: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  receivedDate: Date;
}
