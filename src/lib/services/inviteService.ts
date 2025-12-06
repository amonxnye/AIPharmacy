import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invite, CreateInviteData } from "@/types/invite";

// Generate a secure random token
function generateInviteToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

export const inviteService = {
  // Create a new invitation
  async createInvite(
    organizationId: string,
    invitedBy: string,
    data: CreateInviteData
  ): Promise<{ inviteId: string; inviteToken: string }> {
    const inviteToken = generateInviteToken();
    const inviteRef = doc(collection(db, "organizations", organizationId, "invites"));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const inviteData = {
      email: data.email.toLowerCase(),
      role: data.role,
      assignedOutletIds: data.assignedOutletIds,
      status: "pending",
      inviteToken,
      invitedBy,
      createdAt: serverTimestamp(),
      expiresAt,
    };

    await setDoc(inviteRef, inviteData);

    return {
      inviteId: inviteRef.id,
      inviteToken,
    };
  },

  // Get invite by token
  async getInviteByToken(token: string): Promise<{ invite: Invite; orgId: string } | null> {
    try {
      // Search across all organizations (not ideal, but necessary without top-level invites collection)
      // In production, consider a top-level invites collection with orgId reference
      const orgsSnapshot = await getDocs(collection(db, "organizations"));

      for (const orgDoc of orgsSnapshot.docs) {
        const invitesRef = collection(db, "organizations", orgDoc.id, "invites");
        const q = query(invitesRef, where("inviteToken", "==", token));
        const inviteSnapshot = await getDocs(q);

        if (!inviteSnapshot.empty) {
          const inviteDoc = inviteSnapshot.docs[0];
          const data = inviteDoc.data();

          return {
            invite: {
              id: inviteDoc.id,
              organizationId: orgDoc.id,
              email: data.email,
              role: data.role,
              assignedOutletIds: data.assignedOutletIds || [],
              status: data.status,
              inviteToken: data.inviteToken,
              invitedBy: data.invitedBy,
              createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
              expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
              acceptedAt: data.acceptedAt ? (data.acceptedAt as Timestamp).toDate() : undefined,
              acceptedBy: data.acceptedBy,
            },
            orgId: orgDoc.id,
          };
        }
      }

      return null;
    } catch (error) {
      console.error("Error fetching invite by token:", error);
      return null;
    }
  },

  // Get all invites for an organization
  async getInvites(organizationId: string): Promise<Invite[]> {
    const invitesRef = collection(db, "organizations", organizationId, "invites");
    const snapshot = await getDocs(invitesRef);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId,
        email: data.email,
        role: data.role,
        assignedOutletIds: data.assignedOutletIds || [],
        status: data.status,
        inviteToken: data.inviteToken,
        invitedBy: data.invitedBy,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
        acceptedAt: data.acceptedAt ? (data.acceptedAt as Timestamp).toDate() : undefined,
        acceptedBy: data.acceptedBy,
      };
    });
  },

  // Get pending invites for an organization
  async getPendingInvites(organizationId: string): Promise<Invite[]> {
    const invitesRef = collection(db, "organizations", organizationId, "invites");
    const q = query(invitesRef, where("status", "==", "pending"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        organizationId,
        email: data.email,
        role: data.role,
        assignedOutletIds: data.assignedOutletIds || [],
        status: data.status,
        inviteToken: data.inviteToken,
        invitedBy: data.invitedBy,
        createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
        expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
        acceptedAt: data.acceptedAt ? (data.acceptedAt as Timestamp).toDate() : undefined,
        acceptedBy: data.acceptedBy,
      };
    });
  },

  // Mark invite as accepted
  async acceptInvite(
    organizationId: string,
    inviteId: string,
    userId: string
  ): Promise<void> {
    const inviteRef = doc(db, "organizations", organizationId, "invites", inviteId);

    await updateDoc(inviteRef, {
      status: "accepted",
      acceptedAt: serverTimestamp(),
      acceptedBy: userId,
    });
  },

  // Mark invite as expired
  async expireInvite(organizationId: string, inviteId: string): Promise<void> {
    const inviteRef = doc(db, "organizations", organizationId, "invites", inviteId);

    await updateDoc(inviteRef, {
      status: "expired",
    });
  },

  // Check if invite is valid
  isInviteValid(invite: Invite): { valid: boolean; reason?: string } {
    if (invite.status !== "pending") {
      return { valid: false, reason: "Invite has already been used or expired" };
    }

    if (invite.expiresAt < new Date()) {
      return { valid: false, reason: "Invite has expired" };
    }

    return { valid: true };
  },
};
