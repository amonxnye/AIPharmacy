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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Billing</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your subscription and track earnings</p>
      </div>

      {/* Status Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Subscription Status */}
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Subscription Status</p>
              <h3 className="mt-2 text-2xl font-bold text-gray-900">
                {isActive ? "Active" : "Inactive"}
              </h3>
            </div>
            <div
              className={`rounded-full p-3 ${
                isActive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isActive ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <AlertCircle className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>

          {subscription && (
            <div className="mt-4 space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Start date:</span>
                <span className="font-medium">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>End date:</span>
                <span className="font-medium">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </span>
              </div>
              {isActive && (
                <div className="flex justify-between">
                  <span>Days remaining:</span>
                  <span className="font-medium">{daysRemaining} days</span>
                </div>
              )}
            </div>
          )}

          {!subscription && (
            <p className="mt-4 text-sm text-gray-600">
              You don&apos;t have an active subscription. Subscribe to start processing sales.
            </p>
          )}

          <button
            onClick={handleRenewSubscription}
            disabled={initiating}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {initiating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                {isActive ? "Renew Subscription" : "Get Subscription"}
              </>
            )}
          </button>
        </div>

        {/* Pricing */}
        <div className="rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 p-6 ring-1 ring-teal-200">
          <p className="text-sm font-medium text-teal-700">Subscription Plan</p>
          <h3 className="mt-2 text-2xl font-bold text-teal-900">Unlimited Users</h3>
          <div className="mt-4 space-y-2 text-sm text-teal-700">
            <div className="flex justify-between">
              <span>Price per month:</span>
              <span className="font-medium">UGX 100,000</span>
            </div>
            <div className="flex justify-between">
              <span>Users included:</span>
              <span className="font-medium">Unlimited</span>
            </div>
            <div className="flex justify-between">
              <span>Billing cycle:</span>
              <span className="font-medium">Monthly</span>
            </div>
          </div>
          <div className="mt-4 space-y-2 border-t border-teal-200 pt-4 text-sm font-medium text-teal-900">
            <div className="flex justify-between">
              <span>Your cost per month:</span>
              <span>{formatCurrency(100000, "UGX")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-700">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {message}
        </div>
      )}

      {/* Earnings */}
      {orgId && (
        <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-900/5">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Earnings</h2>
            <p className="mt-1 text-sm text-gray-600">Track revenue from your sales</p>
          </div>
          <EarningsWidget organizationId={orgId} currency={organization?.currency || "UGX"} />
        </div>
      )}
    </div>
  );
}
