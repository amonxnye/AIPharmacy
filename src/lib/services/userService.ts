import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  GlobalUserProfile,
  Membership,
  OrgUserProfile,
} from "@/types/user";

export const userService = {
  // Get global user profile
  async getGlobalProfile(userId: string): Promise<GlobalUserProfile | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        uid: userSnap.id,
        displayName: data.displayName || "",
        email: data.email || "",
        phone: data.phone,
        photoUrl: data.photoUrl,
        memberships: data.memberships || [],
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        lastLoginAt: (data.lastLoginAt as Timestamp)?.toDate() || new Date(),
      };
    } catch (error) {
      console.error("Error getting global user profile:", error);
      return null;
    }
  },

  // Create or update global user profile
  async createOrUpdateGlobalProfile(
    userId: string,
    data: Partial<GlobalUserProfile>
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing
      await updateDoc(userRef, {
        ...data,
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Create new
      await setDoc(userRef, {
        uid: userId,
        displayName: data.displayName || "",
        email: data.email || "",
        phone: data.phone,
        photoUrl: data.photoUrl,
        memberships: data.memberships || [],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    }
  },

  // Add membership to user's global profile
  async addMembership(userId: string, membership: Membership): Promise<void> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update existing user
      const data = userSnap.data();
      const memberships = data.memberships || [];

      // Check if membership already exists
      const existingIndex = memberships.findIndex(
        (m: Membership) => m.organizationId === membership.organizationId
      );

      if (existingIndex >= 0) {
        // Update existing membership
        memberships[existingIndex] = membership;
      } else {
        // Add new membership
        memberships.push(membership);
      }

      await updateDoc(userRef, {
        memberships,
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Create new global profile with membership
      await setDoc(userRef, {
        uid: userId,
        displayName: "",
        email: "",
        memberships: [membership],
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    }
  },

  // Create organization-specific user profile
  async createOrgUserProfile(
    organizationId: string,
    profile: OrgUserProfile
  ): Promise<void> {
    const userRef = doc(
      db,
      "organizations",
      organizationId,
      "users",
      profile.userId
    );

    await setDoc(userRef, {
      userId: profile.userId,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      assignedOutletIds: profile.assignedOutletIds,
      status: profile.status,
      createdAt: serverTimestamp(),
      invitedBy: profile.invitedBy,
    });
  },

  // Get organization-specific user profile
  async getOrgUserProfile(
    organizationId: string,
    userId: string
  ): Promise<OrgUserProfile | null> {
    try {
      const userRef = doc(db, "organizations", organizationId, "users", userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return null;
      }

      const data = userSnap.data();
      return {
        userId: userSnap.id,
        email: data.email,
        name: data.name,
        role: data.role,
        assignedOutletIds: data.assignedOutletIds || [],
        status: data.status,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        invitedBy: data.invitedBy,
      };
    } catch (error) {
      console.error("Error getting org user profile:", error);
      return null;
    }
  },

  // Get organization info
  async getOrganization(organizationId: string): Promise<{ name: string; logo?: string } | null> {
    try {
      const orgRef = doc(db, "organizations", organizationId);
      const orgSnap = await getDoc(orgRef);

      if (!orgSnap.exists()) {
        return null;
      }

      const data = orgSnap.data();
      return {
        name: data.name || "Organization",
        logo: data.logo,
      };
    } catch (error) {
      console.error("Error getting organization:", error);
      return null;
    }
  },

  // Remove membership from user
  async removeMembership(
    userId: string,
    organizationId: string
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const memberships = (data.memberships || []).filter(
      (m: Membership) => m.organizationId !== organizationId
    );

    await updateDoc(userRef, {
      memberships,
    });
  },

  // Update membership role or outlets
  async updateMembership(
    userId: string,
    organizationId: string,
    updates: Partial<Membership>
  ): Promise<void> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const data = userSnap.data();
    const memberships = data.memberships || [];

    const membershipIndex = memberships.findIndex(
      (m: Membership) => m.organizationId === organizationId
    );

    if (membershipIndex >= 0) {
      memberships[membershipIndex] = {
        ...memberships[membershipIndex],
        ...updates,
      };

      await updateDoc(userRef, {
        memberships,
      });
    }
  },
};
