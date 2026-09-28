"use client";

import { Bell, Search, MapPin, X } from "lucide-react";
import { useState } from "react";
import OrganizationSelector from "@/components/OrganizationSelector";
import { useOrganization } from "@/contexts/OrganizationContext";

export default function Header() {
  const { branches, selectedBranch, setSelectedBranch } = useOrganization();
  const [searchFocus, setSearchFocus] = useState(false);

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-4 sm:px-6 shadow-sm">
      {/* Search — responsive */}
      <div className="flex flex-1 items-center gap-2 sm:gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            aria-label="Search products, sales, or outlets"
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-4 ml-2 sm:ml-4">
        <OrganizationSelector />

        {/* Notifications */}
        <button
          className="relative rounded-lg p-2 hover:bg-gray-100 transition-colors duration-150"
          aria-label="Notifications"
          title="You have new notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
        </button>

        {/* Outlet Selector — wired to real branches */}
        {branches.length > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <select
              value={selectedBranch?.id || "all"}
              onChange={(e) => {
                const branch = branches.find((b) => b.id === e.target.value);
                setSelectedBranch(branch || null);
              }}
              aria-label="Select outlet"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-200 bg-white"
            >
              <option value="all">All Outlets</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </header>
  );
}
