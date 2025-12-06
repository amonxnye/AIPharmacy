"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { staffService, type StaffMember } from "@/lib/services/staffService";
import InviteStaffModal from "@/components/modals/InviteStaffModal";
import {
  Plus,
  Search,
  Users,
  Shield,
  Building2,
  Mail,
  Phone,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const roleColors = {
  owner: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  pharmacist: "bg-green-100 text-green-700",
  cashier: "bg-yellow-100 text-yellow-700",
  inventory_officer: "bg-orange-100 text-orange-700",
};

const roleLabels = {
  owner: "Owner",
  manager: "Manager",
  pharmacist: "Pharmacist",
  cashier: "Cashier",
  inventory_officer: "Inventory Officer",
};

export default function StaffPage() {
  const { userProfile } = useAuth();
  const { branches } = useOrganization();
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    loadStaff();
  }, [userProfile?.organizationId]);

  const loadStaff = async () => {
    if (!userProfile?.organizationId) return;

    setLoading(true);
    try {
      const data = await staffService.getAll(userProfile.organizationId);
      setStaffMembers(data);
    } catch (error) {
      console.error("Error loading staff:", error);
    } finally {
      setLoading(false);
    }
  };

  const getBranchNames = (branchIds: string[]) => {
    return branchIds
      .map((id) => branches.find((b) => b.id === id)?.name)
      .filter(Boolean)
      .join(", ");
  };

  const filteredStaff = staffMembers.filter((staff) => {
    const matchesSearch =
      staff.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || staff.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleStats = {
    owner: staffMembers.filter((s) => s.role === "owner").length,
    manager: staffMembers.filter((s) => s.role === "manager").length,
    pharmacist: staffMembers.filter((s) => s.role === "pharmacist").length,
    cashier: staffMembers.filter((s) => s.role === "cashier").length,
    inventory_officer: staffMembers.filter((s) => s.role === "inventory_officer")
      .length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff members...</p>
        </div>
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
          Add Staff Member
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
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
          <option value="owner">Owner</option>
          <option value="manager">Manager</option>
          <option value="pharmacist">Pharmacist</option>
          <option value="cashier">Cashier</option>
          <option value="inventory_officer">Inventory Officer</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-purple-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Total Staff</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {staffMembers.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-blue-500 p-3">
              <Shield className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Managers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {roleStats.manager}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-green-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Pharmacists</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {roleStats.pharmacist}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-yellow-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Cashiers</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {roleStats.cashier}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-orange-500 p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Inventory</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {roleStats.inventory_officer}
            </p>
          </div>
        </div>
      </div>

      {/* Staff Grid */}
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
                : "Get started by adding your first staff member"}
            </p>
            {!searchTerm && roleFilter === "all" && (
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
                <Plus className="h-4 w-4" />
                Add Staff Member
              </button>
            )}
          </div>
        ) : (
          filteredStaff.map((staff) => (
            <div
              key={staff.id}
              className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md"
            >
              {/* Staff Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600 font-semibold text-lg">
                    {staff.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {staff.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        roleColors[staff.role]
                      }`}
                    >
                      {roleLabels[staff.role]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button className="rounded p-1.5 text-blue-600 hover:bg-blue-50">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1.5 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Staff Details */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 truncate">{staff.email}</span>
                </div>
                {staff.assignedBranches.length > 0 && (
                  <div className="flex items-start gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-600 line-clamp-2">
                      {getBranchNames(staff.assignedBranches) ||
                        "No branches assigned"}
                    </span>
                  </div>
                )}
              </div>

              {/* Staff Stats */}
              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="text-xs text-gray-500">
                  Joined {staff.createdAt.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Active
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Invite Staff Modal */}
      <InviteStaffModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => loadStaff()}
      />
    </div>
  );
}
