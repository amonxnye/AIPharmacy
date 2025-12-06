Nice, this is a solid foundation already. Let’s turn it into something a senior product + architecture spec: UX-first, with every function mapped to Firebase/Firestore.

⸻

1. Personas & High-Level UX

Personas
	1.	Platform Super Admin (SaaS Owner)
	•	Manages tenants (organizations), billing, plans, usage, and AI add-ons.
	2.	Org Owner / Admin
	•	Sets up the pharmacy organization, branding, outlets, staff, and high-level settings.
	3.	Outlet Manager
	•	Manages a specific branch (outlet): inventory, staff shifts, cash reconciliation.
	4.	Pharmacist
	•	Manages medicines, batches, expiries; supports dispensing decisions.
	5.	Cashier
	•	Uses POS to process sales, receipts, payments.
	6.	Inventory Officer
	•	Stock-in, stock-out, GRNs, stock audits, and supplier management.

UX Principles
	•	Context selectors at top bar:
	•	Organization Selector (for users in multiple orgs).
	•	Outlet Selector (within an org, for outlet-bound actions like POS).
	•	Left sidebar navigation (varies by role):
	•	Dashboard, POS, Inventory, Procurement, Staff, Reports, Settings (Org/Admin), Billing (Platform/Owner).
	•	Action-oriented screens:
	•	“+ New Sale”, “+ New Product”, “+ New PO”.
	•	Role-based UI:
	•	Cashier sees POS and basic sales history only.
	•	Owner sees everything + billing.
	•	Inventory Officer sees Inventory, Procurement, Stock Reports.

⸻

2. Firebase Architecture Overview

We’ll use:
	•	Firebase Authentication – handles sign-in, multi-org users.
	•	Firestore – multi-tenant data.
	•	Cloud Functions – business logic (e.g., stock updates, billing).
	•	Cloud Storage – logos, receipts (PDF), export files.

2.1 Top-Level Collections (Firestore)

users/                 // Global user profiles (per Firebase Auth user)
organizations/         // Tenants
plans/                 // Subscription plans
platformSettings/      // Global settings (for SaaS owner)

2.2 Nested Collections Under organizations/{orgId}

organizations/{orgId}/
  outlets/
  users/               // Org-specific membership & roles
  products/
  stockBatches/
  sales/
  saleItems/
  suppliers/
  purchaseRequisitions/
  purchaseOrders/
  goodsReceipts/
  payments/
  reportsCache/        // Precomputed summaries
  activityLogs/
  settings/            // receipt, taxes, AI modules
  invoices/            // tenant billing records

Rule: Every document includes organizationId and often outletId for security & queries, even if it’s nested.

⸻

3. Authentication & Multi-Org UX

3.1 UX Flow
	1.	User Sign Up (First Org Owner)
	•	User lands on marketing site → “Start Free Trial”.
	•	Sign up with:
	•	Email + Password (Auth)
	•	Organization Name
	•	Country, Currency
	•	After signup:
	•	Auto-create organization.
	•	Make this user role = owner in that org.
	•	Create default outlet (e.g., “Main Branch”).
	2.	User Login
	•	User logs in with email/password.
	•	System checks which organizations they belong to.
	•	If more than one:
	•	Show an Org Selection screen (cards with logo + name).
	•	Once org is selected:
	•	Store currentOrgId in client state.
	•	Load outlets; optionally ask user which outlet to enter (for POS roles).
	3.	Invite Staff
	•	Admin/Manager opens “Staff” → “Invite Staff”.
	•	Enter email, role, outlets.
	•	System:
	•	Creates pending membership.
	•	Sends invite email with magic link.
	•	When invited user clicks:
	•	If new to platform → sign up.
	•	If existing → org is added to their memberships.

3.2 Firebase Data Model

Auth user:
	•	uid from Firebase Auth.

Firestore: users/{uid} – global user profile

{
  "displayName": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+256...",
  "photoUrl": "https://...",
  "memberships": [
    {
      "organizationId": "org_123",
      "role": "manager",
      "assignedOutletIds": ["outlet_1", "outlet_2"]
    }
  ],
  "createdAt": "...",
  "lastLoginAt": "..."
}

