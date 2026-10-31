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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Select Organization
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Choose which organization you want to access
          </p>
        </div>

        {/* Organization Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => handleSelectOrg(org.id)}
              className="group relative flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-6 text-left hover:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
            >
              {/* Organization Logo/Icon */}
              {org.logo ? (
                <img
                  src={org.logo}
                  alt={org.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <Building2 className="h-6 w-6 shrink-0 text-gray-400" />
              )}

              {/* Organization Name */}
              <h3 className="flex-1 text-sm font-semibold text-gray-900">
                {org.name}
              </h3>

              {/* Arrow Icon (appears on hover) */}
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-teal-700" />

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
