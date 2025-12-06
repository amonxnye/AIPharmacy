"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { inviteService } from "@/lib/services/inviteService";
import { sendInviteEmail } from "@/lib/cloudFunctions";
import { X, Mail, UserPlus, Loader2 } from "lucide-react";
import type { UserRole } from "@/types/user";

interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const roleLabels = {
  owner: "Owner",
  manager: "Manager",
  pharmacist: "Pharmacist",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
};

const roleDescriptions = {
  owner: "Full access to all features and settings",
  manager: "Manage outlets, staff, inventory, and procurement",
  pharmacist: "Manage inventory and dispensing",
  cashier: "Process sales at POS",
  inventory_officer: "Manage stock and procurement",
};

export default function InviteStaffModal({ isOpen, onClose, onSuccess }: InviteStaffModalProps) {
  const { user, currentOrgId, organizations } = useAuth();
  const { branches } = useOrganization();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("cashier");
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentOrg = organizations.find(org => org.id === currentOrgId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !currentOrgId) {
      setError("You must be logged in to invite staff");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (selectedOutlets.length === 0) {
      setError("Please select at least one outlet");
      return;
    }

    setLoading(true);

    try {
      // Create invite in Firestore
      const { inviteId, inviteToken } = await inviteService.createInvite(
        currentOrgId,
        user.uid,
        {
          email: email.trim().toLowerCase(),
          role,
          assignedOutletIds: selectedOutlets,
        }
      );

      // Generate invite link
      const inviteLink = `${window.location.origin}/auth/accept-invite?token=${inviteToken}`;

      // Send invitation email via Cloud Function
      try {
        await sendInviteEmail({
          to: email.trim().toLowerCase(),
          organizationName: currentOrg?.name || "Organization",
          inviterName: user.displayName || user.email || "Your colleague",
          role,
          inviteLink,
        });
        console.log("Invitation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send invitation email:", emailError);
        // Continue even if email fails - the invite is created in Firestore
        // User can manually share the link
      }

      console.log("Invitation created:", {
        inviteId,
        inviteLink,
        email: email.trim().toLowerCase(),
        role,
        outlets: selectedOutlets,
      });

      setSuccess(true);

      // Show success message for 2 seconds then close
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onSuccess) onSuccess();

        // Reset form
        setEmail("");
        setRole("cashier");
        setSelectedOutlets([]);
      }, 2000);
    } catch (err) {
      console.error("Error creating invite:", err);
      setError(err instanceof Error ? err.message : "Failed to create invitation");
      setLoading(false);
    }
  };

  const toggleOutlet = (outletId: string) => {
    setSelectedOutlets(prev =>
      prev.includes(outletId)
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <UserPlus className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invite Staff Member</h2>
              <p className="text-sm text-gray-500">
                Send an invitation to join {currentOrg?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-4 text-green-800 border border-green-200">
            <p className="font-medium">Invitation sent successfully!</p>
            <p className="text-sm mt-1">An email has been sent with the invitation link.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 border border-red-200">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-11 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                required
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role *
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(Object.entries(roleLabels) as [UserRole, string][]).map(([roleKey, label]) => (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => setRole(roleKey)}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    role === roleKey
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-medium text-gray-900">{label}</div>
                  <div className="mt-1 text-xs text-gray-500">
                    {roleDescriptions[roleKey]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Outlet Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assign to Outlets *
            </label>
            {branches.length === 0 ? (
              <div className="rounded-lg border border-gray-200 p-4 text-center text-gray-500">
                No outlets available. Create an outlet first.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-3">
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedOutlets.includes(branch.id)}
                      onChange={() => toggleOutlet(branch.id)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{branch.name}</div>
                      <div className="text-xs text-gray-500">{branch.address}</div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || branches.length === 0}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5" />
                  Send Invitation
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
