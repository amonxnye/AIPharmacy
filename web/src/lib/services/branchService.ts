import { 
  collection,
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  license: string;
  organizationId: string;
  createdAt: Date;
}

export interface CreateBranchData {
  name: string;
  address: string;
  phone: string;
  license: string;
}

export const branchService = {
  async create(organizationId: string, data: CreateBranchData): Promise<string> {
    const branchRef = doc(collection(db, "organizations", organizationId, "branches"));
    await setDoc(branchRef, {
      ...data,
      organizationId,
      createdAt: serverTimestamp(),
    });
    return branchRef.id;
  },

  async getAll(organizationId: string): Promise<Branch[]> {
    const branchesRef = collection(db, "organizations", organizationId, "branches");
    const snapshot = await getDocs(branchesRef);
    
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        license: data.license,
        organizationId: data.organizationId,
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });
  },

  async get(organizationId: string, branchId: string): Promise<Branch | null> {
    const branchDoc = await getDoc(
      doc(db, "organizations", organizationId, "branches", branchId)
    );
    
    if (!branchDoc.exists()) return null;

    const data = branchDoc.data();
    return {
      id: branchDoc.id,
      name: data.name,
      address: data.address,
      phone: data.phone,
      license: data.license,
      organizationId: data.organizationId,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  },

  async update(
    organizationId: string, 
    branchId: string, 
    data: Partial<CreateBranchData>
  ): Promise<void> {
    await updateDoc(
      doc(db, "organizations", organizationId, "branches", branchId),
      data
    );
  },

  async delete(organizationId: string, branchId: string): Promise<void> {
    await deleteDoc(
      doc(db, "organizations", organizationId, "branches", branchId)
    );
  },
};
