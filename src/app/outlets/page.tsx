"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization, type Branch } from "@/contexts/OrganizationContext";
import { branchService } from "@/lib/services/branchService";
import OutletModal from "@/components/modals/OutletModal";
import {
  Plus,
  Search,
  Building2,
  MapPin,
  Phone,
  FileText,
  Edit,
  Trash2,
} from "lucide-react";

export default function OutletsPage() {
  const { userProfile } = useAuth();
  const { branches, loading, refreshBranches } = useOrganization();
  const orgId = userProfile?.organizationId;

  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (branch: Branch) => {
    setEditing(branch);
    setModalOpen(true);
  };

  const handleDelete = async (branch: Branch) => {
    if (!orgId) return;
    if (userProfile?.role !== "owner" && userProfile?.role !== "manager") {
      alert("Only owners and managers can delete outlets.");
      return;
    }
    if (!confirm(`Delete "${branch.name}"? Staff assigned only to this outlet will lose access.`)) return;
    setBusyId(branch.id);
    try {
      await branchService.delete(orgId, branch.id);
      await refreshBranches();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(message.includes("permission") ? "You don't have permission to delete this outlet." : "Could not delete this outlet. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-sm text-gray-500">Loading outlets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Outlets</h1>
          <p className="mt-1 text-sm text-gray-500 tabular-nums">
            {branches.length} location{branches.length === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          <Plus className="h-4 w-4" />
          Add Outlet
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or address"
          className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.length === 0 ? (
          <div className="col-span-full rounded-lg border border-gray-200 bg-white p-12 text-center">
            <Building2 className="mx-auto h-8 w-8 text-gray-300" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No outlets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "No outlet matches that search." : "Add an outlet to start selling and tracking stock."}
            </p>
            {!searchTerm && (
              <button
                onClick={openAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <Plus className="h-4 w-4" />
                Add Outlet
              </button>
            )}
          </div>
        ) : (
          filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="group rounded-lg border border-gray-200 bg-white p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{branch.name}</h3>
                  <p className="mt-1 text-xs text-gray-500">Active</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                  <button onClick={() => openEdit(branch)} className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    disabled={busyId === branch.id}
                    className="rounded p-2 text-gray-400 hover:bg-gray-100 hover:text-red-700 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {branch.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />

                    <span className="text-gray-600">{branch.address}</span>
                  </div>
                )}
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{branch.phone}</span>
                  </div>
                )}
                {branch.license && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">License: {branch.license}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && orgId && (
        <OutletModal
          orgId={orgId}
          outlet={editing}
          onClose={() => setModalOpen(false)}
          onSaved={async () => {
            setModalOpen(false);
            await refreshBranches();
          }}
        />
      )}
    </div>
  );
}
