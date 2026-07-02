"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthContext";

interface Organization {
  id: string;
  name: string;
  logo?: string;
  currency: string;
  taxRate: number;
  ownerId: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  createdAt: Date;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  license: string;
  organizationId: string;
  createdAt: Date;
}

interface OrganizationContextType {
  organization: Organization | null;
  branches: Branch[];
  selectedBranch: Branch | null;
  loading: boolean;
  setSelectedBranch: (branch: Branch | null) => void;
  refreshOrganization: () => Promise<void>;
  refreshBranches: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { userProfile } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrganization = async (orgId: string) => {
    try {
      const orgDoc = await getDoc(doc(db, "organizations", orgId));
      if (orgDoc.exists()) {
        const data = orgDoc.data();
        setOrganization({
          id: orgDoc.id,
          name: data.name,
          logo: data.logo,
          currency: data.currency,
          taxRate: data.taxRate,
          ownerId: data.ownerId,
          email: data.email,
          phone: data.phone,
          address: data.address,
          country: data.country,
          createdAt: data.createdAt?.toDate() || new Date(),
        });
      }
    } catch (error) {
      console.error("Error loading organization:", error);
    }
  };

  const loadBranches = async (orgId: string) => {
    try {
      const branchesRef = collection(db, "organizations", orgId, "branches");
      const branchesSnapshot = await getDocs(branchesRef);
      const branchesData = branchesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          address: data.address,
          phone: data.phone,
          license: data.license,
          organizationId: orgId,
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      });
      setBranches(branchesData);

      // Keep a still-valid selection; otherwise default to the first branch.
      setSelectedBranch((prev) =>
        prev && branchesData.find((b) => b.id === prev.id)
          ? prev
          : branchesData[0] || null
      );
    } catch (error) {
      console.error("Error loading branches:", error);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const orgId = userProfile?.organizationId;

    const loadData = async () => {
      if (orgId) {
        setLoading(true);
        // Clear any selection carried over from a previously active org so a
        // branch-scoped action can't target another tenant's branch.
        setSelectedBranch(null);
        await loadOrganization(orgId);
        if (!cancelled) await loadBranches(orgId);
        if (!cancelled) setLoading(false);
      } else {
        setOrganization(null);
        setBranches([]);
        setSelectedBranch(null);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [userProfile?.organizationId]);

  const refreshOrganization = async () => {
    if (userProfile?.organizationId) {
      await loadOrganization(userProfile.organizationId);
    }
  };

  const refreshBranches = async () => {
    if (userProfile?.organizationId) {
      await loadBranches(userProfile.organizationId);
    }
  };

  const value = {
    organization,
    branches,
    selectedBranch,
    loading,
    setSelectedBranch,
    refreshOrganization,
    refreshBranches,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error("useOrganization must be used within an OrganizationProvider");
  }
  return context;
}
