"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { inviteService } from "@/lib/services/inviteService";
import { userService } from "@/lib/services/userService";
import type { Invite } from "@/types/invite";
import {
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  Building2,
  Loader2,
} from "lucide-react";

const roleLabels = {
  owner: "Owner",
  manager: "Manager",
  pharmacist: "Pharmacist",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
};

export default function AcceptInvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, globalProfile, refreshUserProfile } = useAuth();

  const [invite, setInvite] = useState<Invite | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadInvite();
  }, []);

  const loadInvite = async () => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Invalid invitation link. No token provided.");
      setLoading(false);
      return;
    }

    try {
      const result = await inviteService.getInviteByToken(token);

      if (!result) {
        setError("Invitation not found. It may have been deleted or expired.");
        setLoading(false);
        return;
      }

      const { invite: inviteData, orgId: organizationId } = result;

      // Validate invite
      const validation = inviteService.isInviteValid(inviteData);
      if (!validation.valid) {
        setError(validation.reason || "This invitation is no longer valid.");
        setLoading(false);
        return;
      }

      // Check if user's email matches invite email
      if (user && user.email?.toLowerCase() !== inviteData.email.toLowerCase()) {
        setError(
          `This invitation is for ${inviteData.email}. Please sign in with that email or create a new account.`
        );
        setLoading(false);
        return;
      }

      // Load organization name
      const orgDoc = await userService.getOrganization(organizationId);
      if (orgDoc) {
        setOrgName(orgDoc.name);
      }

      setInvite(inviteData);
      setOrgId(organizationId);
      setLoading(false);
    } catch (err) {
      console.error("Error loading invite:", err);
      setError("Failed to load invitation. Please try again.");
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!invite || !orgId || !user) return;

    setAccepting(true);
    setError(null);

    try {
      // Create or update user's membership
      await userService.addMembership(user.uid, {
        organizationId: orgId,
        role: invite.role,
        assignedOutletIds: invite.assignedOutletIds,
        joinedAt: new Date(),
      });

      // Create organization-specific user profile
      await userService.createOrgUserProfile(orgId, {
        userId: user.uid,
        email: user.email || invite.email,
        name: user.displayName || user.email?.split("@")[0] || "User",
        role: invite.role,
        assignedOutletIds: invite.assignedOutletIds,
        status: "active",
        createdAt: new Date(),
        invitedBy: invite.invitedBy,
      });

      // Mark invite as accepted
      await inviteService.acceptInvite(orgId, invite.id, user.uid);

      // Refresh user profile to get new membership
      await refreshUserProfile();

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError("Failed to accept invitation. Please try again.");
      setAccepting(false);
    }
  };

  const handleSignIn = () => {
    const token = searchParams.get("token");
    router.push(`/auth/login?redirect=/auth/accept-invite?token=${token}`);
  };

  const handleSignUp = () => {
    const token = searchParams.get("token");
    router.push(`/auth/signup?redirect=/auth/accept-invite?token=${token}&email=${invite?.email || ""}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-teal-600" />
          <p className="mt-4 text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              Welcome Aboard!
            </h2>
            <p className="mt-2 text-gray-600">
              You've successfully joined {orgName}. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
              <Mail className="h-8 w-8 text-teal-600" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              You're Invited!
            </h2>
            <p className="mt-2 text-gray-600">
              You've been invited to join <strong>{orgName}</strong>
            </p>

            {invite && (
              <div className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-gray-900">
                    {invite.email}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Role:</span>
                  <span className="font-medium text-gray-900">
                    {roleLabels[invite.role]}
                  </span>
                </div>
              </div>
            )}

            <p className="mt-6 text-sm text-gray-600">
              Please sign in or create an account to accept this invitation.
            </p>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSignIn}
                className="w-full rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUp}
                className="w-full rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-100">
            <Mail className="h-8 w-8 text-teal-600" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            Join {orgName}
          </h2>
          <p className="mt-2 text-gray-600">
            You've been invited to join the team!
          </p>

          {invite && (
            <div className="mt-6 space-y-4">
              <div className="rounded-lg bg-gray-50 p-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {invite.email}
                    </p>
                    <p className="text-xs text-gray-500">Your email</p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 text-left">
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {roleLabels[invite.role]}
                    </p>
                    <p className="text-xs text-gray-500">Your role</p>
                  </div>
                </div>
              </div>

              {invite.assignedOutletIds.length > 0 && (
                <div className="rounded-lg bg-gray-50 p-4 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {invite.assignedOutletIds.length} outlet(s) assigned
                      </p>
                      <p className="text-xs text-gray-500">Access locations</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-500">
            By accepting, you'll gain access to {orgName} and its assigned
            outlets.
          </p>

          <button
            onClick={handleAcceptInvite}
            disabled={accepting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 py-2.5 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {accepting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Accepting...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5" />
                Accept Invitation
              </>
            )}
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
