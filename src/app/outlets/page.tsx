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
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading outlets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outlets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pharmacy branches and locations
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700"
        >
          <Plus className="h-5 w-5" />
          Add Outlet
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search outlets by name or address..."
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 sm:w-64">
        <div className="inline-flex rounded-lg bg-teal-500 p-3">
          <Building2 className="h-6 w-6 text-white" />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-600">Total Outlets</p>
          <p className="mt-1 text-2xl font-bold text-gray-900 tabular-nums">{branches.length}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No outlets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try adjusting your search" : "Get started by adding your first outlet"}
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
              className="group rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5 transition-all hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-100 p-2.5">
                    <Building2 className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{branch.name}</h3>
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={() => openEdit(branch)} className="rounded p-1.5 text-blue-600 hover:bg-blue-50" title="Edit">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(branch)}
                    disabled={busyId === branch.id}
                    className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {branch.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
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
