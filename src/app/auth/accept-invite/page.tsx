"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { inviteService } from "@/lib/services/inviteService";
import { userService } from "@/lib/services/userService";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { sendEmailVerification } from "firebase/auth";
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

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUserProfile } = useAuth();

  const [invite, setInvite] = useState<Invite | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadInvite = useCallback(async () => {
    const token = searchParams.get("token");

    if (!token) {
      setError("Invalid invitation link. No token provided.");
      setLoading(false);
      return;
    }

    if (!inviteService.isValidTokenFormat(token)) {
      setError("Invalid invitation link. The token format is incorrect.");
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

      const { invite: inviteData, orgId: organizationId, organizationName } = result;

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

      // The organization name comes from the token doc (the invitee is not yet
      // a member, so they cannot read the organization document directly).
      setOrgName(organizationName);
      setInvite(inviteData);
      setOrgId(organizationId);
      setLoading(false);
    } catch {
      setError("Failed to load invitation. Please try again.");
      setLoading(false);
    }
  }, [searchParams, user]);

  useEffect(() => {
    loadInvite();
  }, [loadInvite]);

  const handleAcceptInvite = async () => {
    if (!invite || !orgId || !user) return;

    // Accepting an invite proves control of the invited email address, so the
    // account's email must be verified (the security rules require it too).
    if (!user.emailVerified) {
      setError(
        "Please verify your email address first. We've sent you a verification link — click it, then reload this page."
      );
      try {
        await sendEmailVerification(user);
      } catch {
        /* non-fatal */
      }
      return;
    }

    setAccepting(true);
    setError(null);

    try {
      const token = invite.inviteToken;

      // Step 1: Create the authoritative org-side membership record. It carries
      // the invite token so the security rule can verify this is a legitimate
      // self-service join. The rule also prevents overwriting an existing
      // membership, so a second acceptance simply fails.
      await setDoc(doc(db, "organizations", orgId, "users", user.uid), {
        userId: user.uid,
        email: user.email || invite.email,
        name: user.displayName || user.email?.split("@")[0] || "User",
        role: invite.role,
        assignedOutletIds: invite.assignedOutletIds,
        status: "active",
        inviteToken: token,
        invitedBy: invite.invitedBy,
        createdAt: serverTimestamp(),
      });

      // Step 2: Mirror it into the global profile (client convenience cache).
      await userService.addMembership(user.uid, {
        organizationId: orgId,
        role: invite.role,
        assignedOutletIds: invite.assignedOutletIds,
        joinedAt: new Date(),
      });

      // Step 3: Mark the invite accepted so the token can't be reused.
      await inviteService.acceptInvite(orgId, invite.id, token, user.uid);

      await refreshUserProfile();
      setSuccess(true);

      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error accepting invite:", err);
      setError(
        "Failed to accept invitation. It may already be used, or your email isn't verified yet."
      );
      setAccepting(false);
    }
  };

  const handleSignIn = () => {
    const token = searchParams.get("token") || "";
    const redirect = encodeURIComponent(`/auth/accept-invite?token=${token}`);
    router.push(`/auth/login?redirect=${redirect}`);
  };

  const handleSignUp = () => {
    const token = searchParams.get("token") || "";
    const redirect = encodeURIComponent(`/auth/accept-invite?token=${token}`);
    router.push(`/auth/register?redirect=${redirect}&email=${encodeURIComponent(invite?.email || "")}`);
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
              You&apos;ve successfully joined {orgName}. Redirecting to dashboard...
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
              You&apos;re Invited!
            </h2>
            <p className="mt-2 text-gray-600">
              You&apos;ve been invited to join <strong>{orgName}</strong>
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
            You&apos;ve been invited to join the team!
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
            By accepting, you&apos;ll gain access to {orgName} and its assigned
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

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50">
          <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
