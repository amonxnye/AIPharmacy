# AIPharmacy Deployment Guide

## Quick Deploy to Firebase App Hosting

Follow these steps to deploy your AIPharmacy prototype to Firebase App Hosting.

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase (if not already done)

```bash
cd /Users/ridelink/Documents/GitHub/AIPharmacy/web
firebase init hosting
```

**Configuration:**

- Select existing project: `aipharamcy`
- Public directory: `out`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No` (for now)

### Step 4: Configure Next.js for Static Export

The `next.config.ts` needs to be updated for static export:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

### Step 5: Build the Application

```bash
npm run build
```

This will create an `out` directory with the static files.

### Step 6: Deploy to Firebase

```bash
firebase deploy --only hosting
```

### Step 7: Access Your App

Your app will be available at:

- https://aipharamcy.web.app
- https://aipharamcy.firebaseapp.com
- https://aipharmacy--aipharamcy.us-east4.hosted.app/ (App Hosting URL)

## Troubleshooting

### Issue: Build fails with image optimization error

**Solution**: Make sure `images.unoptimized: true` is set in `next.config.ts`

### Issue: 404 errors on page refresh

**Solution**: Ensure `firebase.json` has proper rewrites configured

### Issue: Firebase CLI not found

**Solution**: Install globally with `npm install -g firebase-tools`

## Environment Variables

If you need to add environment variables:

1. Create `.env.local` file in the `web` directory
2. Add your variables:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
   ```
3. Update `firebase.ts` to use environment variables

## Continuous Deployment

To set up automatic deployments from GitHub:

1. Connect your GitHub repository to Firebase
2. Enable GitHub Actions in Firebase Console
3. Push to main branch to trigger automatic deployments
