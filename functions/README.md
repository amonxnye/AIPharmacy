# AI Pharmacy Cloud Functions

This directory contains Firebase Cloud Functions for the AI Pharmacy application.

## Functions

### 1. sendInviteEmail (HTTPS Callable)

Sends invitation emails to new staff members.

**Trigger:** Called from the client via `sendInviteEmail()` helper
**Authentication:** Required
**Parameters:**
- `to` - Recipient email address
- `organizationName` - Name of the organization
- `inviterName` - Name of the person sending the invite
- `role` - Staff role (owner, manager, pharmacist, cashier, inventory_officer)
- `inviteLink` - Full URL to accept the invitation

**Returns:**
```json
{
  "success": true,
  "message": "Invitation email sent successfully"
}
```

### 2. expireOldInvitations (Scheduled)

Automatically marks expired invitations as expired in Firestore.

**Trigger:** Daily at midnight UTC
**Purpose:** Cleanup expired invitations that haven't been accepted

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Email Credentials

For email sending, you need to configure Gmail credentials (or another SMTP service).

#### Using Firebase Config (Recommended for Production)

```bash
firebase functions:config:set email.user="your-email@gmail.com" email.password="your-app-password"
```

**Important:** For Gmail, you need to use an [App Password](https://support.google.com/accounts/answer/185833?hl=en), not your regular password.

#### Using Environment Variables (For Local Development)

Create a `.env` file in the functions directory:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

Add `.env` to `.gitignore` to avoid committing credentials.

### 3. Build TypeScript

```bash
npm run build
```

### 4. Test Locally with Emulator

```bash
npm run serve
```

This will start the Firebase emulator with your functions running locally.

### 5. Deploy to Firebase

```bash
firebase deploy --only functions
```

Or deploy a specific function:

```bash
firebase deploy --only functions:sendInviteEmail
```

## Development

### Running the Emulator

```bash
npm run serve
```

This will:
1. Build the TypeScript code
2. Start the Firebase Functions emulator
3. Make functions available at `http://localhost:5001`

### Watch Mode

For development with auto-rebuild:

```bash
npm run build:watch
```

In another terminal:

```bash
firebase emulators:start --only functions
```

### Linting

```bash
npm run lint
```

### Viewing Logs

```bash
npm run logs
```

Or for a specific function:

```bash
firebase functions:log --only sendInviteEmail
```

## Project Structure

```
functions/
├── src/
│   └── index.ts          # Main functions file
├── lib/                  # Compiled JavaScript (git-ignored)
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js         # ESLint configuration
└── .gitignore           # Ignore compiled files
```

## Email Template

The invitation email includes:
- Professional gradient design matching the app theme
- Organization name and role information
- Call-to-action button
- Plain text fallback for email clients
- 7-day expiration notice

## Security

- All functions require authentication
- Emails are sent only by authenticated users
- Input validation on all parameters
- Credentials stored in Firebase config (not in code)
- Rate limiting applied by Firebase

## Troubleshooting

### Email Not Sending

1. Check Gmail App Password is correctly set
2. Verify Firebase config: `firebase functions:config:get`
3. Check function logs: `firebase functions:log --only sendInviteEmail`
4. Ensure "Less secure app access" is NOT enabled (use App Password instead)

### Function Deployment Fails

1. Ensure you're authenticated: `firebase login`
2. Check you have the correct project: `firebase use --add`
3. Verify Node version matches engines in package.json (Node 18)

### Local Emulator Not Working

1. Install Java (required for emulator)
2. Run `firebase setup:emulators:firestore`
3. Check ports 5001, 4000, etc. are not in use

## Cost Considerations

- Cloud Functions have a generous free tier (2M invocations/month)
- Email sending is essentially free (minimal compute time)
- Scheduled function runs once daily (very low cost)
- Monitor usage in Firebase Console

## Next Steps

1. Consider using a dedicated email service (SendGrid, Mailgun) for production
2. Add email templates for other notifications (password reset, etc.)
3. Implement email tracking (open rates, click rates)
4. Add support for custom email templates per organization
