import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const signature = request.headers.get("X-IoTec-Signature");

    // Verify webhook signature
    const ioTecSecret = process.env.IOTEC_SECRET;
    if (!ioTecSecret || !signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const hash = crypto
      .createHmac("sha256", ioTecSecret)
      .update(JSON.stringify(payload))
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Signature mismatch" }, { status: 401 });
    }

    const { transaction_id, status, organization_id: orgId } = payload;

    // Only process successful payments
    if (status !== "success") {
      return NextResponse.json({ success: true });
    }

    // Use REST API to update Firestore instead of admin SDK
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/databases/(default)/documents/organizations/${orgId}/subscription/${orgId}`;

    const response = await fetch(firestoreUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FIREBASE_ADMIN_TOKEN || ""}`,
      },
      body: JSON.stringify({
        fields: {
          organizationId: { stringValue: orgId },
          startDate: { timestampValue: startDate.toISOString() },
          endDate: { timestampValue: endDate.toISOString() },
          status: { stringValue: "active" },
          paymentReference: { stringValue: transaction_id },
          renewalEnabled: { booleanValue: false },
          createdAt: { timestampValue: new Date().toISOString() },
          updatedAt: { timestampValue: new Date().toISOString() },
        },
      }),
    });

    if (!response.ok) {
      console.error("Failed to update subscription via Firestore REST API");
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
