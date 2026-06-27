"use client";

import { useEffect, useState } from "react";
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
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setRedirecting(true);
        router.replace("/auth/login");
      } else if (requireOrganization && !userProfile?.organizationId) {
        setRedirecting(true);
        router.replace("/onboarding/organization");
      }
    }
  }, [user, userProfile, loading, requireOrganization, router]);

  if (loading || redirecting) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />;
  }

  if (requireOrganization && !userProfile?.organizationId) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
