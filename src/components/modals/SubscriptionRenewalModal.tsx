"use client";

import { X } from "lucide-react";

interface SubscriptionRenewalModalProps {
  isOpen: boolean;
  daysUntilExpiry: number;
  expiryDate: Date;
  onClose: () => void;
  onRenew: () => void;
}

export default function SubscriptionRenewalModal({
  isOpen,
  daysUntilExpiry,
  expiryDate,
  onClose,
  onRenew,
}: SubscriptionRenewalModalProps) {
  if (!isOpen) return null;

  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 7;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className={`text-2xl font-bold ${isExpired ? "text-red-600" : "text-orange-600"}`}>
            {isExpired ? "Subscription Expired" : "Subscription Expiring Soon"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 space-y-4">
          {isExpired ? (
            <p className="text-sm text-gray-600">
              Your subscription expired on {expiryDate.toLocaleDateString()}. Renew now to continue
              processing sales.
            </p>
          ) : (
            <>
              <p className="text-sm text-gray-600">
                Your subscription expires on {expiryDate.toLocaleDateString()}.
              </p>
              <div
                className={`rounded-lg p-4 text-sm font-semibold ${
                  isExpiringSoon ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"
                }`}
              >
                {isExpiringSoon
                  ? `Only ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? "s" : ""} remaining`
                  : `${daysUntilExpiry} days remaining`}
              </div>
            </>
          )}
        </div>

        <div className="space-y-3 border-t pt-4">
          <button
            onClick={onRenew}
            className="w-full rounded-lg bg-teal-600 px-4 py-2.5 font-medium text-white hover:bg-teal-700"
          >
            Renew Subscription (UGX 100,000/month)
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            {isExpired ? "Dismiss" : "Remind Me Later"}
          </button>
        </div>
      </div>
    </div>
  );
}
