import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit as fsLimit,
  runTransaction,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Sale, CreateSaleData } from "@/types/sale";
import type { StockBatch } from "@/types/product";

function generateReceiptNumber(): string {
  // Short, human-readable, unique enough per sale (random suffix).
  const rand = Math.floor(Math.random() * 1e6).toString().padStart(6, "0");
  return `RCP-${rand}`;
}

export const salesService = {
  // Record a sale and deduct stock FEFO (first-expiry-first-out) in a single
  // transaction so overselling can't happen under concurrent checkouts.
  async createSale(
    organizationId: string,
    data: CreateSaleData
  ): Promise<{ saleId: string; receiptNumber: string }> {
    const receiptNumber = generateReceiptNumber();
    const saleRef = doc(collection(db, "organizations", organizationId, "sales"));

    // Pre-read the candidate stock batches per product (transactions can't run
    // queries, only doc gets). We read branch+product batches ordered by expiry.
    const stockCol = collection(db, "organizations", organizationId, "stock");
    const perProductBatchIds: Record<string, string[]> = {};
    for (const item of data.items) {
      const q = query(
        stockCol,
        where("branchId", "==", data.branchId),
        where("productId", "==", item.productId),
        orderBy("expiryDate")
      );
      const snap = await getDocs(q);
      perProductBatchIds[item.productId] = snap.docs.map((d) => d.id);
    }

    await runTransaction(db, async (tx) => {
      // For each line item, walk its batches in expiry order and decrement.
      for (const item of data.items) {
        let remaining = item.quantity;
        const batchIds = perProductBatchIds[item.productId] || [];
        const updates: { ref: ReturnType<typeof doc>; qty: number }[] = [];

        for (const batchId of batchIds) {
          if (remaining <= 0) break;
          const ref = doc(db, "organizations", organizationId, "stock", batchId);
          const batchSnap = await tx.get(ref);
          if (!batchSnap.exists()) continue;
          const available = batchSnap.data().quantity as number;
          if (available <= 0) continue;
          const take = Math.min(available, remaining);
          updates.push({ ref, qty: available - take });
          remaining -= take;
        }

        if (remaining > 0) {
          throw new Error(`Insufficient stock for ${item.productName}.`);
        }
        for (const u of updates) {
          tx.update(u.ref, { quantity: u.qty });
        }
      }

      tx.set(saleRef, {
        organizationId,
        branchId: data.branchId,
        cashierId: data.cashierId,
        cashierName: data.cashierName,
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        paymentMethod: data.paymentMethod,
        status: "completed",
        receiptNumber,
        createdAt: serverTimestamp(),
      });
    });

    return { saleId: saleRef.id, receiptNumber };
  },

  async getSale(organizationId: string, saleId: string): Promise<Sale | null> {
    const snap = await getDoc(doc(db, "organizations", organizationId, "sales", saleId));
    if (!snap.exists()) return null;
    return mapSale(snap.id, organizationId, snap.data());
  },

  // Recent sales, optionally scoped to a branch. Bounded by `max`.
  async getRecentSales(
    organizationId: string,
    branchId?: string,
    max = 25
  ): Promise<Sale[]> {
    const salesCol = collection(db, "organizations", organizationId, "sales");
    const q = branchId
      ? query(
          salesCol,
          where("branchId", "==", branchId),
          orderBy("createdAt", "desc"),
          fsLimit(max)
        )
      : query(salesCol, orderBy("createdAt", "desc"), fsLimit(max));
    const snap = await getDocs(q);
    return snap.docs.map((d) => mapSale(d.id, organizationId, d.data()));
  },

  // Aggregate sales since a given date (client-side sum over a bounded window).
  async getSalesSummary(
    organizationId: string,
    since: Date,
    branchId?: string
  ): Promise<{ total: number; count: number }> {
    const salesCol = collection(db, "organizations", organizationId, "sales");
    const sinceTs = Timestamp.fromDate(since);
    const q = branchId
      ? query(
          salesCol,
          where("branchId", "==", branchId),
          where("createdAt", ">=", sinceTs)
        )
      : query(salesCol, where("createdAt", ">=", sinceTs));
    const snap = await getDocs(q);
    let total = 0;
    snap.docs.forEach((d) => {
      total += (d.data().total as number) || 0;
    });
    return { total, count: snap.size };
  },
};

function mapSale(
  id: string,
  organizationId: string,
  data: Record<string, unknown>
): Sale {
  return {
    id,
    organizationId,
    branchId: data.branchId as string,
    cashierId: data.cashierId as string,
    cashierName: (data.cashierName as string) || "",
    items: (data.items as Sale["items"]) || [],
    subtotal: (data.subtotal as number) || 0,
    tax: (data.tax as number) || 0,
    total: (data.total as number) || 0,
    paymentMethod: (data.paymentMethod as Sale["paymentMethod"]) || "cash",
    status: (data.status as Sale["status"]) || "completed",
    receiptNumber: (data.receiptNumber as string) || "",
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
  };
}

// Re-export for callers that compute low stock elsewhere.
export type { StockBatch };
