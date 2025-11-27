"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Branch } from "@/contexts/OrganizationContext";
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
  const { organization, branches, refreshBranches } = useOrganization();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLoading(false);
  }, [branches]);

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-600 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading outlets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Outlets</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your pharmacy branches and locations
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white shadow-sm transition-all hover:bg-teal-700">
          <Plus className="h-5 w-5" />
          Add Outlet
        </button>
      </div>

      {/* Search Bar */}
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

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-teal-500 p-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Total Outlets</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {branches.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-green-500 p-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Active Outlets</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {branches.length}
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-blue-500 p-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-600">Locations</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {branches.length}
            </p>
          </div>
        </div>
      </div>

      {/* Outlets Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredBranches.length === 0 ? (
          <div className="col-span-full rounded-xl bg-white p-12 text-center shadow-sm ring-1 ring-gray-900/5">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">
              No outlets found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search"
                : "Get started by adding your first outlet"}
            </p>
            {!searchTerm && (
              <button className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700">
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
              {/* Branch Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-teal-100 p-2.5">
                    <Building2 className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {branch.name}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                      Active
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

              {/* Branch Details */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <span className="text-gray-600">{branch.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{branch.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">License: {branch.license}</span>
                </div>
              </div>

              {/* Branch Stats */}
              <div className="mt-4 flex gap-4 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-500">Staff</p>
                  <p className="text-sm font-semibold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Products</p>
                  <p className="text-sm font-semibold text-gray-900">0</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Sales Today</p>
                  <p className="text-sm font-semibold text-gray-900">UGX 0</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
