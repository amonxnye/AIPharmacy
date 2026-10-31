"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { subscriptionService } from "@/lib/services/subscriptionService";
import { paymentService } from "@/lib/services/paymentService";
import { formatCurrency } from "@/lib/format";
import EarningsWidget from "@/components/EarningsWidget";
import { CheckCircle, AlertCircle, Loader2, CreditCard } from "lucide-react";

export default function SubscriptionPage() {
  const { userProfile } = useAuth();
  const { organization } = useOrganization();
  const orgId = userProfile?.organizationId;

  const [initiating, setInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleRenewSubscription = async () => {
    if (!orgId) return;

    setInitiating(true);
    setError(null);
    setMessage(null);

    try {
      const isActive = await subscriptionService.hasActiveSubscription(orgId);
      const transactionType = isActive ? "subscription_renewal" : "subscription_new";

      const { paymentLink } = await paymentService.initiateSubscriptionPayment(
        orgId,
        transactionType
      );

      window.location.href = paymentLink;
    } catch {
      setError("Could not initiate payment. Please try again.");
      setInitiating(false);
    }
  };


  const subscription = organization?.subscription;
  const isActive = subscription && new Date() <= subscription.endDate;
  const daysRemaining = subscription
    ? subscriptionService.daysUntilExpiry(subscription.endDate)
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Subscription</h1>
        <p className="mt-1 text-sm text-gray-500">Plan, billing, and earnings</p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Status */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8">
          <p className="text-sm font-medium text-gray-600">Status</p>
          <h3 className={`mt-1 text-5xl font-bold ${isActive ? "text-gray-900" : "text-red-700"}`}>
            {isActive ? "Active" : "Inactive"}
          </h3>
          {isActive && (
            <p className="mt-2 text-sm text-gray-500 tabular-nums">
              {daysRemaining} day{daysRemaining === 1 ? "" : "s"} remaining
            </p>
          )}

          {subscription && (
            <dl className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Started</dt>
                <dd className="font-medium text-gray-900 tabular-nums">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Ends</dt>
                <dd className="font-medium text-gray-900 tabular-nums">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          )}

          {!subscription && (
            <p className="mt-4 text-sm text-gray-600">
              You don&apos;t have an active subscription. Subscribe to start processing sales.
            </p>
          )}

          <button
            onClick={handleRenewSubscription}
            disabled={initiating}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {initiating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                {isActive ? "Renew Subscription" : "Get Subscription"}
              </>
            )}
          </button>
        </div>

        {/* Pricing */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-900">Plan</h2>
          <p className="mt-2 text-3xl font-semibold text-gray-900 tabular-nums">
            {formatCurrency(100000, "UGX")}
            <span className="ml-1 text-sm font-normal text-gray-500">/ month</span>
          </p>
          <dl className="mt-6 space-y-2 border-t border-gray-100 pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Users</dt>
              <dd className="font-medium text-gray-900">Unlimited</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Billing cycle</dt>
              <dd className="font-medium text-gray-900">Monthly</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-4 text-sm text-teal-800">
          <CheckCircle className="h-4 w-4 shrink-0" />
          {message}
        </div>
      )}

      {/* Earnings */}
      {orgId && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Earnings</h2>

          <EarningsWidget organizationId={orgId} currency={organization?.currency || "UGX"} />
        </div>
      )}
    </div>
  );
}
