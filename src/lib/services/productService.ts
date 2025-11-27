import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Product,
  CreateProductData,
  StockBatch,
  CreateStockBatchData,
} from "@/types/product";

export const productService = {
  // Product CRUD operations
  async createProduct(
    organizationId: string,
    data: CreateProductData
  ): Promise<string> {
    const productsRef = collection(
      db,
      "organizations",
      organizationId,
      "products"
    );
    const docRef = await addDoc(productsRef, {
      ...data,
      organizationId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getProducts(organizationId: string): Promise<Product[]> {
    const productsRef = collection(
      db,
      "organizations",
      organizationId,
      "products"
    );
    const q = query(productsRef, orderBy("name"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId: data.organizationId,
        name: data.name,
        genericName: data.genericName,
        sku: data.sku,
        barcode: data.barcode,
        category: data.category,
        strength: data.strength,
        form: data.form,
        packSize: data.packSize,
        description: data.description,
        manufacturer: data.manufacturer,
        requiresPrescription: data.requiresPrescription,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
      };
    });
  },

  async getProduct(
    organizationId: string,
    productId: string
  ): Promise<Product | null> {
    const productDoc = await getDoc(
      doc(db, "organizations", organizationId, "products", productId)
    );

    if (!productDoc.exists()) return null;

    const data = productDoc.data();
    return {
      id: productDoc.id,
      organizationId: data.organizationId,
      name: data.name,
      genericName: data.genericName,
      sku: data.sku,
      barcode: data.barcode,
      category: data.category,
      strength: data.strength,
      form: data.form,
      packSize: data.packSize,
      description: data.description,
      manufacturer: data.manufacturer,
      requiresPrescription: data.requiresPrescription,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date(),
    };
  },

  async updateProduct(
    organizationId: string,
    productId: string,
    data: Partial<CreateProductData>
  ): Promise<void> {
    await updateDoc(
      doc(db, "organizations", organizationId, "products", productId),
      {
        ...data,
        updatedAt: serverTimestamp(),
      }
    );
  },

  async deleteProduct(
    organizationId: string,
    productId: string
  ): Promise<void> {
    await deleteDoc(
      doc(db, "organizations", organizationId, "products", productId)
    );
  },

  // Stock Batch operations
  async createStockBatch(
    organizationId: string,
    data: CreateStockBatchData
  ): Promise<string> {
    const stockRef = collection(
      db,
      "organizations",
      organizationId,
      "stock"
    );
    const docRef = await addDoc(stockRef, {
      ...data,
      organizationId,
      expiryDate: Timestamp.fromDate(data.expiryDate),
      receivedDate: Timestamp.fromDate(data.receivedDate),
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async getStockBatches(
    organizationId: string,
    branchId?: string,
    productId?: string
  ): Promise<StockBatch[]> {
    const stockRef = collection(db, "organizations", organizationId, "stock");

    let q = query(stockRef, orderBy("expiryDate"));

    if (branchId) {
      q = query(q, where("branchId", "==", branchId));
    }

    if (productId) {
      q = query(q, where("productId", "==", productId));
    }

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: data.productId,
        organizationId: data.organizationId,
        branchId: data.branchId,
        batchNumber: data.batchNumber,
        expiryDate: (data.expiryDate as Timestamp).toDate(),
        quantity: data.quantity,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        supplier: data.supplier,
        receivedDate: (data.receivedDate as Timestamp).toDate(),
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      };
    });
  },

  async updateStockQuantity(
    organizationId: string,
    stockId: string,
    newQuantity: number
  ): Promise<void> {
    await updateDoc(
      doc(db, "organizations", organizationId, "stock", stockId),
      {
        quantity: newQuantity,
      }
    );
  },

  async getTotalStock(
    organizationId: string,
    productId: string,
    branchId?: string
  ): Promise<number> {
    const batches = await this.getStockBatches(
      organizationId,
      branchId,
      productId
    );
    return batches.reduce((total, batch) => total + batch.quantity, 0);
  },
};
