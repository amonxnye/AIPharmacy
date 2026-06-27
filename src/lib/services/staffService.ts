import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { userService } from "./userService";
import type { Membership } from "@/types/user";

export type StaffRole = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";

export interface StaffMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
  assignedBranches: string[];
  organizationId: string;
  createdAt: Date;
}

export interface CreateStaffData {
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
  assignedBranches: string[];
}

export const staffService = {
  async create(organizationId: string, data: CreateStaffData): Promise<string> {
    const staffRef = doc(collection(db, "organizations", organizationId, "staff"));
    await setDoc(staffRef, {
      ...data,
      organizationId,
      createdAt: serverTimestamp(),
    });

    await userService.addMembership(data.userId, {
      organizationId,
      role: data.role,
      assignedOutletIds: data.assignedBranches,
      joinedAt: new Date(),
    });

    return staffRef.id;
  },

  async getAll(organizationId: string): Promise<StaffMember[]> {
    const staffRef = collection(db, "organizations", organizationId, "staff");
    const snapshot = await getDocs(staffRef);

    return snapshot.docs.map((staffDoc) => {
      const data = staffDoc.data();
      return {
        id: staffDoc.id,
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        assignedBranches: data.assignedBranches || [],
        organizationId: data.organizationId,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  },

  async get(organizationId: string, staffId: string): Promise<StaffMember | null> {
    const staffDoc = await getDoc(
      doc(db, "organizations", organizationId, "staff", staffId)
    );

    if (!staffDoc.exists()) return null;

    const data = staffDoc.data();
    return {
      id: staffDoc.id,
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
      assignedBranches: data.assignedBranches || [],
      organizationId: data.organizationId,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  },

  async update(
    organizationId: string,
    staffId: string,
    userId: string,
    data: Partial<Omit<CreateStaffData, 'userId' | 'email'>>
  ): Promise<void> {
    await updateDoc(
      doc(db, "organizations", organizationId, "staff", staffId),
      data
    );

    const membershipUpdates: Partial<Membership> = {};
    if (data.role) membershipUpdates.role = data.role;
    if (data.assignedBranches) membershipUpdates.assignedOutletIds = data.assignedBranches;

    if (Object.keys(membershipUpdates).length > 0) {
      await userService.updateMembership(userId, organizationId, membershipUpdates);
    }
  },

  async delete(organizationId: string, staffId: string, userId: string): Promise<void> {
    await deleteDoc(
      doc(db, "organizations", organizationId, "staff", staffId)
    );

    await userService.removeMembership(userId, organizationId);
  },
};
