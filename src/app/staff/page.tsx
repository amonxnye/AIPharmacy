"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { staffService, type StaffMember } from "@/lib/services/staffService";
import { inviteService } from "@/lib/services/inviteService";
import type { Invite } from "@/types/invite";
import type { UserRole } from "@/types/user";
import InviteStaffModal from "@/components/modals/InviteStaffModal";
import {
  Plus,
  Search,
  Users,
  Building2,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  X,
  Loader2,
} from "lucide-react";

const roleColors: Record<UserRole, string> = {
  owner: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  pharmacist: "bg-green-100 text-green-700",
  cashier: "bg-yellow-100 text-yellow-700",
  inventory_officer: "bg-orange-100 text-orange-700",
};

const roleLabels: Record<UserRole, string> = {
  owner: "Owner",
  manager: "Manager",
  pharmacist: "Pharmacist",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
};

export default function StaffPage() {
  const { userProfile, globalProfile, currentMembership } = useAuth();
  const { branches } = useOrganization();
  const orgId = userProfile?.organizationId;

  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [pendingInvites, setPendingInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const isOwner = currentMembership?.role === "owner";

  const loadAll = useCallback(async () => {
    if (!orgId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [members, invites] = await Promise.all([
        staffService.getAll(orgId),
        inviteService.getPendingInvites(orgId).catch(() => []),
      ]);
      setStaffMembers(members);
      setPendingInvites(invites);
    } catch {
      // Silent failure, show empty lists
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const getBranchNames = (branchIds: string[]) =>
    branchIds
      .map((id) => branches.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(", ");

  const handleRemove = async (member: StaffMember) => {
    if (!orgId) return;
    if (member.userId === (globalProfile?.uid || userProfile?.uid)) {
      alert("You can't remove yourself.");
      return;
    }
    if (member.role === "owner") {
      alert("The organization owner can't be removed.");
      return;
    }
    if (!confirm(`Remove ${member.name || member.email} from this organization?`)) return;
    setBusyId(member.id);
    try {
      await staffService.delete(orgId, member.userId);
      await loadAll();
    } catch {
      alert("Could not remove this member. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (invite: Invite) => {
    if (!orgId) return;
    if (!confirm(`Revoke the invitation for ${invite.email}?`)) return;
    setBusyId(invite.id);
    try {
      await inviteService.revokeInvite(orgId, invite.id, invite.inviteToken);
      await loadAll();
    } catch {
      alert("Could not revoke this invitation. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your team members and their roles
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          Invite Staff Member
        </button>
      </div>

      {/* Search / filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <option value="all">All Roles</option>
          {Object.entries(roleLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Invitations ({pendingInvites.length})
          </h2>
          <div className="space-y-2">
            {pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
              >
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{invite.email}</p>
                    <p className="text-xs text-gray-500">
                      {roleLabels[invite.role]} · expires{" "}
                      {invite.expiresAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRevoke(invite)}
                  disabled={busyId === invite.id}
                  className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredStaff.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No staff members found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || roleFilter !== "all"
                ? "Try adjusting your filters"
                : "Invite your first team member to get started"}
            </p>
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-lg font-semibold text-teal-600">
                    {(staff.name || staff.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {staff.name || staff.email.split("@")[0]}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${roleColors[staff.role]}`}
                    >
                      {roleLabels[staff.role]}
                    </span>
                  </div>
                </div>
                {staff.role !== "owner" && (
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => setEditing(staff)}
                      className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                      title="Edit role & outlets"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemove(staff)}
                      disabled={busyId === staff.id}
                      className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="truncate text-gray-600">{staff.email}</span>
                </div>
                {staff.assignedBranches.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="mt-0.5 h-4 w-4 text-gray-400" />
                    <span className="line-clamp-2 text-gray-600">
                      {getBranchNames(staff.assignedBranches) || "No outlets assigned"}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500">
                  Joined {staff.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  {staff.status === "active" ? "Active" : staff.status}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <InviteStaffModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={loadAll}
      />

      {editing && orgId && (
        <EditStaffModal
          member={editing}
          orgId={orgId}
          branches={branches}
          canChangeRole={isOwner || currentMembership?.role === "manager"}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null);
            await loadAll();
          }}
        />
      )}
    </div>
  );
}

// ---- Edit modal ----

function EditStaffModal({
  member,
  orgId,
  branches,
  canChangeRole,
  onClose,
  onSaved,
}: {
  member: StaffMember;
  orgId: string;
  branches: { id: string; name: string }[];
  canChangeRole: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [role, setRole] = useState<UserRole>(member.role);
  const [outlets, setOutlets] = useState<string[]>(member.assignedBranches);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) =>
    setOutlets((prev) => (prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]));

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await staffService.update(orgId, member.userId, {
        role,
        assignedBranches: outlets,
      });
      onSaved();
    } catch (err) {
      console.error(err);
      setError("Could not save changes.");
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Edit {member.name || member.email}
          </h2>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={!canChangeRole}
          className="mb-4 w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:bg-gray-50"
        >
          {(Object.entries(roleLabels) as [UserRole, string][])
            .filter(([value]) => value !== "owner")
            .map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
        </select>

        <label className="mb-2 block text-sm font-medium text-gray-700">Assigned outlets</label>
        <div className="mb-6 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
          {branches.length === 0 ? (
            <p className="text-sm text-gray-500">No outlets available.</p>
          ) : (
            branches.map((b) => (
              <label key={b.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={outlets.includes(b.id)}
                  onChange={() => toggle(b.id)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-900">{b.name}</span>
              </label>
            ))
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
