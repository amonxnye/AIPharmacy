"use client";

import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/types/user";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export default function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { currentMembership, loading } = useAuth();

  if (loading) return null;

  const userRole = currentMembership?.role;
  if (!userRole || !allowedRoles.includes(userRole)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">
            Access Restricted
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            You don&apos;t have permission to view this page. Contact your
            organization owner or manager to request access.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export const PAGE_ROLES: Record<string, UserRole[]> = {
  "/dashboard": ["owner", "manager", "pharmacist", "cashier", "inventory_officer"],
  "/inventory": ["owner", "manager", "pharmacist", "cashier", "inventory_officer"],
  "/pos": ["owner", "manager", "pharmacist", "cashier"],
  "/outlets": ["owner", "manager"],
  "/staff": ["owner", "manager"],
  "/settings": ["owner", "manager"],
};
