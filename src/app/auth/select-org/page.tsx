"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, ArrowRight } from "lucide-react";

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { organizations, currentOrgId, switchOrganization, loading } = useAuth();

  useEffect(() => {
    // If already has a selected org, redirect to dashboard
    if (currentOrgId) {
      router.push("/dashboard");
    }

    // If user has no orgs or only one org, they shouldn't be on this page
    if (!loading && organizations.length <= 1) {
      router.push("/dashboard");
    }
  }, [currentOrgId, organizations, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSelectOrg = (orgId: string) => {
    switchOrganization(orgId);
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 mb-4">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Select Organization
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Choose which organization you want to access
          </p>
        </div>

        {/* Organization Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrg(org.id)}
              className="group relative flex flex-col items-center rounded-xl bg-white p-8 shadow-lg ring-1 ring-gray-900/5 transition-all hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            >
              {/* Organization Logo/Icon */}
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-20 w-20 rounded-lg object-cover mb-4"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-teal-100 mb-4">
                  <Building2 className="h-10 w-10 text-teal-600" />
                </div>
              )}

              {/* Organization Name */}
              <h3 className="text-center text-lg font-semibold text-gray-900 mb-2">
                {org.name}
              </h3>

              {/* Arrow Icon (appears on hover) */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <ArrowRight className="h-6 w-6 text-teal-600" />
              </div>
            </button>
          ))}
        </div>

        {/* Info Text */}
        <p className="mt-8 text-center text-xs text-gray-500">
          You can switch between organizations anytime from the header
        </p>
      </div>
    </div>
  );
}
