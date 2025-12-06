import type { UserRole } from "./user";

export interface Invite {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  assignedOutletIds: string[];
  status: "pending" | "accepted" | "expired";
  inviteToken: string;  // Secure random token
  invitedBy: string;    // userId who sent the invite
  createdAt: Date;
  expiresAt: Date;      // 7 days from creation
  acceptedAt?: Date;
  acceptedBy?: string;  // userId who accepted
}

export interface CreateInviteData {
  email: string;
  role: UserRole;
  assignedOutletIds: string[];
}

export interface InviteEmailData {
  recipientEmail: string;
  recipientName?: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}
