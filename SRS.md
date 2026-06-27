# Software Requirements Specification (SRS)

## AI-Pharmacy Multi-Tenant Outlet Management System

**Version:** 2.1
**Date:** June 27, 2026
**Status:** Active
**Previous Version:** 2.0 (June 27, 2026)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [System Architecture](#5-system-architecture)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Requirements](#7-data-requirements)
8. [User Roles and Permissions](#8-user-roles-and-permissions)
9. [Global Market Strategy](#9-global-market-strategy)
10. [Monetization & Business Model](#10-monetization--business-model)
11. [Compliance & Data Governance](#11-compliance--data-governance)
12. [Competitive Differentiation](#12-competitive-differentiation)
13. [Appendices](#13-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the AI-Pharmacy Multi-Tenant Outlet Management System. It describes functional and non-functional requirements, system architecture, business model, global market strategy, and compliance requirements for developers, testers, project managers, investors, and stakeholders.

### 1.2 Scope

**AI-Pharmacy** is a cloud-based, multi-tenant SaaS platform designed to enable pharmacy businesses worldwide to:

- Manage multiple pharmacy outlets/branches from a single dashboard
- Track inventory with batch-level and expiry date management
- Process point-of-sale transactions with configurable tax rules
- Manage staff with role-based access control and email invitations
- Handle procurement and supplier relationships
- Generate sales reports and analytics
- Provide AI-powered demand forecasting, drug interaction alerts, and fraud detection (roadmap)

The system supports independent organizations (tenants) with complete data isolation, multi-currency support, configurable tax regimes, and flexible role-based access.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| SaaS | Software as a Service |
| POS | Point of Sale |
| SKU | Stock Keeping Unit |
| FIFO | First In, First Out |
| PR | Purchase Requisition |
| PO | Purchase Order |
| GRN | Goods Receipt Note |
| RBAC | Role-Based Access Control |
| VAT | Value Added Tax |
| GST | Goods and Services Tax |
| GDPR | General Data Protection Regulation |
| i18n | Internationalization |
| MRR | Monthly Recurring Revenue |

### 1.4 References

- [Development Concept Document](Develpoment.md)
- [Implementation Plan](IMPLEMENTATION_PLAN.md)
- [Project README](README.md)
- [Firebase Documentation](https://firebase.google.com/docs)

### 1.5 Overview

This document is organized into thirteen sections covering system description, functional requirements, interface specifications, architecture, quality attributes, data models, security, global market strategy, monetization, compliance, and competitive positioning.

---

## 2. Overall Description

### 2.1 Product Perspective

AI-Pharmacy is a standalone web-based SaaS platform operating across global markets. It integrates with:

- **Firebase Services**: Authentication, Firestore database, Cloud Functions, Cloud Storage, Hosting
- **Payment Gateways**: Stripe (global), Flutterwave (Africa), Razorpay (India) — planned
- **Barcode Scanners**: USB/Bluetooth HID devices for POS
- **Receipt Printers**: Thermal and standard printers via browser print API
- **Mobile Devices**: Fully responsive web interface for tablets and phones

### 2.2 Product Functions

1. **Public Landing & Self-Service Onboarding**
   - Marketing landing page with value proposition, pricing tiers, and testimonials
   - Self-service registration with no credit card required
   - Guided 2-step onboarding (organization setup, first branch creation)

2. **Multi-Tenant Organization Management**
   - Independent organization registration with data isolation
   - Multi-organization membership (one user, many orgs)
   - Organization switching from any page
   - Configurable currency, tax type, and tax rate per organization

3. **Outlet/Branch Management**
   - Create and manage multiple outlets with license tracking
   - Assign staff to specific branches
   - Outlet-scoped inventory and sales views

4. **Inventory Management**
   - Product catalog with pharmaceutical metadata (generic name, strength, form, prescription flags)
   - Batch-level stock tracking with expiry date management
   - Low stock alerts and expiry warnings
   - FIFO stock deduction logic

5. **Point of Sale (POS)**
   - Fast product search and barcode scanning
   - Shopping cart with quantity management
   - Configurable tax calculation (VAT, GST, Sales Tax)
   - Multiple payment methods (cash, mobile money, card)
   - Digital receipt generation

6. **Staff Management**
   - Email invitation system with secure token-based acceptance
   - 5 role types with granular permission matrix
   - Branch assignment per staff member
   - Role-based navigation filtering and page access enforcement

7. **Self-Service Account Management**
   - Password reset via email
   - Profile editing
   - Organization settings with real-time save
   - Help & support links, feedback channel

8. **Reports and Analytics** (roadmap)
   - Sales reports (daily, weekly, monthly)
   - Inventory valuation and expiry reports
   - Staff performance metrics

9. **AI Modules** (roadmap)
   - Demand forecasting with reorder recommendations
   - Drug interaction alerts at POS
   - Fraud detection for anomalous transaction patterns

### 2.3 User Classes and Characteristics

| User Class | Technical Expertise | Frequency of Use | Key Functions |
|------------|-------------------|------------------|---------------|
| **Owner/Admin** | Medium | Daily | Full system access, billing, configuration, staff management |
| **Manager** | Medium | Daily | Outlet operations, staff management, procurement, reports |
| **Pharmacist** | Low | Daily | Inventory management, dispensing, stock adjustments |
| **Cashier** | Low | Daily | POS operations, receipt generation |
| **Inventory Officer** | Low | Daily | Stock management, procurement, stock adjustments |

### 2.4 Operating Environment

- **Client**: Modern web browsers (Chrome 100+, Firefox 100+, Safari 16+, Edge 100+)
- **Server**: Firebase Cloud Functions (Node.js 18+ runtime)
- **Database**: Firebase Firestore (NoSQL document database)
- **Hosting**: Firebase App Hosting
- **Framework**: Next.js 16 (React 19, App Router)
- **Language**: TypeScript 5.9
- **Styling**: TailwindCSS 3.4
- **Devices**: Desktop, tablets, smartphones (minimum 360px width)

### 2.5 Design and Implementation Constraints

- Firebase as primary backend (Authentication, Firestore, Cloud Functions, Storage)
- Multi-tenant architecture with strict data isolation per organization
- Responsive design for minimum 360px viewport width
- Page load times under 3 seconds on 4G connections
- Role-based access enforced at both UI and database levels
- Configurable tax and currency per organization (no hardcoded regional assumptions)

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have internet connectivity (offline mode planned for Phase 3)
- Users have modern web browsers
- Organizations have valid email addresses for staff invitations
- Payment gateways are available in target markets

**Dependencies:**
- Firebase service availability (99.95% SLA)
- Third-party payment gateway APIs
- Email delivery for invitations and password resets
- Barcode scanner and printer hardware compatibility

---

## 3. System Features

### 3.1 Public Landing Page & Marketing

#### 3.1.1 Description
Public-facing landing page that communicates value proposition, pricing, features, and trust signals to prospective customers worldwide.

#### 3.1.2 Functional Requirements

**FR-LAND-001**: The system shall display a marketing landing page at the root URL (/) for unauthenticated users.

**FR-LAND-002**: The landing page shall include: hero section with CTA, feature grid, pricing tiers (Starter/Professional/Enterprise), testimonials, trust statistics, and footer.

**FR-LAND-003**: Authenticated users visiting the root URL shall be redirected to the dashboard.

**FR-LAND-004**: The landing page shall include navigation links to sign in and registration.

**FR-LAND-005**: The landing page shall be responsive and render correctly on mobile devices.

#### 3.1.3 Priority
High — First impression for all potential customers

---

### 3.2 Authentication and Authorization

#### 3.2.1 Description
Secure user authentication with multi-organization membership and role-based access control.

#### 3.2.2 Functional Requirements

**FR-AUTH-001**: The system shall allow users to register with email and password.

**FR-AUTH-002**: The system shall authenticate users using Firebase Authentication.

**FR-AUTH-003**: The system shall support password reset via email using Firebase's sendPasswordResetEmail API.

**FR-AUTH-004**: The system shall enforce password complexity requirements (minimum 8 characters).

**FR-AUTH-005**: The system shall automatically redirect authenticated users to the dashboard.

**FR-AUTH-006**: The system shall redirect unauthenticated users to the login page for protected routes.

**FR-AUTH-007**: The system shall maintain user session state across browser tabs.

**FR-AUTH-008**: The system shall allow users to sign out from any page via the sidebar logout button.

**FR-AUTH-009**: The system shall support multi-organization membership — a single user can belong to multiple organizations.

**FR-AUTH-010**: The system shall provide an organization selector for users with multiple memberships.

**FR-AUTH-011**: The system shall persist the selected organization across sessions via localStorage.

**FR-AUTH-012**: The system shall display the user's real name and role in the sidebar (not hardcoded values).

#### 3.2.3 Priority
High — Critical for system security

---

### 3.3 Organization Onboarding

#### 3.3.1 Description
Self-service 2-step wizard for new organizations to configure their pharmacy business.

#### 3.3.2 Functional Requirements

**FR-ORG-001**: The system shall guide new users through a 2-step onboarding wizard.

**FR-ORG-002**: Step 1 shall collect organization details:
- Organization name (required)
- Currency (required, from a globally comprehensive list covering Africa, Americas, Europe, Asia-Pacific, and Middle East)
- Tax rate (required, configurable decimal percentage)

**FR-ORG-003**: Step 2 shall collect first branch details:
- Branch name (required)
- Address (required)
- Phone number (required)
- Pharmacy license number (required)

**FR-ORG-004**: The system shall create a unique organization ID for each tenant.

**FR-ORG-005**: The system shall set the registering user as the organization owner.

**FR-ORG-006**: The system shall redirect to the dashboard after successful onboarding.

**FR-ORG-007**: The currency selector shall support 30+ currencies organized by region (Africa, Americas, Europe, Asia-Pacific, Middle East).

#### 3.3.3 Priority
High — Required for tenant setup

---

### 3.4 Branch/Outlet Management

#### 3.4.1 Description
Manage multiple pharmacy outlets with individual configurations and outlet-scoped operations.

#### 3.4.2 Functional Requirements

**FR-BRANCH-001**: The system shall allow creation of new branches with name, address, phone, and pharmacy license number.

**FR-BRANCH-002**: The system shall display all branches in a searchable grid view.

**FR-BRANCH-003**: The system shall provide a real outlet selector in the header, populated from the organization's actual branches.

**FR-BRANCH-004**: The outlet selector shall include an "All Outlets" option for aggregate views.

**FR-BRANCH-005**: The system shall allow editing and soft-deleting branches.

**FR-BRANCH-006**: The system shall display branch statistics (staff count, product count).

**FR-BRANCH-007**: The system shall restrict branch management pages to Owner and Manager roles only.

#### 3.4.3 Priority
High — Core functionality

---

### 3.5 Staff Management

#### 3.5.1 Description
Staff management with email invitations, role-based permissions, and branch assignments.

#### 3.5.2 Functional Requirements

**FR-STAFF-001**: The system shall support five role types: Owner, Manager, Pharmacist, Cashier, Inventory Officer.

**FR-STAFF-002**: The system shall allow inviting staff via email with role and branch assignments.

**FR-STAFF-003**: The invitation system shall generate secure random tokens (32 bytes, hex-encoded) with 7-day expiry.

**FR-STAFF-004**: Invited users shall accept invitations via a token-based URL (/auth/accept-invite?token=...).

**FR-STAFF-005**: New invitees shall be prompted to create an account; existing users shall have the organization added to their memberships.

**FR-STAFF-006**: The system shall restrict staff management pages to Owner and Manager roles.

**FR-STAFF-007**: The system shall display staff with role-based filtering and search.

#### 3.5.3 Priority
High — Essential for access control

---

### 3.6 Inventory Management

#### 3.6.1 Description
Product catalog and stock management with pharmaceutical-specific metadata.

#### 3.6.2 Functional Requirements

**FR-INV-001**: The system shall allow adding products with: name, generic name, SKU, barcode, category, strength, form (tablet/capsule/syrup/injection/cream/drops/inhaler/other), pack size, manufacturer, and prescription requirement flag.

**FR-INV-002**: The system shall allow adding stock batches with: product reference, branch reference, batch number, expiry date, quantity, cost price, selling price, supplier, and received date.

**FR-INV-003**: The system shall display product statistics: total products, in-stock, low-stock (<10 units), expiring soon (<30 days).

**FR-INV-004**: The system shall highlight low stock (orange) and expiring products (red).

**FR-INV-005**: The system shall support batch-level stock tracking with FIFO deduction logic.

**FR-INV-006**: The system shall allow all roles to view inventory; only Owner, Manager, Pharmacist, and Inventory Officer may add/edit products.

#### 3.6.3 Priority
High — Core business functionality

---

### 3.7 Point of Sale (POS)

#### 3.7.1 Description
Sales processing interface with cart management and configurable tax calculation.

#### 3.7.2 Functional Requirements

**FR-POS-001**: The system shall provide product search by name, SKU, or barcode.

**FR-POS-002**: The system shall display a shopping cart with product details, quantity controls, unit price, and line totals.

**FR-POS-003**: The system shall calculate subtotal, tax (using the organization's configured tax rate, not hardcoded), and grand total.

**FR-POS-004**: The system shall support multiple payment methods: cash, mobile money, card.

**FR-POS-005**: The system shall process checkout: create sale record, deduct stock (FIFO), generate receipt, clear cart.

**FR-POS-006**: The system shall restrict POS access to Owner, Manager, Pharmacist, and Cashier roles.

**FR-POS-007**: The system shall validate stock availability before adding to cart.

#### 3.7.3 Priority
High — Primary revenue-generating feature

---

### 3.8 Settings Management

#### 3.8.1 Description
Settings with real persistence for organization, profile, notifications, security, and billing.

#### 3.8.2 Functional Requirements

**FR-SET-001**: The system shall provide a tabbed settings interface (Organization, Profile, Notifications, Security, Billing).

**FR-SET-002**: Organization settings shall persist changes to Firestore on save (name, email, phone, currency, tax rate, address).

**FR-SET-003**: Profile settings shall persist changes to the user's Firestore document (name, phone).

**FR-SET-004**: The system shall display success/error feedback after save operations.

**FR-SET-005**: The currency selector in settings shall match the comprehensive global currency list used during onboarding.

**FR-SET-006**: Security settings shall include a password reset option using Firebase Authentication.

**FR-SET-007**: Settings pages shall be restricted to Owner and Manager roles.

#### 3.8.3 Priority
Medium — Important for customization

---

### 3.9 Dashboard

#### 3.9.1 Description
Overview dashboard with key metrics, alerts, and quick actions.

#### 3.9.2 Functional Requirements

**FR-DASH-001**: The dashboard shall display real-time data from Firestore (sales totals, product counts, low stock alerts, expiring products).

**FR-DASH-002**: The dashboard shall show recent transactions.

**FR-DASH-003**: The dashboard shall be accessible to all authenticated roles.

**FR-DASH-004**: Sales trends, top products, and branch comparison metrics are planned for Phase 2.

#### 3.9.3 Priority
Medium — Analytics and insights

---

### 3.10 Self-Service Features

#### 3.10.1 Description
Features enabling users to manage their accounts independently.

#### 3.10.2 Functional Requirements

**FR-SELF-001**: The system shall provide a password reset page (/auth/reset-password) with email input and Firebase sendPasswordResetEmail integration.

**FR-SELF-002**: The login page shall include a "Forgot password?" link to the reset page.

**FR-SELF-003**: The sidebar shall include Help & Support and Send Feedback links.

**FR-SELF-004**: The system shall display the authenticated user's real name and initials in the sidebar.

**FR-SELF-005**: The system shall provide a visible logout button in the sidebar user section.

**FR-SELF-006**: Self-service data export (CSV/PDF) is planned for Phase 2.

**FR-SELF-007**: Self-service account deletion (GDPR right-to-delete) is planned for Phase 2.

#### 3.10.3 Priority
High — Critical for user retention and compliance

---

### 3.11 Role-Based Access Enforcement

#### 3.11.1 Description
UI-level enforcement of the permission matrix defined in Section 8.

#### 3.11.2 Functional Requirements

**FR-RBAC-001**: The sidebar navigation shall only display pages the current user's role has access to.

**FR-RBAC-002**: Protected pages shall display an "Access Restricted" message with a link to the dashboard when accessed by unauthorized roles.

**FR-RBAC-003**: The RoleGuard component shall check the user's current membership role against the page's allowed roles.

**FR-RBAC-004**: The permission matrix shall be defined in a single PAGE_ROLES constant for consistency between navigation filtering and page guards.

#### 3.11.3 Priority
High — Security and compliance

---

## 4. External Interface Requirements

### 4.1 User Interfaces

**UI-001**: Consistent teal primary color scheme with white backgrounds.

**UI-002**: Fully responsive (desktop, tablet, mobile down to 360px).

**UI-003**: Lucide React icons throughout.

**UI-004**: Loading states for all asynchronous operations.

**UI-005**: Empty states with helpful messages and CTAs.

**UI-006**: Error messages displayed inline with AlertCircle icons.

**UI-007**: Success feedback displayed inline with CheckCircle icons.

**UI-008**: Left sidebar navigation with role-filtered menu items.

**UI-009**: Mobile-responsive navigation.

**UI-010**: Real user name, initials, and role displayed in sidebar (not hardcoded).

### 4.2 Hardware Interfaces

**HW-001**: USB barcode scanners (HID device mode) — planned.

**HW-002**: Thermal receipt printers via browser print dialog — planned.

**HW-003**: Touch-screen device support.

### 4.3 Software Interfaces

**SW-001**: Firebase Authentication for user identity.

**SW-002**: Firebase Firestore as primary database.

**SW-003**: Firebase Cloud Functions for server-side logic (email invitations, scheduled cleanup).

**SW-004**: Firebase Cloud Storage for logos and documents — planned.

**SW-005**: Payment gateways (Stripe, Flutterwave, Razorpay) — planned.

### 4.4 Communication Interfaces

**COM-001**: HTTPS for all communications.

**COM-002**: Email notifications via Cloud Functions (Nodemailer).

**COM-003**: REST API endpoints via Cloud Functions.

---

## 5. System Architecture

### 5.1 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js (App Router) | 16.x |
| **UI Library** | React | 19.x |
| **Language** | TypeScript | 5.9 |
| **Styling** | TailwindCSS | 3.4 |
| **Icons** | Lucide React | Latest |
| **Backend** | Firebase Cloud Functions | Node.js 18 |
| **Database** | Firebase Firestore | NoSQL |
| **Authentication** | Firebase Auth | Latest |
| **Hosting** | Firebase App Hosting | Latest |

### 5.2 Multi-Tenant Architecture

#### 5.2.1 Data Isolation Model

```
Firestore Structure:

users/
  {userId}/
    - displayName, email, phone, photoUrl
    - memberships: [{ organizationId, role, assignedOutletIds, joinedAt }]
    - createdAt, lastLoginAt

organizations/
  {organizationId}/
    - name, logo, currency, taxRate, ownerId, email, phone, address, country
    - createdAt, updatedAt

    branches/
      {branchId}/
        - name, address, phone, license, organizationId, createdAt

    products/
      {productId}/
        - name, genericName, sku, barcode, category, form, strength
        - packSize, manufacturer, requiresPrescription
        - organizationId, createdAt

    stock/
      {stockBatchId}/
        - productId, branchId, batchNumber, expiryDate
        - quantity, costPrice, sellingPrice, supplier
        - organizationId, createdAt

    staff/
      {staffId}/
        - userId, name, email, role, assignedBranches
        - organizationId, createdAt

    invites/
      {inviteId}/
        - email, role, assignedOutletIds, status, inviteToken
        - invitedBy, createdAt, expiresAt

    sales/
      {saleId}/
        - branchId, cashierId, items[], subtotal, tax, total
        - paymentMethod, status, receiptNumber, createdAt
```

#### 5.2.2 Security Rules

- All Firestore reads/writes verify organizationId membership
- Users can only access data from organizations they belong to
- Role-based access enforced at both UI (RoleGuard component) and database (Firestore rules) levels
- Staff see only data for their assigned branches

### 5.3 Component Architecture

```
src/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Public landing page (marketing)
│   ├── layout.tsx               # Root layout with AuthProvider, OrganizationProvider
│   ├── auth/
│   │   ├── login/               # Email/password login
│   │   ├── register/            # Account creation
│   │   ├── reset-password/      # Password reset (Firebase sendPasswordResetEmail)
│   │   ├── accept-invite/       # Token-based invite acceptance
│   │   └── select-org/          # Multi-org selector
│   ├── onboarding/
│   │   ├── organization/        # Step 1: org name, currency, tax
│   │   └── branch/              # Step 2: first branch setup
│   ├── dashboard/               # KPIs, alerts, recent sales
│   ├── inventory/               # Product catalog, stock batches
│   ├── pos/                     # Point of sale
│   ├── outlets/                 # Branch management
│   ├── staff/                   # Staff directory, invitations
│   └── settings/                # Org, profile, notifications, security, billing
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx          # Role-filtered navigation, real user info, logout
│   │   └── Header.tsx           # Search, org selector, real outlet selector
│   ├── modals/
│   │   └── InviteStaffModal.tsx # Staff invitation with role & branch assignment
│   ├── RoleGuard.tsx            # Role-based page access enforcement
│   ├── ProtectedRoute.tsx       # Auth guard (redirect if not logged in)
│   └── OrganizationSelector.tsx # Multi-org dropdown
│
├── contexts/
│   ├── AuthContext.tsx           # Auth state, multi-org profile, org switching
│   └── OrganizationContext.tsx   # Current org data, branches, selected branch
│
├── lib/
│   ├── firebase.ts              # Firebase initialization
│   ├── cloudFunctions.ts        # Cloud Function wrappers
│   ├── utils.ts                 # Utility functions (cn)
│   └── services/
│       ├── organizationService.ts  # Org CRUD (with email, phone, address, country)
│       ├── branchService.ts        # Branch CRUD
│       ├── productService.ts       # Product & stock batch CRUD
│       ├── staffService.ts         # Staff CRUD
│       ├── inviteService.ts        # Token-based invitation system
│       └── userService.ts          # Global profile, memberships
│
└── types/
    ├── user.ts                  # GlobalUserProfile, Membership, UserRole
    ├── product.ts               # Product, StockBatch
    ├── staff.ts                 # StaffMember
    └── invite.ts                # Invite
```

---

## 6. Non-Functional Requirements

### 6.1 Performance

**NFR-PERF-001**: Page load time < 3 seconds on 4G connection.

**NFR-PERF-002**: Search results within 500ms of user input.

**NFR-PERF-003**: POS checkout within 2 seconds.

**NFR-PERF-004**: Support 100 concurrent users per organization.

**NFR-PERF-005**: Firestore indexes for all common query patterns.

### 6.2 Security

**NFR-SEC-001**: Passwords hashed via Firebase Authentication (bcrypt).

**NFR-SEC-002**: All communications over HTTPS/TLS 1.3.

**NFR-SEC-003**: Session tokens managed by Firebase (auto-expiry, refresh).

**NFR-SEC-004**: Invitation tokens: 32-byte cryptographically random, hex-encoded, 7-day expiry.

**NFR-SEC-005**: Role-based access enforced at UI level (RoleGuard, sidebar filtering) and database level (Firestore rules).

**NFR-SEC-006**: Rate limiting on Cloud Function endpoints.

**NFR-SEC-007**: Data encrypted at rest (Firestore default).

**NFR-SEC-008**: Audit logging for critical operations (sales, stock changes, role changes).

### 6.3 Reliability

**NFR-REL-001**: System uptime >= 99.5% per month (backed by Firebase SLA).

**NFR-REL-002**: Automatic data backup (Firestore managed).

**NFR-REL-003**: Graceful error handling with user-visible feedback (no silent failures).

**NFR-REL-004**: Error messages never expose internal system information.

### 6.4 Usability

**NFR-USE-001**: New users complete onboarding in < 5 minutes.

**NFR-USE-002**: POS sale completable in <= 3 clicks.

**NFR-USE-003**: Sidebar shows real user identity (name, initials, role) — not hardcoded values.

**NFR-USE-004**: All save operations provide success/error feedback.

**NFR-USE-005**: Help & Support and Feedback links accessible from every page via sidebar.

### 6.5 Scalability

**NFR-SCALE-001**: Support up to 10,000 organizations.

**NFR-SCALE-002**: Up to 100 branches per organization.

**NFR-SCALE-003**: Up to 50,000 products per organization.

**NFR-SCALE-004**: Up to 10,000 transactions per day per organization.

### 6.6 Maintainability

**NFR-MAINT-001**: TypeScript strict mode for type safety.

**NFR-MAINT-002**: Service layer pattern for all Firestore operations.

**NFR-MAINT-003**: Environment variables for all configuration (no hardcoded Firebase keys).

**NFR-MAINT-004**: Separation of concerns: contexts, services, components, types.

---

## 7. Data Requirements

### 7.1 Database Schema

#### 7.1.1 Global User Profile

```typescript
interface GlobalUserProfile {
  uid: string;
  displayName: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  memberships: Membership[];
  createdAt: Date;
  lastLoginAt: Date;
}

interface Membership {
  organizationId: string;
  role: UserRole;
  assignedOutletIds: string[];
  joinedAt: Date;
}

type UserRole = "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";
```

#### 7.1.2 Organization

```typescript
interface Organization {
  id: string;
  name: string;
  logo?: string;
  currency: string;
  taxRate: number;
  ownerId: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  createdAt: Date;
  updatedAt?: Date;
}
```

#### 7.1.3 Branch

```typescript
interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  license: string;
  organizationId: string;
  createdAt: Date;
}
```

#### 7.1.4 Product

```typescript
interface Product {
  id: string;
  organizationId: string;
  name: string;
  genericName?: string;
  sku: string;
  barcode?: string;
  category: string;
  strength?: string;
  form: "tablet" | "capsule" | "syrup" | "injection" | "cream" | "drops" | "inhaler" | "other";
  packSize?: string;
  description?: string;
  manufacturer?: string;
  requiresPrescription: boolean;
  createdAt: Date;
  updatedAt?: Date;
}
```

#### 7.1.5 Stock Batch

```typescript
interface StockBatch {
  id: string;
  productId: string;
  organizationId: string;
  branchId: string;
  batchNumber: string;
  expiryDate: Date;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  supplier?: string;
  receivedDate: Date;
  createdAt: Date;
}
```

#### 7.1.6 Sale

```typescript
interface Sale {
  id: string;
  organizationId: string;
  branchId: string;
  cashierId: string;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: "cash" | "mobile_money" | "card";
  status: "completed" | "void" | "refunded";
  receiptNumber: string;
  createdAt: Date;
}

interface SaleItem {
  productId: string;
  productName: string;
  stockBatchId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}
```

#### 7.1.7 Invite

```typescript
interface Invite {
  id: string;
  organizationId: string;
  email: string;
  role: UserRole;
  assignedOutletIds: string[];
  status: "pending" | "accepted" | "expired";
  inviteToken: string;
  invitedBy: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}
```

### 7.2 Data Validation Rules

**VAL-001**: Monetary values stored as positive numbers.

**VAL-002**: Dates stored as Firebase Timestamps.

**VAL-003**: Email addresses validated using standard format.

**VAL-004**: Phone numbers accept international formats.

**VAL-005**: SKU and barcode unique within an organization.

**VAL-006**: Stock quantities are non-negative integers.

**VAL-007**: Invitation tokens are 64-character hex strings (32 random bytes).

---

## 8. User Roles and Permissions

### 8.1 Permission Matrix

| Feature | Owner | Manager | Pharmacist | Cashier | Inventory Officer |
|---------|-------|---------|------------|---------|-------------------|
| **Dashboard** | Yes | Yes | Yes | Yes | Yes |
| **View Inventory** | Yes | Yes | Yes | Yes | Yes |
| **Add/Edit Products** | Yes | Yes | Yes | No | Yes |
| **Delete Products** | Yes | Yes | No | No | No |
| **Add Stock** | Yes | Yes | Yes | No | Yes |
| **View POS** | Yes | Yes | Yes | Yes | No |
| **Process Sales** | Yes | Yes | Yes | Yes | No |
| **Void Transactions** | Yes | Yes | No | No | No |
| **View Outlets** | Yes | Yes | No | No | No |
| **Add/Edit Outlets** | Yes | Yes | No | No | No |
| **View Staff** | Yes | Yes | No | No | No |
| **Invite Staff** | Yes | Yes | No | No | No |
| **Delete Staff** | Yes | No | No | No | No |
| **View Reports** | Yes | Yes | Yes | No | No |
| **Organization Settings** | Yes | Yes | No | No | No |
| **Billing** | Yes | No | No | No | No |

### 8.2 Enforcement

**PERM-001**: Sidebar navigation items are filtered by role (PAGE_ROLES constant).

**PERM-002**: Page-level RoleGuard component blocks unauthorized access with "Access Restricted" message.

**PERM-003**: Firestore security rules enforce role checks on read/write operations.

**PERM-004**: UI hides action buttons (edit, delete, invite) for roles without permission.

---

## 9. Global Market Strategy

### 9.1 Target Markets (Priority Order)

| Tier | Markets | Currency | Tax System | Rationale |
|------|---------|----------|------------|-----------|
| **Tier 1** | Uganda, Kenya, Tanzania, Nigeria, Ghana | UGX, KES, TZS, NGN, GHS | VAT 16-18% | Home market, high demand, low competition |
| **Tier 2** | India, Pakistan, Bangladesh, Philippines | INR, PKR, BDT, PHP | GST/VAT varies | Massive pharmacy density, price-sensitive |
| **Tier 3** | South Africa, Egypt, Senegal (francophone Africa) | ZAR, EGP, XOF | VAT varies | Regional expansion, multi-language need |
| **Tier 4** | UK, EU, USA, Canada, Australia | GBP, EUR, USD, CAD, AUD | VAT/GST/Sales Tax | Premium pricing, strict compliance |
| **Tier 5** | UAE, Saudi Arabia, Qatar | AED, SAR, QAR | VAT 5-15% | High purchasing power, fast digitization |

### 9.2 Currency Support

The system supports 30+ currencies organized by region, covering all Tier 1-5 markets. Currency is configurable per organization during onboarding and in settings.

### 9.3 Tax Configurability

- Tax rate is a configurable decimal per organization (not hardcoded)
- Supports VAT, GST, Sales Tax, and zero-rated scenarios
- Tax-exempt products planned for Phase 2

### 9.4 Internationalization Roadmap

- Phase 1 (current): English UI, multi-currency, configurable tax
- Phase 2: French language pack (francophone Africa)
- Phase 3: Hindi, Swahili, Arabic language packs
- Phase 4: RTL layout support (Arabic)

---

## 10. Monetization & Business Model

### 10.1 Pricing Tiers

| Plan | Price | Outlets | Staff | Key Features |
|------|-------|---------|-------|-------------|
| **Starter** | Free forever | 1 | 3 | Basic POS, inventory, email support |
| **Professional** | $29/month | Up to 10 | 25 | Advanced reports, receipt customization, procurement, priority support |
| **Enterprise** | Custom | Unlimited | Unlimited | AI modules, API access, dedicated account manager, SLA, custom data residency |

### 10.2 Revenue Model

- **Freemium**: Free tier drives adoption; conversion to paid at growth inflection (>1 outlet or >3 staff)
- **Seat-based upsell**: Additional staff beyond plan limits
- **Feature-gated upsell**: AI modules, advanced reports, API access
- **Annual discount**: 20% discount for annual billing

### 10.3 Key Metrics

- MRR (Monthly Recurring Revenue)
- Free-to-paid conversion rate (target: 8-12%)
- Net revenue retention (target: >110%)
- Time to first value (target: <5 minutes)
- Churn rate (target: <5% monthly)

---

## 11. Compliance & Data Governance

### 11.1 GDPR Compliance (EU Markets)

- **Right to Access**: Users can view all their data via profile and settings pages
- **Right to Delete**: Self-service account and data deletion (planned Phase 2)
- **Data Export**: CSV/PDF export of all user data (planned Phase 2)
- **Consent Management**: Explicit consent during registration
- **Data Residency**: Firestore region selection per organization (Enterprise plan)

### 11.2 Pharmacy Regulations

- License number tracking per branch
- Prescription-required product flagging
- Batch-level traceability for audits
- Expiry date tracking with automated warnings

### 11.3 Financial Compliance

- Tax calculation per sale with configurable rates
- Sale records with receipt numbers for tax reporting
- Audit trail for all financial transactions (planned Phase 2)

### 11.4 Data Security

- Firebase Authentication (industry-standard identity management)
- Firestore data isolation per organization (multi-tenant security)
- Encrypted data at rest and in transit
- Role-based access control at UI and database levels
- Secure invitation tokens with automatic expiry (64-char hex, 7-day TTL)

### 11.5 Security Hardening (v2.1)

- **Firestore Security Rules**: Deployed `firestore.rules` enforcing per-collection read/write access by role and org membership. Sales are append-only (no update/delete).
- **Signup Atomicity**: If Firestore profile creation fails after Firebase Auth user is created, the auth user is automatically deleted to prevent orphaned accounts.
- **Input Sanitization**: `sanitize.ts` utility provides HTML escaping, email normalization, phone sanitization, and injection prevention for all user-facing inputs.
- **Invite Token Validation**: Token format verified (64-char hex) before database lookup to prevent unnecessary queries.
- **Error Boundary**: Global React ErrorBoundary catches unhandled render errors, prevents white-screen crashes, and provides recovery UI.
- **State Cleanup on Auth Changes**: `onAuthStateChanged` uses cancellation flags to prevent stale async updates from overwriting newer state.

---

## 12. Competitive Differentiation

### 12.1 Market Position

AIPharmacy differentiates from existing pharmacy management solutions through:

| Differentiator | AIPharmacy | Traditional PMS | Generic Retail POS |
|----------------|-----------|----------------|-------------------|
| **Multi-tenant SaaS** | Yes — cloud-native, zero install | Often desktop-installed | Varies |
| **Multi-outlet from Day 1** | Yes — branch management built-in | Usually single-outlet | Usually single-outlet |
| **Pharmacy-specific** | Batch tracking, expiry alerts, prescription flags, drug interactions | Yes | No |
| **Global currency/tax** | 30+ currencies, configurable tax | Usually single-market | Usually single-market |
| **AI capabilities** | Demand forecasting, drug interactions, fraud detection (roadmap) | Rarely | No |
| **Self-service onboarding** | < 5 minutes, no credit card | Requires consultant/training | Varies |
| **Free tier** | Yes | Rarely | Sometimes |
| **Multi-org membership** | Yes — one user, many organizations | No | No |

### 12.2 Key Competitors

- **mPharma** (Africa): Supply chain focused, not SaaS POS
- **PharmEasy** (India): Consumer-facing, not B2B management
- **McKesson/Oracle** (Enterprise): Very expensive, requires IT teams
- **Square/Shopify POS** (Generic): No pharmacy-specific features

### 12.3 Moat

- Pharmacy-specific data model (batches, expiry, prescriptions)
- Multi-tenant multi-org architecture (network effects as chains scale)
- AI layer built on pharmacy transaction data (defensible over time)
- Free tier for adoption in price-sensitive emerging markets

---

## 13. Appendices

### 13.1 Glossary

**Batch Number**: Unique identifier for products from the same manufacturing run.

**FIFO**: First In, First Out — inventory method where oldest stock is sold first.

**Multi-Tenant**: Architecture allowing multiple organizations with isolated data.

**Soft Delete**: Marking records as inactive without physical deletion.

**SKU**: Stock Keeping Unit — unique product identifier.

**RoleGuard**: React component that restricts page access based on user role.

### 13.2 Development Phases

#### Phase 1: MVP (Current — v0.3)
- [x] Authentication with multi-org support
- [x] Self-service onboarding (2-step wizard)
- [x] Password reset flow
- [x] Public landing page with pricing
- [x] Dashboard (UI complete, real data integration in progress)
- [x] Inventory management (product + stock batch CRUD)
- [x] Outlet management
- [x] Staff management with email invitations
- [x] POS UI (cart, search, tax calculation)
- [x] Settings with real persistence (org, profile)
- [x] Role-based access enforcement (sidebar filtering + RoleGuard)
- [x] Real outlet selector in header
- [x] Logout button with real user info in sidebar
- [x] Help/Support and Feedback links
- [x] Global currency support (30+ currencies)
- [x] Firestore security rules (firestore.rules)
- [x] Global error boundary with recovery UI
- [x] Input sanitization utility
- [x] Signup atomicity (rollback on Firestore failure)
- [x] Invite flow hardening (duplicate check, partial-failure rollback, token validation)
- [x] Tax rate consistency (stored as decimal, displayed as percentage)
- [x] Staff service multi-org compatibility
- [x] Race condition fixes (OrganizationContext, AuthContext)
- [x] ProtectedRoute loading state fix (no flash of content)
- [ ] POS backend (sale recording, stock deduction) — in progress
- [ ] Receipt generation — in progress

#### Phase 2: Enhancement
- [ ] Procurement module (PR, PO, GRN)
- [ ] Sales reports and analytics
- [ ] Receipt generation and printing
- [ ] Data export (CSV, PDF)
- [ ] Activity/audit logging
- [ ] Tax-exempt product support
- [ ] Self-service account deletion (GDPR)
- [ ] Subscription billing (Stripe/Flutterwave)
- [ ] French language pack

#### Phase 3: Advanced
- [ ] AI demand forecasting
- [ ] Drug interaction alerts at POS
- [ ] Fraud detection
- [ ] Offline POS mode (Service Worker + IndexedDB)
- [ ] Mobile app (React Native)
- [ ] Multi-language support (Hindi, Swahili, Arabic)
- [ ] RTL layout support

#### Phase 4: Scale
- [ ] Platform super admin dashboard
- [ ] API access for integrations
- [ ] Custom data residency (Enterprise)
- [ ] Advanced analytics with cached reports

### 13.3 Corrective Actions Taken (v1.0 → v2.0)

| Issue | Critique | Action Taken |
|-------|----------|-------------|
| D1 | No landing page | Created public marketing page with hero, features, pricing, testimonials, CTA |
| D2 | Hardcoded currency (UGX) | Expanded to 30+ currencies organized by region |
| D7 | No role-based access enforcement | Created RoleGuard component and role-filtered sidebar navigation |
| D8 | Sidebar shows hardcoded "Admin User" | Sidebar now displays real user name, initials, and role |
| D9 | No logout button | Added functional logout button to sidebar |
| D10 | Outlet selector hardcoded | Wired outlet selector to real branches from OrganizationContext |
| S1 | No password reset | Created /auth/reset-password page with Firebase integration |
| S3 | No help/support links | Added Help & Support and Send Feedback links to sidebar |
| S6 | No feedback channel | Added feedback email link in sidebar |
| B1 | No pricing/monetization | Defined 3-tier pricing model (Starter/Professional/Enterprise) on landing page and in SRS |
| B2 | No competitive differentiation | Added Section 12 with competitor analysis and moat definition |
| B3 | No compliance strategy | Added Section 11 with GDPR, pharmacy regulation, and financial compliance plans |
| B5 | SRS version stale | Rewrote SRS to v2.0 with current tech stack, architecture, and all changes reflected |
| Settings | Save button was a no-op | Settings now persist to Firestore with success/error feedback |

### 13.4 Stability & Security Fixes (v2.0 → v2.1)

| Area | Issue | Fix |
|------|-------|-----|
| Auth | Signup creates Firebase user but Firestore profile can fail, leaving orphaned auth account | Added try-catch: if `setDoc` fails, `deleteUser` rolls back the Firebase auth user |
| Auth | `onAuthStateChanged` callback can set stale state if component unmounts or auth changes rapidly | Added cancellation flag in useEffect cleanup |
| Auth | Logout clears state after `firebaseSignOut`, racing with `onAuthStateChanged` callback | State cleared before `firebaseSignOut` call |
| Auth | `any` type in memberships mapping | Replaced with explicit Firestore field types |
| Invite | No check for existing membership before accepting invite | Added `getOrgUserProfile` check before acceptance |
| Invite | Multi-step invite acceptance (addMembership + createOrgUserProfile + acceptInvite) can partially fail | Added rollback: if org profile creation fails, membership is removed |
| Invite | Token format not validated before database lookup | Added `isValidTokenFormat` (64-char hex check) |
| Invite | `expiresAt` comparison may fail if Firestore Timestamp not converted to Date | Added safe Date conversion with `isNaN` guard |
| Settings | Tax rate stored as decimal (0.18) but displayed and saved as integer (18), causing data corruption | Settings now converts: multiply by 100 on load, divide by 100 on save |
| Staff | `staffService.create/update/delete` writes legacy flat fields to user doc, breaking multi-org users | Rewritten to use `userService.addMembership/updateMembership/removeMembership` |
| OrgContext | Race condition: if `organizationId` changes during async load, stale data overwrites new org | Added cancellation flag in useEffect |
| OrgContext | `Branch` interface not exported, causing TypeScript error in outlets page | Exported `Branch` interface |
| ProtectedRoute | Returns `null` during redirect, causing brief flash of missing content | Shows loading spinner during redirect |
| Global | No error boundary — unhandled render errors cause white screen | Added `ErrorBoundary` component wrapping root layout |
| Global | No Firestore security rules in repository | Created `firestore.rules` with per-collection access control |
| Global | No input sanitization | Created `sanitize.ts` with HTML escaping, email/phone sanitization |

### 13.5 Next Features Roadmap (v2.2+)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Data Export** | High | CSV and PDF export for inventory, sales, and staff data. Required for GDPR Right to Access. |
| **Audit Logging** | High | Record all create/update/delete operations with user, timestamp, and previous values. Essential for pharmacy compliance. |
| **Receipt Generation** | High | Generate printable/downloadable receipts from completed sales. Thermal printer format support. |
| **Offline POS Mode** | Medium | Service Worker + IndexedDB for offline sale processing. Sync when reconnected. Critical for markets with unreliable internet. |
| **Sales Analytics Dashboard** | Medium | Revenue trends, top-selling products, peak hours, per-branch comparison. Filter by date range. |
| **Subscription Billing** | Medium | Stripe (international) + Flutterwave (Africa) integration for Professional/Enterprise plan billing. |
| **Low Stock Alerts** | Medium | Email/in-app notifications when stock falls below configurable threshold per product. |
| **Expiry Alerts** | Medium | Automated alerts for products expiring within 30/60/90 days. Dashboard widget. |
| **Drug Interaction Checker** | Low | AI-powered drug interaction warnings during POS checkout when multiple medications are sold together. |
| **Multi-language Support** | Low | i18n framework with French (Phase 2), Hindi, Swahili, Arabic (Phase 3). RTL layout for Arabic. |

### 13.6 Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-06 | Development Team | Initial SRS document |
| 2.0 | 2026-06-27 | Development Team | Major revision: added landing page, password reset, role-based access, global currency support, real outlet selector, sidebar user info & logout, settings persistence. Added sections 9-12 (market strategy, monetization, compliance, competitive differentiation). Updated all sections to reflect current architecture (Next.js 16, React 19, TypeScript 5.9). |
| 2.1 | 2026-06-27 | Development Team | Stability & security hardening: fixed signup atomicity, invite flow rollback, tax rate consistency, staff service multi-org support, race conditions in contexts. Added error boundary, Firestore security rules, input sanitization. Added sections 11.5, 13.4, 13.5 (security hardening, stability fixes, next features roadmap). Bumped to v0.3. |

---

**Document Status:** Active
**Next Review Date:** 2026-09-01
**Approval Required From:** Product Owner, Lead Developer, Business Lead

---

*This SRS document is a living document and will be updated as requirements evolve.*
