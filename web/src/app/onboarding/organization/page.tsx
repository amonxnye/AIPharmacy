"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { organizationService } from "@/lib/services/organizationService";
import { Building2, DollarSign, Percent, AlertCircle } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrganizationSetupPage() {
  const router = useRouter();
  const { user, refreshUserProfile } = useAuth();
  const [name, setName] = useState("");
  const [currency, setCurrency] = useState("UGX");
  const [taxRate, setTaxRate] = useState(18);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError("");
    setLoading(true);

    try {
      // Create organization
      const orgId = await organizationService.create({
        name,
        currency,
        taxRate: taxRate / 100, // Convert percentage to decimal
        ownerId: user.uid,
      });

      // Update user profile with organization ID
      await updateDoc(doc(db, "users", user.uid), {
        organizationId: orgId,
      });

      // Refresh user profile
      await refreshUserProfile();

      // Redirect to branch setup
      router.push("/onboarding/branch");
    } catch (err: any) {
      setError(err.message || "Failed to create organization. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-sm font-medium text-white">
              1
            </div>
            <div className="h-1 w-16 bg-gray-300"></div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300 text-sm font-medium text-gray-600">
              2
            </div>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            Step 1 of 2: Organization Setup
          </p>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Set Up Your Organization</h1>
          <p className="mt-2 text-gray-600">
            Let&apos;s start by creating your pharmacy organization
          </p>
        </div>

        {/* Form */}
        <div className="rounded-2xl bg-white p-8 shadow-xl ring-1 ring-gray-900/5">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Organization Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="e.g., HealthCare Pharmacy"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                This will be displayed on receipts and reports
              </p>
            </div>

            {/* Currency */}
            <div>
              <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
                Currency *
              </label>
              <div className="relative mt-1">
                <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  <option value="UGX">UGX - Ugandan Shilling</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="TZS">TZS - Tanzanian Shilling</option>
                </select>
              </div>
            </div>

            {/* Tax Rate */}
            <div>
              <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
                Tax Rate (%) *
              </label>
              <div className="relative mt-1">
                <Percent className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  id="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={taxRate}
                  onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                  required
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  placeholder="18"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Default VAT/tax rate for your region
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 font-medium text-white shadow-sm transition-all hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {loading ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating organization...
                </>
              ) : (
                <>
                  Continue to Branch Setup
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
