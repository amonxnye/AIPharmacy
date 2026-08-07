import {
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Organization {
  id: string;
  name: string;
  logo?: string;
  currency: string;
  taxRate: number;
  ownerId: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  createdAt: Date;
}

export interface CreateOrganizationData {
  name: string;
  logo?: string;
  currency: string;
  taxRate: number;
  ownerId: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
}

export const organizationService = {
  async create(data: CreateOrganizationData): Promise<string> {
    // Auto-generated IDs avoid the collision/overwrite risk of Date.now().
    const orgRef = await addDoc(collection(db, "organizations"), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return orgRef.id;
  },

  async get(orgId: string): Promise<Organization | null> {
    const orgDoc = await getDoc(doc(db, "organizations", orgId));
    if (!orgDoc.exists()) return null;

    const data = orgDoc.data();
    return {
      id: orgDoc.id,
      name: data.name,
      logo: data.logo,
      currency: data.currency,
      taxRate: data.taxRate,
      ownerId: data.ownerId,
      email: data.email,
      phone: data.phone,
      address: data.address,
      country: data.country,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  },

  async update(orgId: string, data: Partial<CreateOrganizationData>): Promise<void> {
    await updateDoc(doc(db, "organizations", orgId), data);
  },

  async delete(orgId: string): Promise<void> {
    await deleteDoc(doc(db, "organizations", orgId));
  },
};
