import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Invite, CreateInviteData } from "@/types/invite";

// Generate a secure random 64-char hex token (32 random bytes).
function generateInviteToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const inviteService = {
  // Create an invitation: writes both the org-scoped invite record and a
  // top-level token-lookup doc so the invitee can resolve it without listing
  // every organization.
  async createInvite(
    organizationId: string,
    invitedBy: string,
    organizationName: string,
    data: CreateInviteData
  ): Promise<{ inviteId: string; inviteToken: string }> {
    const inviteToken = generateInviteToken();
    const inviteRef = doc(collection(db, "organizations", organizationId, "invites"));

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const email = data.email.toLowerCase();

    await setDoc(inviteRef, {
      email,
      role: data.role,
      assignedOutletIds: data.assignedOutletIds,
      status: "pending",
      inviteToken,
      invitedBy,
      createdAt: serverTimestamp(),
      expiresAt: Timestamp.fromDate(expiresAt),
    });

    // Token-lookup doc (keyed by the secret token). Carries a copy of the
    // fields the invitee needs so they never touch the protected subcollection.
    await setDoc(doc(db, "inviteTokens", inviteToken), {
      orgId: organizationId,
      inviteId: inviteRef.id,
      email,
      role: data.role,
      assignedOutletIds: data.assignedOutletIds,
      organizationName,
      status: "pending",
      expiresAt: Timestamp.fromDate(expiresAt),
      createdAt: serverTimestamp(),
    });

    return { inviteId: inviteRef.id, inviteToken };
  },

  // Resolve an invite from its token via a single get-by-id (no scan).
  async getInviteByToken(
    token: string
  ): Promise<{ invite: Invite; orgId: string; organizationName: string } | null> {
    try {
      const tokenDoc = await getDoc(doc(db, "inviteTokens", token));
      if (!tokenDoc.exists()) return null;

      const t = tokenDoc.data();
      return {
        orgId: t.orgId,
        organizationName: t.organizationName || "Organization",
        invite: {
          id: t.inviteId,
          organizationId: t.orgId,
          email: t.email,
          role: t.role,
          assignedOutletIds: t.assignedOutletIds || [],
          status: t.status,
          inviteToken: token,
          invitedBy: t.invitedBy || "",
          createdAt: (t.createdAt as Timestamp)?.toDate() || new Date(),
          expiresAt: (t.expiresAt as Timestamp)?.toDate() || new Date(),
        },
      };
    } catch (error) {
      console.error("Error fetching invite by token:", error);
      return null;
    }
  },

  async getInvites(organizationId: string): Promise<Invite[]> {
    const invitesRef = collection(db, "organizations", organizationId, "invites");
    const snapshot = await getDocs(invitesRef);
    return snapshot.docs.map((d) => mapInvite(d.id, organizationId, d.data()));
  },

  async getPendingInvites(organizationId: string): Promise<Invite[]> {
    const invitesRef = collection(db, "organizations", organizationId, "invites");
    const q = query(invitesRef, where("status", "==", "pending"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => mapInvite(d.id, organizationId, d.data()));
  },

  // Mark an invite accepted on both the org record and the token-lookup doc.
  async acceptInvite(
    organizationId: string,
    inviteId: string,
    inviteToken: string,
    userId: string
  ): Promise<void> {
    await updateDoc(doc(db, "organizations", organizationId, "invites", inviteId), {
      status: "accepted",
      acceptedAt: serverTimestamp(),
      acceptedBy: userId,
    });
    // Best-effort: invalidate the token so it can't be reused.
    try {
      await updateDoc(doc(db, "inviteTokens", inviteToken), { status: "accepted" });
    } catch (err) {
      console.error("Could not invalidate invite token:", err);
    }
  },

  isInviteValid(invite: Invite): { valid: boolean; reason?: string } {
    if (invite.status !== "pending") {
      return { valid: false, reason: "This invitation has already been used or revoked." };
    }
    const expiresAt =
      invite.expiresAt instanceof Date ? invite.expiresAt : new Date(invite.expiresAt);
    if (isNaN(expiresAt.getTime()) || expiresAt < new Date()) {
      return { valid: false, reason: "This invitation has expired." };
    }
    return { valid: true };
  },

  isValidTokenFormat(token: string): boolean {
    return /^[a-f0-9]{64}$/.test(token);
  },

  // Revoke a pending invite: remove both the org record and the token doc.
  async revokeInvite(
    organizationId: string,
    inviteId: string,
    inviteToken: string
  ): Promise<void> {
    await deleteDoc(doc(db, "organizations", organizationId, "invites", inviteId));
    try {
      await deleteDoc(doc(db, "inviteTokens", inviteToken));
    } catch (err) {
      console.error("Could not delete invite token:", err);
    }
  },
};

function mapInvite(
  id: string,
  organizationId: string,
  data: Record<string, unknown>
): Invite {
  return {
    id,
    organizationId,
    email: data.email as string,
    role: data.role as Invite["role"],
    assignedOutletIds: (data.assignedOutletIds as string[]) || [],
    status: data.status as Invite["status"],
    inviteToken: data.inviteToken as string,
    invitedBy: data.invitedBy as string,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    expiresAt: (data.expiresAt as Timestamp)?.toDate() || new Date(),
    acceptedAt: data.acceptedAt ? (data.acceptedAt as Timestamp).toDate() : undefined,
    acceptedBy: data.acceptedBy as string | undefined,
  };
}