Firestore: organizations/{orgId}/users/{uid} – org-specific view

{
  "userId": "uid_abc",
  "email": "jane@example.com",
  "name": "Jane Doe",
  "role": "manager",
  "assignedOutletIds": ["outlet_1", "outlet_2"],
  "status": "active",  // or "invited", "suspended"
  "createdAt": "...",
  "invitedBy": "uid_owner"
}

3.3 Security
	•	Users can only read organizations they belong to.
	•	role and assignedOutletIds stored in Firestore and optionally set in Custom Claims for faster rules.

⸻

4. Organization & Settings UX + Firestore

4.1 UX – Organization Setup

Screen: “Organization Settings” (Owner/Admin only)

Tabs:
	1.	General
	•	Org Name, Logo, Country.
	2.	Branding
	•	Logo upload (Cloud Storage).
	•	Primary color for UI & receipts.
	3.	Receipt Settings
	•	Header text, footer text, legal note, contact info.
	4.	Tax & Currency
	•	Default currency.
	•	Tax type (VAT, GST, etc.).
	•	Tax registration number.
	5.	AI & Modules
	•	Toggle AI Modules (if plan allows).
	•	Demand forecasting, interaction alerts, fraud detection flags.

4.2 Firestore: organizations/{orgId}

{
  "name": "HealthPlus Pharmacy Group",
  "logoUrl": "gs://.../logos/org_123.png",
  "country": "UG",
  "currency": "UGX",
  "taxConfig": {
    "type": "VAT",
    "rate": 0.18,
    "taxNumber": "12345678"
  },
  "receiptSettings": {
    "header": "HealthPlus Pharmacy",
    "footer": "Thank you for choosing us!",
    "showTaxNumber": true,
    "contactPhone": "+256..."
  },
  "planId": "pro",
  "aiSettings": {
    "demandForecastingEnabled": true,
    "drugInteractionAlertsEnabled": false
  },
  "ownerUserId": "uid_owner",
  "createdAt": "...",
  "status": "active"
}


⸻

5. Outlet Management UX + Firestore

5.1 UX

Screen: “Outlets” (Admin/Manager)
	•	List view:
	•	Outlet Name, Location, License status, Sales Today, Status.
	•	Actions:
	•	+ New Outlet
	•	Edit outlet details
	•	Deactivate/activate outlet
	•	Outlet detail:
	•	Name, Address, License Number, License Expiry.
	•	Operating Hours.
	•	Assigned staff.

5.2 Firestore Path

organizations/{orgId}/outlets/{outletId}

{
  "organizationId": "org_123",
  "name": "Kampala Main Branch",
  "code": "KLA-MAIN",
  "licenseNumber": "PHA12345",
  "licenseExpiry": "2026-12-31",
  "address": {
    "line1": "Plot 12 Kampala Road",
    "city": "Kampala",
    "region": "Kampala",
    "country": "UG"
  },
  "openingHours": {
    "mon": { "open": "08:00", "close": "22:00" },
    "tue": { "open": "08:00", "close": "22:00" }
  },
  "status": "active",
  "createdAt": "..."
}

Staff assignment: stored in organizations/{orgId}/users/{uid}.assignedOutletIds.

⸻

6. Staff Management UX + Firestore

6.1 UX

Screen: “Staff”
	•	Table:
	•	Name, Email, Role, Outlets, Status.
	•	Actions:
	•	Invite Staff
	•	Change role
	•	Assign outlets
	•	Suspend/Activate

Invite Flow:
	•	Fill form → POST to Cloud Function → creates org user + sends email with invite token.

6.2 Firestore Operations
	•	Invite staff
	•	Create organizations/{orgId}/users/{uid} with status: "invited" (placeholder uid or invitationId).
	•	Create invites doc (either top level or nested).

Example invite document (organizations/{orgId}/invites/{inviteId}):

{
  "email": "cashier@pharma.com",
  "role": "cashier",
  "assignedOutletIds": ["outlet_1"],
  "status": "pending",
  "inviteToken": "randomString",
  "invitedBy": "uid_owner",
  "createdAt": "..."
}

