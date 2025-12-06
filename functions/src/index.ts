import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Configure email transporter
// In production, use environment variables for credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email?.user || process.env.EMAIL_USER,
    pass: functions.config().email?.password || process.env.EMAIL_PASSWORD,
  },
});

interface InviteEmailData {
  to: string;
  organizationName: string;
  inviterName: string;
  role: string;
  inviteLink: string;
}

/**
 * Cloud Function to send staff invitation emails
 */
export const sendInviteEmail = functions.https.onCall(
  async (data: InviteEmailData, context) => {
    // Check authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated to send invitations."
      );
    }

    const { to, organizationName, inviterName, role, inviteLink } = data;

    // Validate input
    if (!to || !organizationName || !inviterName || !role || !inviteLink) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing required fields."
      );
    }

    // Role labels for display
    const roleLabels: Record<string, string> = {
      owner: "Owner",
      manager: "Manager",
      pharmacist: "Pharmacist",
      cashier: "Cashier",
      inventory_officer: "Inventory Officer",
    };

    const roleLabel = roleLabels[role] || role;

    // Email HTML template
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to ${organizationName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
                   'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #14b8a6 0%, #0891b2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .content p {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #555;
    }
    .info-box {
      background: #f0fdfa;
      border-left: 4px solid #14b8a6;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 8px 0;
      font-size: 15px;
    }
    .info-box strong {
      color: #0f766e;
    }
    .cta-button {
      display: inline-block;
      background: #14b8a6;
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      margin: 24px 0;
      text-align: center;
    }
    .cta-button:hover {
      background: #0d9488;
    }
    .footer {
      background: #f9fafb;
      padding: 30px;
      text-align: center;
      font-size: 14px;
      color: #6b7280;
      border-top: 1px solid #e5e7eb;
    }
    .footer p {
      margin: 8px 0;
    }
    .link-text {
      word-break: break-all;
      font-size: 12px;
      color: #9ca3af;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 You're Invited!</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p>
        <strong>${inviterName}</strong> has invited you to join
        <strong>${organizationName}</strong> on AI Pharmacy.
      </p>

      <div class="info-box">
        <p><strong>Organization:</strong> ${organizationName}</p>
        <p><strong>Your Role:</strong> ${roleLabel}</p>
        <p><strong>Invited by:</strong> ${inviterName}</p>
      </div>

      <p>
        As a ${roleLabel}, you'll have access to manage inventory, process sales,
        and collaborate with your team on the AI Pharmacy platform.
      </p>

      <center>
        <a href="${inviteLink}" class="cta-button">Accept Invitation</a>
      </center>

      <p class="link-text">
        Or copy and paste this link into your browser:<br>
        ${inviteLink}
      </p>

      <p>
        This invitation will expire in 7 days. If you have any questions,
        please contact ${inviterName}.
      </p>
    </div>
    <div class="footer">
      <p><strong>AI Pharmacy</strong></p>
      <p>Smart pharmacy management powered by AI</p>
      <p style="margin-top: 16px; font-size: 12px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
    `;

    // Plain text version
    const textContent = `
You're Invited to ${organizationName}!

${inviterName} has invited you to join ${organizationName} on AI Pharmacy.

Organization: ${organizationName}
Your Role: ${roleLabel}
Invited by: ${inviterName}

Accept your invitation by clicking this link:
${inviteLink}

This invitation will expire in 7 days.

---
AI Pharmacy
Smart pharmacy management powered by AI
    `.trim();

    // Send email
    try {
      await transporter.sendMail({
        from: `"AI Pharmacy" <${functions.config().email?.user ||
               process.env.EMAIL_USER}>`,
        to: to,
        subject: `You're invited to join ${organizationName}`,
        text: textContent,
        html: htmlContent,
      });

      return {
        success: true,
        message: "Invitation email sent successfully",
      };
    } catch (error) {
      console.error("Error sending email:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to send invitation email"
      );
    }
  }
);

/**
 * Cloud Function to automatically expire old invitations
 * Runs daily at midnight
 */
export const expireOldInvitations = functions.pubsub
  .schedule("0 0 * * *")
  .timeZone("UTC")
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();

    try {
      // Get all organizations
      const orgsSnapshot = await db.collection("organizations").get();

      let expiredCount = 0;

      // Check invites in each organization
      for (const orgDoc of orgsSnapshot.docs) {
        const invitesRef = db.collection(
          "organizations"
        ).doc(orgDoc.id).collection("invites");

        const expiredInvitesSnapshot = await invitesRef
          .where("status", "==", "pending")
          .where("expiresAt", "<", now)
          .get();

        // Update expired invites
        const batch = db.batch();
        expiredInvitesSnapshot.docs.forEach((inviteDoc) => {
          batch.update(inviteDoc.ref, { status: "expired" });
          expiredCount++;
        });

        if (!batch.isEmpty) {
          await batch.commit();
        }
      }

      console.log(`Expired ${expiredCount} old invitations`);
      return null;
    } catch (error) {
      console.error("Error expiring invitations:", error);
      return null;
    }
  });
