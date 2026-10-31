import { NextRequest, NextResponse } from "next/server";

/**
 * DEPRECATED: This endpoint is deprecated in favor of the Cloud Function handler.
 * Configure ioTec webhooks to point to:
 * https://us-central1-{PROJECT_ID}.cloudfunctions.net/handleIoTecPaymentWebhook
 *
 * This Next.js route remains for backwards compatibility but should not be used
 * for new webhook configurations. The Cloud Function provides:
 * - Direct access to Firebase admin SDK for reliable writes
 * - No need for FIREBASE_ADMIN_TOKEN environment variable
 * - Better error handling and logging
 * - Atomic subscription creation
 */
export async function POST(request: NextRequest) {
  console.error(
    "DEPRECATED: ioTec webhook received on Next.js route. " +
    "Update ioTec configuration to use Cloud Function: " +
    "https://us-central1-{PROJECT_ID}.cloudfunctions.net/handleIoTecPaymentWebhook"
  );

  return NextResponse.json(
    {
      error: "Deprecated endpoint",
      message:
        "This endpoint is no longer actively used. Configure ioTec webhooks to use the Cloud Function instead.",
    },
    { status: 410 } // 410 Gone
  );
}