Cloud Function resolves this when user signs up / accepts invite (links auth uid and org membership).

⸻

7. Inventory & Stocking UX + Firestore

7.1 UX

7.1.1 Product Catalog
Screen: “Products”
	•	Search & filters:
	•	By generic name, brand, category, form.
	•	Table columns:
	•	Generic, Brand, Form, Strength, Category, Active/Inactive.
	•	Stock Summary (sum across outlets).

Actions:
	•	+ New Product
	•	Bulk import via CSV
	•	Deactivate product

Add/Edit Product Form:
	•	Generic name (required)
	•	Brand name
	•	Form (tablet, syrup, injection…)
	•	Strength (500mg)
	•	Pack size
	•	SKU / Barcode
	•	Category (e.g., Antibiotic, Analgesic)

7.1.2 Stock Management
Screen: “Stock by Outlet”
	•	Filter by outlet, product, expiry range.
	•	Show:
	•	Product, Batch, Expiry, Qty, Cost, Selling price.

Actions:
	•	Stock In (Manual or via GRN)
	•	Stock Out (Adjustment, damage, returns)
	•	Transfer between outlets (Phase 2+).

7.2 Firestore: Products

organizations/{orgId}/products/{productId}

{
  "organizationId": "org_123",
  "genericName": "Paracetamol",
  "brandName": "Panadol",
  "category": "Analgesic",
  "strength": "500mg",
  "form": "tablet",
  "packSize": "10",
  "sku": "PARA500-10",
  "barcode": "1234567890123",
  "isActive": true,
  "createdAt": "..."
}

7.3 Firestore: Stock Batches

organizations/{orgId}/stockBatches/{stockBatchId}

{
  "organizationId": "org_123",
  "outletId": "outlet_1",
  "productId": "prod_456",
  "batchNumber": "BATCH2025-01",
  "expiryDate": "2026-01-31",
  "quantity": 200,        // current available
  "initialQuantity": 300,
  "costPrice": 500,       // per unit in minor units (e.g., cents)
  "sellingPrice": 800,
  "createdAt": "...",
  "lastUpdatedAt": "..."
}

UX tie-in: Stock-in form creates new stockBatches or updates existing batch; Cloud Function ensures atomic updates (e.g., in transactions).

⸻

8. Procurement UX + Firestore

8.1 UX

Module: Procurement

Tabs:
	1.	Purchase Requisitions (PR)
	•	Created by pharmacists/managers when stock is low.
	•	Status: Draft → Submitted → Approved → Converted to PO.
	2.	Purchase Orders (PO)
	•	Sent to suppliers.
	•	Status: Draft → Sent → Partially Received → Completed.
	3.	Goods Received Notes (GRN)
	•	Used when supplier delivers items.
	•	Confirms quantity, batch, expiry, cost.

8.2 Firestore

8.2.1 Purchase Requisitions
organizations/{orgId}/purchaseRequisitions/{prId}

{
  "organizationId": "org_123",
  "outletId": "outlet_1",
  "requestedBy": "uid_pharmacist",
  "status": "submitted", // draft, submitted, approved, rejected
  "items": [
    {
      "productId": "prod_456",
      "requestedQty": 100
    }
  ],
  "createdAt": "...",
  "approvedBy": "uid_manager"
}

8.2.2 Purchase Orders
organizations/{orgId}/purchaseOrders/{poId}

{
  "organizationId": "org_123",
  "supplierId": "supp_789",
  "outletId": "outlet_1",
  "status": "sent", // draft, sent, partially_received, completed
  "items": [
    {
      "productId": "prod_456",
      "orderedQty": 100,
      "costPrice": 500
    }
  ],
  "totalAmount": 50000,
  "createdAt": "...",
  "sentAt": "...",
  "createdFromPR": "pr_123"
}

8.2.3 GRNs
organizations/{orgId}/goodsReceipts/{grnId}

