import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "./firebase";

const functions = getFunctions(app);

interface InviteEmailData {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}

interface CloudFunctionResponse {
  success: boolean;
  message: string;
}

/**
 * Call Cloud Function to send invitation email
 */
export async function sendInviteEmail(data: InviteEmailData): Promise<CloudFunctionResponse> {
  try {
    const sendEmail = httpsCallable<InviteEmailData, CloudFunctionResponse>(
      functions,
      "sendInviteEmail"
    );
    const result = await sendEmail(data);
    return result.data;
  } catch (error) {
    console.error("Error calling sendInviteEmail function:", error);
    throw new Error("Failed to send invitation email");
  }
}
