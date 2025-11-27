export type UserRole = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";

export interface StaffMember {
  id: string;
  uid: string;
  email: string;
  name: string;
  phone?: string;
  organizationId: string;
  role: UserRole;
  assignedBranches: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateStaffData {
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  assignedBranches: string[];
  isActive: boolean;
}

export interface UpdateStaffData {
  name?: string;
  phone?: string;
  role?: UserRole;
  assignedBranches?: string[];
  isActive?: boolean;
}
