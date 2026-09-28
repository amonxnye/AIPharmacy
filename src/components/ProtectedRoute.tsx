"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOrganization?: boolean;
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 opacity-20 animate-pulse" />
            <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-teal-600 border-r-cyan-600 animate-spin" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Loading...</h2>
        <p className="mt-2 text-sm text-gray-600">Please wait while we prepare your pharmacy dashboard</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  requireOrganization = false
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login");
      } else if (requireOrganization && !userProfile?.organizationId) {
        router.replace("/onboarding/organization");
      }
    }
  }, [user, userProfile, loading, requireOrganization, router]);

  // Show the loading screen (not null) whenever we're not ready to render the
  // protected content — including the brief window while a redirect is in
  // flight — so there's no flash of missing content.
  if (loading || !user || (requireOrganization && !userProfile?.organizationId)) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
