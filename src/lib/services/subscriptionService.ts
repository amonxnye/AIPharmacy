import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Subscription {
  id: string;
  organizationId: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "expired" | "cancelled";
  paymentReference: string;
  renewalEnabled: boolean;
  createdAt: Date;
}

export const subscriptionService = {
  async createSubscription(
    organizationId: string,
    startDate: Date,
    endDate: Date,
    paymentReference: string,
    renewalEnabled = false
  ): Promise<Subscription> {
    const subRef = doc(collection(db, "organizations", organizationId, "subscription"));
    const subscription: Subscription = {
      id: subRef.id,
      organizationId,
      startDate,
      endDate,
      status: "active",
      paymentReference,
      renewalEnabled,
      createdAt: new Date(),
    };

    await setDoc(subRef, {
      organizationId,
      startDate: Timestamp.fromDate(startDate),
      endDate: Timestamp.fromDate(endDate),
      status: "active",
      paymentReference,
      renewalEnabled,
      createdAt: Timestamp.now(),
    });

    return subscription;
  },

  async getActiveSubscription(organizationId: string): Promise<Subscription | null> {
    try {
      const subRef = doc(db, "organizations", organizationId, "subscription", organizationId);
      const subDoc = await getDoc(subRef);

      if (subDoc.exists()) {
        const data = subDoc.data();
        const subscription: Subscription = {
          id: subDoc.id,
          organizationId: data.organizationId,
          startDate: data.startDate?.toDate() || new Date(),
          endDate: data.endDate?.toDate() || new Date(),
          status: data.status,
          paymentReference: data.paymentReference,
          renewalEnabled: data.renewalEnabled || false,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
        return subscription;
      }
      return null;
    } catch {
      return null;
    }
  },

  async hasActiveSubscription(organizationId: string): Promise<boolean> {
    const subscription = await this.getActiveSubscription(organizationId);
    if (!subscription) return false;
    return new Date() <= subscription.endDate && subscription.status === "active";
  },

  async calculateEarnings(
    organizationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    try {
      const salesRef = collection(db, "organizations", organizationId, "sales");
      const q = query(
        salesRef,
        where("timestamp", ">=", Timestamp.fromDate(startDate)),
        where("timestamp", "<=", Timestamp.fromDate(endDate))
      );

      const snapshot = await getDocs(q);
      let total = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        total += data.total || 0;
      });

      return total;
    } catch {
      return 0;
    }
  },

  async getDailyEarnings(organizationId: string, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.calculateEarnings(organizationId, startOfDay, endOfDay);
  },

  async getMonthlyEarnings(organizationId: string, year: number, month: number): Promise<number> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    return this.calculateEarnings(organizationId, startOfMonth, endOfMonth);
  },

  isSubscriptionExpired(endDate: Date): boolean {
    return new Date() > endDate;
  },

  daysUntilExpiry(endDate: Date): number {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },
};
