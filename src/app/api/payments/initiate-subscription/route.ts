import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { organizationId, transactionType } = await request.json();

    // Verify authorization header exists
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const ioTecClientId = process.env.IOTEC_CLIENT_ID;
    const ioTecSecret = process.env.IOTEC_SECRET;
    const ioTecApiUrl = process.env.IOTEC_API_URL || "https://api.iotecpay.com";

    if (!ioTecClientId || !ioTecSecret) {
      console.error("ioTec credentials not configured");
      return NextResponse.json(
        { error: "Payment service not configured" },
        { status: 500 }
      );
    }

    const paymentPayload = {
      client_id: ioTecClientId,
      amount: 100000,
      currency: "UGX",
      description: `AI-Pharmacy Subscription - ${transactionType === "subscription_renewal" ? "Renewal" : "New"}`,
      merchant_reference: `SUB-${organizationId}-${Date.now()}`,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=success&transaction={transaction_id}`,
      failure_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription?status=failed`,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/iotec-payment`,
    };

    const response = await fetch(`${ioTecApiUrl}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ioTecSecret}`,
      },
      body: JSON.stringify(paymentPayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("ioTec API error:", errorData);
      return NextResponse.json(
        { error: "Failed to create payment link" },
        { status: 500 }
      );
    }

    const paymentData = await response.json();

    return NextResponse.json({
      paymentLink: paymentData.payment_link,
      transactionId: paymentData.transaction_id,
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
