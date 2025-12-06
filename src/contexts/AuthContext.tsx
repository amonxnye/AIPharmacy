"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  UserCredential
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { GlobalUserProfile, Membership, UserRole } from "@/types/user";

// Legacy interface for backward compatibility
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  organizationId: string;
  role: UserRole;
  assignedBranches: string[];
  createdAt: Date;
}

// Organization info for context
interface OrganizationInfo {
  id: string;
  name: string;
  logo?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;  // Legacy - will be deprecated
  globalProfile: GlobalUserProfile | null;  // New multi-org profile
  currentOrgId: string | null;  // Currently selected organization
  currentMembership: Membership | null;  // Current org membership
  organizations: OrganizationInfo[];  // User's organizations
  loading: boolean;
  signIn: (email: string, password: string) => Promise<UserCredential>;
  signUp: (email: string, password: string, name: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  switchOrganization: (orgId: string) => void;  // New
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);  // Legacy
  const [globalProfile, setGlobalProfile] = useState<GlobalUserProfile | null>(null);
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUserProfile = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (!userDoc.exists()) return;

      const data = userDoc.data();

      // Check if user has new multi-org structure
      if (data.memberships && Array.isArray(data.memberships)) {
        // New multi-org user
        const profile: GlobalUserProfile = {
          uid,
          displayName: data.displayName || data.name || "",
          email: data.email,
          phone: data.phone,
          photoUrl: data.photoUrl,
          memberships: data.memberships.map((m: any) => ({
            organizationId: m.organizationId,
            role: m.role,
            assignedOutletIds: m.assignedOutletIds || [],
            joinedAt: m.joinedAt?.toDate() || new Date(),
          })),
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: new Date(),
        };

        setGlobalProfile(profile);

        // Load organization info for all memberships
        const orgInfos: OrganizationInfo[] = [];
        for (const membership of profile.memberships) {
          try {
            const orgDoc = await getDoc(doc(db, "organizations", membership.organizationId));
            if (orgDoc.exists()) {
              const orgData = orgDoc.data();
              orgInfos.push({
                id: orgDoc.id,
                name: orgData.name,
                logo: orgData.logo || orgData.logoUrl,
              });
            }
          } catch (error) {
            console.error(`Error loading org ${membership.organizationId}:`, error);
          }
        }
        setOrganizations(orgInfos);

        // Set current org from localStorage or first membership
        const savedOrgId = typeof window !== "undefined" ? localStorage.getItem("currentOrgId") : null;
        const initialOrgId = savedOrgId && profile.memberships.find(m => m.organizationId === savedOrgId)
          ? savedOrgId
          : profile.memberships[0]?.organizationId || null;

        if (initialOrgId) {
          const membership = profile.memberships.find(m => m.organizationId === initialOrgId);
          setCurrentOrgId(initialOrgId);
          setCurrentMembership(membership || null);

          // Create legacy userProfile for backward compatibility
          setUserProfile({
            uid,
            email: profile.email,
            name: profile.displayName,
            organizationId: initialOrgId,
            role: membership?.role || "owner",
            assignedBranches: membership?.assignedOutletIds || [],
            createdAt: profile.createdAt,
          });
        }
      } else {
        // Legacy single-org user - migrate to new structure
        const legacyProfile: UserProfile = {
          uid,
          email: data.email,
          name: data.name,
          organizationId: data.organizationId || "",
          role: data.role,
          assignedBranches: data.assignedBranches || [],
          createdAt: data.createdAt?.toDate() || new Date(),
        };

        setUserProfile(legacyProfile);

        // Convert to new structure
        if (legacyProfile.organizationId) {
          const membership: Membership = {
            organizationId: legacyProfile.organizationId,
            role: legacyProfile.role,
            assignedOutletIds: legacyProfile.assignedBranches,
            joinedAt: legacyProfile.createdAt,
          };

          setGlobalProfile({
            uid,
            displayName: legacyProfile.name,
            email: legacyProfile.email,
            memberships: [membership],
            createdAt: legacyProfile.createdAt,
            lastLoginAt: new Date(),
          });

          setCurrentOrgId(legacyProfile.organizationId);
          setCurrentMembership(membership);

          // Load org info
          try {
            const orgDoc = await getDoc(doc(db, "organizations", legacyProfile.organizationId));
            if (orgDoc.exists()) {
              const orgData = orgDoc.data();
              setOrganizations([{
                id: orgDoc.id,
                name: orgData.name,
                logo: orgData.logo || orgData.logoUrl,
              }]);
            }
          } catch (error) {
            console.error("Error loading organization:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, name: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user profile in Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email,
      name,
      createdAt: new Date(),
      organizationId: "", // Will be set during onboarding
      role: "owner",
      assignedBranches: [],
    });

    return userCredential;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
    setGlobalProfile(null);
    setCurrentOrgId(null);
    setCurrentMembership(null);
    setOrganizations([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentOrgId");
    }
  };

  const switchOrganization = (orgId: string) => {
    if (!globalProfile) return;

    const membership = globalProfile.memberships.find(m => m.organizationId === orgId);
    if (!membership) {
      console.error(`User is not a member of organization ${orgId}`);
      return;
    }

    setCurrentOrgId(orgId);
    setCurrentMembership(membership);

    // Update legacy userProfile for backward compatibility
    setUserProfile({
      uid: globalProfile.uid,
      email: globalProfile.email,
      name: globalProfile.displayName,
      organizationId: orgId,
      role: membership.role,
      assignedBranches: membership.assignedOutletIds,
      createdAt: globalProfile.createdAt,
    });

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("currentOrgId", orgId);
    }

    console.log(`Switched to organization: ${orgId}`);
  };

  const refreshUserProfile = async () => {
    if (user) {
      await loadUserProfile(user.uid);
    }
  };

  const value = {
    user,
    userProfile,
    globalProfile,
    currentOrgId,
    currentMembership,
    organizations,
    loading,
    signIn,
    signUp,
    signOut,
    switchOrganization,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