{
  "organizationId": "org_123",
  "poId": "po_456",
  "outletId": "outlet_1",
  "receivedBy": "uid_inventory",
  "receivedAt": "...",
  "items": [
    {
      "productId": "prod_456",
      "batchNumber": "BATCH2025-01",
      "expiryDate": "2026-01-31",
      "receivedQty": 100,
      "costPrice": 500
    }
  ]
}

Cloud Function: On GRN creation → update stockBatches & log in activityLogs.

⸻

9. POS (Point of Sale) UX + Firestore

9.1 UX

Screen: POS (Cashier)

Layout:
	•	Left Panel: Product search (by name, barcode).
	•	Center: Cart items (Product, Qty, Price, Subtotal, Discount).
	•	Right Panel:
	•	Cart summary: Subtotal, Discounts, Tax, Total.
	•	Payment section: Choose payment method(s).
	•	“Complete Sale” button.

Flow:
	1.	Cashier selects current outlet (top selector).
	2.	Scans barcode or searches product.
	3.	System fetches available stock by expiry (FIFO).
	4.	Adds item to cart (validates stock quantity).
	5.	Cashier chooses payment method(s).
	6.	On “Complete Sale”:
	•	Creates sales document and saleItems docs (or items array).
	•	Triggers Cloud Function:
	•	Deducts stock from relevant batches.
	•	Writes activityLog.
	7.	Optional:
	•	Print receipt (HTML → print dialog).
	•	Send SMS/email receipt.

9.2 Firestore: Sales

organizations/{orgId}/sales/{saleId}

{
  "organizationId": "org_123",
  "outletId": "outlet_1",
  "cashierId": "uid_cashier",
  "totalAmount": 12000,
  "subTotal": 10000,
  "taxAmount": 2000,
  "discountAmount": 0,
  "payment": {
    "method": "MOBILE_MONEY", // or CASH, CARD, CORPORATE
    "details": {
      "phone": "+256..."
    }
  },
  "status": "completed", // or "voided", "refunded"
  "createdAt": "...",
  "receiptNumber": "KLA-2025-000012"
}

Option A – Embedded Items (simpler for MVP):

"items": [
  {
    "productId": "prod_456",
    "quantity": 2,
    "unitPrice": 5000,
    "lineTotal": 10000,
    "batchIds": ["batch_1", "batch_2"] // if split
  }
]

Option B – Separate saleItems collection (better for large data analytics).

⸻

10. Reports & Analytics UX + Firestore

10.1 UX

Module: Reports

Key report types:
	1.	Daily Sales Summary
	•	Filter: date, outlet, cashier.
	•	Chart + table.
	2.	Product Sales
	•	Top selling products by date range.
	3.	Expiry Report
	•	Products expiring within X days.
	4.	Stock Valuation
	•	Current value of inventory per outlet.
	5.	Staff Performance
	•	Sales by cashier, voids, refunds.
	6.	Supplier Performance
	•	Volume & on-time deliveries by supplier.

10.2 Firestore

You can compute some on the fly but for performance, maintain cached reports.

organizations/{orgId}/reportsCache/dailySales_{date}_{outletId}

{
  "organizationId": "org_123",
  "outletId": "outlet_1",
  "date": "2025-12-06",
  "totalSales": 243000,
  "totalTax": 43000,
  "totalTransactions": 89,
  "topProducts": [
    { "productId": "prod_1", "quantity": 50, "amount": 60000 },
    { "productId": "prod_2", "quantity": 30, "amount": 45000 }
  ],
  "generatedAt": "..."
}

Generated by Cloud Functions on schedule (e.g. nightly) or after each sale.

⸻

11. Tenant Billing UX + Firestore

11.1 UX

For Platform Super Admin:
	•	View list of tenants:
	•	Org Name, Plan, Status, Outlets, Usage (sales count, storage, API calls).
	•	Configure plans:
	•	Max outlets, max users, AI addons, price.

For Org Owner:
	•	“Billing” page:
	•	Current plan, renewal date.
	•	Number of outlets in use vs allowed.
	•	Payment method (Stripe/Flutterwave).
	•	Invoices & payment history.
	•	Upgrade/Downgrade plan.

