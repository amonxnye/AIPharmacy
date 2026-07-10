export interface IoTecPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  organizationId: string;
  transactionType: "subscription_renewal" | "subscription_new";
}

export interface IoTecPaymentResponse {
  paymentLink: string;
  transactionId: string;
}

import { auth } from "@/lib/firebase";

export const paymentService = {
  async initiateSubscriptionPayment(
    organizationId: string,
    transactionType: "subscription_renewal" | "subscription_new"
  ): Promise<IoTecPaymentResponse> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Not authenticated");
    }

    const token = await user.getIdToken();
    const response = await fetch("/api/payments/initiate-subscription", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        organizationId,
        transactionType,
        amount: 100000,
        currency: "UGX",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to initiate payment");
    }

    return response.json();
  },

  async verifyPayment(transactionId: string): Promise<{ status: string }> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Not authenticated");
    }

    const token = await user.getIdToken();
    const response = await fetch(`/api/payments/verify/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to verify payment");
    }

    return response.json();
  },
};
