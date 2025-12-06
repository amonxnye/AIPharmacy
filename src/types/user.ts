// User role types
export type UserRole = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";

// Membership - represents user's role in a specific organization
export interface Membership {
  organizationId: string;
  role: UserRole;
  assignedOutletIds: string[];
  joinedAt: Date;
}

// Global user profile (stored in top-level users collection)
export interface GlobalUserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  memberships: Membership[];  // Can belong to multiple orgs
  createdAt: Date;
  lastLoginAt: Date;
}

// Organization-specific user data (stored in organizations/{orgId}/users)
export interface OrgUserProfile {
  userId: string;  // References auth uid
  email: string;
  name: string;
  role: UserRole;
  assignedOutletIds: string[];
  status: "active" | "invited" | "suspended";
  createdAt: Date;
  invitedBy?: string;
}

// Legacy type for backward compatibility (will be migrated)
export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  assignedBranches: string[];
  createdAt: Date;
}