11.2 Firestore

plans/{planId}

{
  "name": "Pro",
  "priceMonthly": 50000,
  "maxOutlets": 10,
  "maxUsers": 50,
  "features": {
    "aiForecasting": true,
    "drugInteractionAlerts": true
  }
}

organizations/{orgId}/invoices/{invoiceId}

{
  "organizationId": "org_123",
  "planId": "pro",
  "periodStart": "2025-12-01",
  "periodEnd": "2025-12-31",
  "amount": 50000,
  "currency": "UGX",
  "status": "paid",
  "paidAt": "2025-12-02",
  "paymentProvider": "Stripe",
  "providerInvoiceId": "inv_123"
}


⸻

12. Optional AI Modules – UX & Data Hooks

12.1 Demand Forecasting
	•	UX:
	•	In Inventory → “AI Suggestions” tab.
	•	Shows recommended reorder quantities by product & outlet.
	•	Data:
	•	Uses historical sales, stockBatches, seasonality (from external sources).
	•	Storage:
organizations/{orgId}/aiForecasts/{productId}_{outletId}

{
  "organizationId": "org_123",
  "outletId": "outlet_1",
  "productId": "prod_456",
  "forecastHorizonDays": 30,
  "recommendedOrderQty": 120,
  "confidence": 0.87,
  "generatedAt": "..."
}

12.2 Drug Interaction Alerts at POS
	•	UX:
	•	When adding certain combinations to cart, a warning pops up:
“Potential interaction between Drug A and Drug B. Proceed?”
	•	Data:
	•	Drug interaction knowledge may come from an external API (linked via AICyclinder).
	•	Cached references in drugInteractions collection.

12.3 Fraud Detection
	•	UX:
	•	Admin Receives alerts in a “Risk & Alerts” section.
	•	Example:
	•	“Unusual number of voided sales by cashier X in last 24h.”
	•	Data:
	•	Cloud Function analyzing sales, activityLogs.

⸻

13. Firebase Security & Multi-Tenant Logic (Concept)

Very simplified conceptual Firestore Rules (not full code, but logic):

match /organizations/{orgId} {
  // Only members of org can read/write
  allow read, write: if isOrgMember(orgId);

  match /users/{userId} {
    allow read: if isOrgMember(orgId);
    allow write: if isOrgAdmin(orgId); // change roles, etc.
  }

  match /outlets/{outletId} {
    allow read: if isOrgMember(orgId);
    allow write: if isOrgManagerOrAbove(orgId);
  }

  match /sales/{saleId} {
    allow read: if isOrgMember(orgId);
    allow create: if hasRole(orgId, ['cashier', 'manager', 'owner']);
    allow update: if hasRole(orgId, ['manager', 'owner']);
  }

  // etc…
}

Helper functions (in rules):
	•	isOrgMember(orgId) – checks user uid in organizations/{orgId}/users.
	•	hasRole(orgId, rolesArray) – checks that membership role is in the allowed list.

⸻

14. How This All Feels to the User (End-to-End)
	1.	Owner signs up → creates organization & main outlet.
	2.	Owner configures branding, tax, receipts.
	3.	Owner invites manager, cashiers, pharmacists.
	4.	Inventory Officer adds products and first stock batches.
	5.	Cashier logs in, selects outlet, opens POS.
	6.	During sale:
	•	They search/scan, add items, see stock + price.
	•	If AI module enabled, they may get interaction alerts.
	7.	At end of day, manager uses Reports for daily sales, cash reconciliation.
	8.	Monthly, Owner sees billing, upgrades plan as needed.
	9.	Over time, AI engine proposes:
	•	“Order 120 units of X for Outlet Y before 20th”.

⸻

If you’d like, next I can:
	•	Turn this into a full technical spec for engineers (with API endpoints, Firestore indexes, and Cloud Function signatures), or
	•	Design screen-by-screen UI wireframes for each module (Auth, Dashboard, POS, Inventory, Procurement, Reports) in a format you can hand to a designer or build directly in Next.js + ShadCN.

Reference context  ￼