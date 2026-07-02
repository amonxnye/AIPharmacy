import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { userService } from "./userService";
import type { Membership, UserRole } from "@/types/user";

export type StaffRole = UserRole;

// A staff member is an org-side membership record living at
// organizations/{orgId}/users/{uid} — the same authoritative doc the security
// rules use. There is no separate `staff` collection anymore.
export interface StaffMember {
  id: string; // the user's uid
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
  assignedBranches: string[];
  organizationId: string;
  status: "active" | "invited" | "suspended";
  createdAt: Date;
}

export const staffService = {
  async getAll(organizationId: string): Promise<StaffMember[]> {
    const usersRef = collection(db, "organizations", organizationId, "users");
    const snapshot = await getDocs(usersRef);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        userId: data.userId || d.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role,
        assignedBranches: data.assignedOutletIds || [],
        organizationId,
        status: data.status || "active",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  },

  async get(organizationId: string, userId: string): Promise<StaffMember | null> {
    const snap = await getDoc(doc(db, "organizations", organizationId, "users", userId));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      id: snap.id,
      userId: data.userId || snap.id,
      name: data.name || "",
      email: data.email || "",
      role: data.role,
      assignedBranches: data.assignedOutletIds || [],
      organizationId,
      status: data.status || "active",
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  },

  // Update a member's role and/or outlet assignments. Writes both the
  // authoritative org-side record and the user's global membership cache.
  async update(
    organizationId: string,
    userId: string,
    data: { role?: StaffRole; assignedBranches?: string[] }
  ): Promise<void> {
    const orgUpdate: Record<string, unknown> = {};
    if (data.role) orgUpdate.role = data.role;
    if (data.assignedBranches) orgUpdate.assignedOutletIds = data.assignedBranches;

    if (Object.keys(orgUpdate).length > 0) {
      await updateDoc(doc(db, "organizations", organizationId, "users", userId), orgUpdate);
    }

    const membershipUpdate: Partial<Membership> = {};
    if (data.role) membershipUpdate.role = data.role;
    if (data.assignedBranches) membershipUpdate.assignedOutletIds = data.assignedBranches;
    if (Object.keys(membershipUpdate).length > 0) {
      await userService.updateMembership(userId, organizationId, membershipUpdate).catch((err) => {
        // The member's global cache is only writable by that member; owners
        // updating someone else's role can't touch it. Non-fatal — the
        // authoritative org record is already updated.
        console.warn("Could not sync membership cache:", err);
      });
    }
  },

  // Remove a member from the organization.
  async delete(organizationId: string, userId: string): Promise<void> {
    await deleteDoc(doc(db, "organizations", organizationId, "users", userId));
    await userService.removeMembership(userId, organizationId).catch((err) => {
      console.warn("Could not sync membership cache:", err);
    });
  },
};
