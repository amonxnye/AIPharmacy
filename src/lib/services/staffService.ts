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

    // Also update the user's profile
    await updateDoc(doc(db, "users", data.userId), {
      organizationId,
      role: data.role,
      assignedBranches: data.assignedBranches,
    });

    return staffRef.id;
  },

  async getAll(organizationId: string): Promise<StaffMember[]> {
    const staffRef = collection(db, "organizations", organizationId, "staff");
    const snapshot = await getDocs(staffRef);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
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

    // Also update the user's profile
    const updateData: any = {};
    if (data.role) updateData.role = data.role;
    if (data.assignedBranches) updateData.assignedBranches = data.assignedBranches;
    
    if (Object.keys(updateData).length > 0) {
      await updateDoc(doc(db, "users", userId), updateData);
    }
  },

  async delete(organizationId: string, staffId: string, userId: string): Promise<void> {
    await deleteDoc(
      doc(db, "organizations", organizationId, "staff", staffId)
    );

    // Remove organization from user profile
    await updateDoc(doc(db, "users", userId), {
      organizationId: "",
      role: "owner",
      assignedBranches: [],
    });
  },
};
