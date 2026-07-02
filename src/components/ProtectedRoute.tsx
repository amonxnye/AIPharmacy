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
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
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
