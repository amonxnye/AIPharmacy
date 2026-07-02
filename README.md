# AIPharmacy - Multi-Tenant Pharmacy Management System

A modern, cloud-based multi-tenant SaaS platform for pharmacy outlet management. Built with Next.js, TypeScript, TailwindCSS, and Firebase.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Firebase](https://img.shields.io/badge/Firebase-Enabled-orange)

## 🚀 Features

### Working today (v0.3)

- ✅ **Multi-tenant organizations** with data isolation enforced by Firestore security rules
- ✅ **Authentication**: sign up (with email verification), sign in, password reset
- ✅ **Self-service onboarding**: create an organization and first outlet
- ✅ **Point of Sale**: real product search, cart, and checkout that records a sale and deducts stock (FEFO) transactionally, using the org's currency and tax rate
- ✅ **Inventory**: product CRUD, opening stock batches, live stock levels, low-stock and expiry indicators
- ✅ **Dashboard**: live sales-today, product count, low-stock and expiring aggregates from real data
- ✅ **Outlets**: branch add / edit / delete
- ✅ **Staff**: token-based email invitations, role-based membership, pending-invite management, role & outlet editing, removal
- ✅ **Role-based access control** (Owner, Manager, Pharmacist, Cashier, Inventory Officer) at both the UI and the security-rule layer
- ✅ **Settings**: organization and profile persistence

### Planned

- 🔄 Receipt generation and printing
- 🔄 Procurement and supplier management
- 🔄 Sales reports and CSV/PDF export
- 🔄 Audit logging
- 🔄 Offline POS mode
- 🔄 AI demand forecasting and drug-interaction alerts
- 🔄 Subscription billing (Stripe / Flutterwave / Razorpay)

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/AIPharmacy.git
   cd AIPharmacy/web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Update `src/lib/firebase.ts` with your Firebase credentials (already configured for `aipharamcy` project)

4. **Run development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

### Deploy to Firebase App Hosting

1. **Install Firebase CLI**

   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**

   ```bash
   firebase login
   ```

3. **Build the application**

   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   firebase deploy --only hosting
   ```

5. **Deploy Firestore security rules & indexes** (required — the app enforces
   tenant isolation entirely through these rules)
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

Your app will be live at: `https://aipharmacy--aipharamcy.us-east4.hosted.app/`

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)

## 📁 Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/          # Dashboard page
│   │   ├── inventory/          # Inventory management
│   │   ├── pos/                # Point of Sale
│   │   └── layout.tsx          # Root layout
│   ├── components/             # React components
│   │   └── layout/             # Layout components (Sidebar, Header)
│   └── lib/                    # Utilities and configurations
│       ├── firebase.ts         # Firebase configuration
│       └── utils.ts            # Utility functions
├── public/                     # Static assets
├── firebase.json               # Firebase hosting config
├── next.config.ts              # Next.js configuration
└── package.json                # Dependencies
```

## 🎨 Tech Stack

| Technology       | Purpose                            |
| ---------------- | ---------------------------------- |
| **Next.js 15**   | React framework with App Router    |
| **TypeScript**   | Type-safe development              |
| **TailwindCSS**  | Utility-first CSS framework        |
| **Firebase**     | Authentication, Firestore, Hosting |
| **Lucide React** | Modern icon library                |

## 📱 Pages Overview

### Dashboard (`/dashboard`)

- Sales metrics and KPIs
- Recent transactions list
- Low stock alerts
- Expiring products warnings

### Inventory (`/inventory`)

- Product catalog with search
- Batch number tracking
- Expiry date monitoring
- Stock level indicators
- Cost and selling price management

### POS (`/pos`)

- Product search and selection
- Shopping cart management
- Real-time total calculation
- Tax computation (18% VAT)
- Checkout interface

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Environment Variables

Create a `.env.local` file for environment-specific configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Design inspired by modern pharmacy management systems
- Built with best practices from the Next.js and Firebase communities
- Icons by [Lucide](https://lucide.dev)

## 📞 Support

For support, email support@aipharmacy.com or open an issue in the repository.

## 🗺️ Roadmap

See [Develpoment.md](Develpoment.md) for the complete development roadmap and feature specifications.

---

**Built with ❤️ for modern pharmacy management**
