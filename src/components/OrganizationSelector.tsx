"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Building2, Check } from "lucide-react";

export default function OrganizationSelector() {
  const { currentOrgId, organizations, switchOrganization } = useAuth();

  // Don't show selector if user has only one org
  if (organizations.length <= 1) {
    return null;
  }

  const currentOrg = organizations.find(org => org.id === currentOrgId);

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
      >
        <Building2 className="h-4 w-4 text-gray-500" />
        <span className="max-w-[150px] truncate">
          {currentOrg?.name || "Select Organization"}
        </span>
        <svg
          className="h-4 w-4 text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right scale-0 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-transform group-hover:scale-100 focus-within:scale-100">
        <div className="p-2">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
            Switch Organization
          </div>
          {organizations.map((org) => (
            <button
              key={org.id}
              onClick={() => {
                switchOrganization(org.id);
                // Force menu to close
                document.activeElement instanceof HTMLElement &&
                  document.activeElement.blur();
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors ${
                org.id === currentOrgId
                  ? "bg-teal-50 text-teal-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                {org.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    className="h-8 w-8 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-teal-100">
                    <Building2 className="h-4 w-4 text-teal-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{org.name}</p>
                </div>
              </div>
              {org.id === currentOrgId && (
                <Check className="h-4 w-4 flex-shrink-0 text-teal-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
