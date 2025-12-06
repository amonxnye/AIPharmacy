# Software Requirements Specification (SRS)

## AI-Pharmacy Multi-Tenant Outlet Management System

**Version:** 1.0
**Date:** December 6, 2025
**Status:** Draft

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
9. [Appendices](#9-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a complete description of the AI-Pharmacy Multi-Tenant Outlet Management System. It describes the functional and non-functional requirements, system architecture, and design constraints for developers, testers, project managers, and stakeholders.

### 1.2 Scope

**AI-Pharmacy** is a cloud-based, multi-tenant SaaS platform designed to enable pharmacy businesses to:

- Manage multiple pharmacy outlets/branches
- Track inventory with batch and expiry management
- Process point-of-sale transactions
- Manage staff with role-based access control
- Handle procurement and supplier relationships
- Generate sales reports and analytics
- Provide AI-powered insights (future phase)

The system supports independent organizations (tenants) with complete data isolation, custom branding, and flexible configuration.

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

### 1.4 References

- [Development Concept Document](Develpoment.md)
- [Firebase Documentation](Firebase.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Project README](README.md)

### 1.5 Overview

This document is organized into nine sections covering:
- System description and context
- Detailed functional requirements
- Interface specifications
- Architecture and design
- Quality attributes
- Data models and security

---

## 2. Overall Description

### 2.1 Product Perspective

AI-Pharmacy is a standalone web-based system that operates as a multi-tenant SaaS platform. It integrates with:

- **Firebase Services**: Authentication, Firestore database, Cloud Functions, Hosting
- **Payment Gateways**: Stripe/Flutterwave (future)
- **Barcode Scanners**: USB/Bluetooth devices for POS
- **Receipt Printers**: Thermal and standard printers
- **Mobile Devices**: Responsive web interface for tablets and phones

### 2.2 Product Functions

The major functions include:

1. **Multi-Tenant Organization Management**
   - Independent organization registration
   - Custom branding and configuration
   - Subscription and billing management

2. **Outlet/Branch Management**
   - Create and manage multiple outlets
   - Assign staff to specific branches
   - Track branch-level performance

3. **Inventory Management**
   - Product catalog management
   - Batch tracking with expiry dates
   - Stock movements (in/out/transfer)
   - Low stock and expiry alerts

4. **Point of Sale (POS)**
   - Fast product search and barcode scanning
   - Shopping cart management
   - Multiple payment methods
   - Digital receipt generation

5. **Staff Management**
   - User invitation and onboarding
   - Role-based access control
   - Branch assignment
   - Activity tracking

6. **Procurement**
   - Purchase requisitions
   - Purchase orders
   - Supplier management
   - Goods receipt notes

7. **Reports and Analytics**
   - Sales reports (daily, weekly, monthly)
   - Inventory reports
   - Financial summaries
   - Staff performance metrics

8. **Settings and Configuration**
   - Organization settings
   - User profile management
   - Notification preferences
   - Security settings

### 2.3 User Classes and Characteristics

| User Class | Technical Expertise | Frequency of Use | Key Functions |
|------------|-------------------|------------------|---------------|
| **Owner/Admin** | Medium | Daily | Full system access, billing, configuration |
| **Manager** | Medium | Daily | Outlet operations, staff management, procurement |
| **Pharmacist** | Low | Daily | Inventory, dispensing assistance |
| **Cashier** | Low | Daily | POS operations, receipt generation |
| **Inventory Officer** | Low | Daily | Stock management, procurement |

### 2.4 Operating Environment

- **Client**: Modern web browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Server**: Firebase Cloud Functions (Node.js runtime)
- **Database**: Firebase Firestore (NoSQL document database)
- **Hosting**: Firebase Hosting or Vercel
- **Devices**: Desktop computers, tablets, smartphones

### 2.5 Design and Implementation Constraints

- Must use Firebase as the primary backend service
- Must support multi-tenant architecture with complete data isolation
- Must be responsive and work on devices with minimum 360px width
- Must comply with data protection regulations (GDPR, local data laws)
- Must support offline capability for POS (future requirement)
- Must maintain < 3 second page load times

### 2.6 Assumptions and Dependencies

**Assumptions:**
- Users have stable internet connectivity
- Users have modern web browsers
- Organizations have valid email addresses for staff
- Payment gateways are available in target markets

**Dependencies:**
- Firebase service availability and uptime
- Third-party payment gateway APIs
- Barcode scanner hardware compatibility
- Printer driver support

---

## 3. System Features

### 3.1 Authentication and Authorization

#### 3.1.1 Description
Secure user authentication and role-based access control system.

#### 3.1.2 Functional Requirements

**FR-AUTH-001**: The system shall allow users to register with email and password.

**FR-AUTH-002**: The system shall authenticate users using Firebase Authentication.

**FR-AUTH-003**: The system shall support password reset via email.

**FR-AUTH-004**: The system shall enforce password complexity requirements (min 8 characters, 1 uppercase, 1 number).

**FR-AUTH-005**: The system shall automatically redirect authenticated users to the dashboard.

**FR-AUTH-006**: The system shall redirect unauthenticated users to the login page.

**FR-AUTH-007**: The system shall maintain user session state across browser tabs.

**FR-AUTH-008**: The system shall allow users to sign out from all devices.

#### 3.1.3 Priority
High - Critical for system security

---

### 3.2 Organization Onboarding

#### 3.2.1 Description
Multi-step wizard for new organizations to set up their pharmacy business.

#### 3.2.2 Functional Requirements

**FR-ORG-001**: The system shall guide new users through an onboarding wizard.

**FR-ORG-002**: The system shall collect organization details:
- Organization name (required)
- Logo/branding (optional)
- Currency (required, default: UGX)
- Tax rate (required, default: 18%)
- Contact information (optional)

**FR-ORG-003**: The system shall require creation of at least one branch during onboarding.

**FR-ORG-004**: The system shall create a unique organization ID for each tenant.

**FR-ORG-005**: The system shall set the registering user as the organization owner.

**FR-ORG-006**: The system shall redirect to dashboard after successful onboarding.

#### 3.2.3 Priority
High - Required for tenant setup

---

### 3.3 Branch/Outlet Management

#### 3.3.1 Description
Manage multiple pharmacy outlets with individual configurations.

#### 3.3.2 Functional Requirements

**FR-BRANCH-001**: The system shall allow creation of new branches with:
- Name (required)
- Address (required)
- Phone number (required)
- Pharmacy license number (required)
- Opening hours (optional)

**FR-BRANCH-002**: The system shall display all branches in a grid/list view.

**FR-BRANCH-003**: The system shall allow searching branches by name or address.

**FR-BRANCH-004**: The system shall allow editing branch information.

**FR-BRANCH-005**: The system shall allow soft-deletion of branches (mark as inactive).

**FR-BRANCH-006**: The system shall display branch statistics:
- Number of assigned staff
- Number of products stocked
- Daily sales (when implemented)

**FR-BRANCH-007**: The system shall prevent deletion of branches with active inventory.

**FR-BRANCH-008**: The system shall show active/inactive status for each branch.

#### 3.3.3 Priority
High - Core functionality

---

### 3.4 Staff Management

#### 3.4.1 Description
Comprehensive staff management with role-based permissions.

#### 3.4.2 Functional Requirements

**FR-STAFF-001**: The system shall support five role types:
- Owner (full access)
- Manager (outlet operations, staff, inventory, procurement)
- Pharmacist (inventory, dispensing)
- Cashier (POS only)
- Inventory Officer (stock management only)

**FR-STAFF-002**: The system shall allow adding staff members with:
- Name (required)
- Email (required, unique)
- Phone (optional)
- Role (required)
- Assigned branches (required, multiple)

**FR-STAFF-003**: The system shall send invitation emails to new staff (future).

**FR-STAFF-004**: The system shall display all staff in a grid/card view.

**FR-STAFF-005**: The system shall allow searching staff by name or email.

**FR-STAFF-006**: The system shall allow filtering staff by role.

**FR-STAFF-007**: The system shall display role-based statistics:
- Total staff count
- Count by role type
- Active vs inactive

**FR-STAFF-008**: The system shall allow editing staff details and role assignments.

**FR-STAFF-009**: The system shall allow deactivating staff members (soft delete).

**FR-STAFF-010**: The system shall show branch assignments for each staff member.

**FR-STAFF-011**: The system shall prevent role changes that would remove the last owner.

#### 3.4.3 Priority
High - Essential for access control

---

### 3.5 Inventory Management

#### 3.5.1 Description
Complete product catalog and stock management system.

#### 3.5.2 Functional Requirements

**FR-INV-001**: The system shall allow adding products with:
- Name (required)
- Generic name (optional)
- SKU (required, unique per organization)
- Barcode (optional, unique)
- Category (required)
- Strength (optional, e.g., "500mg")
- Form (required: tablet, capsule, syrup, injection, cream, drops, inhaler, other)
- Pack size (optional, e.g., "10 tablets")
- Description (optional)
- Manufacturer (optional)
- Prescription requirement (boolean)

**FR-INV-002**: The system shall allow adding stock batches with:
- Product reference (required)
- Branch reference (required)
- Batch number (required)
- Expiry date (required)
- Quantity (required, positive integer)
- Cost price (required, positive decimal)
- Selling price (required, positive decimal)
- Supplier (optional)
- Received date (required)

**FR-INV-003**: The system shall display all products in a table/grid view.

**FR-INV-004**: The system shall allow searching products by name, SKU, or barcode.

**FR-INV-005**: The system shall display product statistics:
- Total products
- In-stock products
- Low-stock products (< 10 units)
- Expiring soon (< 30 days)

**FR-INV-006**: The system shall highlight products with low stock (orange badge).

**FR-INV-007**: The system shall highlight products expiring within 30 days (red badge).

**FR-INV-008**: The system shall calculate total stock across all batches.

**FR-INV-009**: The system shall show stock-out status when total quantity = 0.

**FR-INV-010**: The system shall allow editing product information.

**FR-INV-011**: The system shall allow deleting products (if no stock exists).

**FR-INV-012**: The system shall display empty state with call-to-action when no products exist.

**FR-INV-013**: The system shall support batch-level stock tracking (FIFO logic).

#### 3.5.3 Priority
High - Core business functionality

---

### 3.6 Point of Sale (POS)

#### 3.6.1 Description
Fast and efficient sales processing interface.

#### 3.6.2 Functional Requirements

**FR-POS-001**: The system shall provide a product search interface with:
- Text search by name or SKU
- Barcode scanning support (future)
- Category filtering
- Real-time search results

**FR-POS-002**: The system shall display a shopping cart with:
- Product name and details
- Quantity (adjustable)
- Unit price
- Line total
- Remove item button

**FR-POS-003**: The system shall calculate:
- Subtotal (sum of all line items)
- Tax amount (configurable rate, default 18%)
- Grand total (subtotal + tax)

**FR-POS-004**: The system shall allow changing product quantity in cart.

**FR-POS-005**: The system shall allow removing items from cart.

**FR-POS-006**: The system shall validate stock availability before adding to cart.

**FR-POS-007**: The system shall support multiple payment methods:
- Cash
- Mobile Money
- Card
- Corporate Account (future)

**FR-POS-008**: The system shall process checkout and:
- Deduct stock from inventory (FIFO)
- Create sale record
- Generate receipt
- Clear cart
- Show success confirmation

**FR-POS-009**: The system shall allow void/cancel transaction (with permissions).

**FR-POS-010**: The system shall display recently sold items.

**FR-POS-011**: The system shall support discount application (future).

**FR-POS-012**: The system shall print receipt to thermal printer (future).

#### 3.6.3 Priority
High - Primary revenue-generating feature

---

### 3.7 Settings Management

#### 3.7.1 Description
Comprehensive settings for organization, profile, notifications, security, and billing.

#### 3.7.2 Functional Requirements

**FR-SET-001**: The system shall provide a tabbed settings interface with:
- Organization settings
- Profile settings
- Notification preferences
- Security settings
- Billing and subscription

**FR-SET-002**: Organization settings shall allow editing:
- Organization name
- Email and phone
- Currency
- Tax rate (%)
- Business address

**FR-SET-003**: Profile settings shall allow editing:
- Full name
- Phone number
- (Email read-only)
- (Role read-only)

**FR-SET-004**: Notification preferences shall allow toggling:
- Low stock alerts
- Expiring products alerts
- New orders
- Daily reports
- Weekly reports
- Monthly reports

**FR-SET-005**: Security settings shall provide:
- Change password functionality
- Two-factor authentication setup (future)
- Active sessions management (future)

**FR-SET-006**: Billing settings shall display:
- Current subscription plan
- Payment methods
- Billing history
- Upgrade/downgrade options (future)

**FR-SET-007**: The system shall save changes with loading state feedback.

**FR-SET-008**: The system shall validate all form inputs before saving.

**FR-SET-009**: The system shall show success message after saving.

#### 3.7.3 Priority
Medium - Important for customization

---

### 3.8 Dashboard and Reports

#### 3.8.1 Description
Overview dashboard with key metrics and insights.

#### 3.8.2 Functional Requirements

**FR-DASH-001**: The system shall display a dashboard with:
- Total sales (daily, weekly, monthly)
- Total products count
- Low stock count
- Active staff count
- Recent transactions list
- Quick action buttons

**FR-DASH-002**: The system shall show sales trends chart (future).

**FR-DASH-003**: The system shall display top-selling products (future).

**FR-DASH-004**: The system shall show branch comparison metrics (future).

**FR-DASH-005**: The system shall provide date range filters for reports (future).

**FR-DASH-006**: The system shall allow exporting reports to PDF/Excel (future).

#### 3.8.3 Priority
Medium - Analytics and insights

---

### 3.9 Procurement Module

#### 3.9.1 Description
Purchase requisition and order management (future phase).

#### 3.9.2 Functional Requirements

**FR-PROC-001**: The system shall allow creating purchase requisitions (PR).

**FR-PROC-002**: The system shall support PR approval workflow.

**FR-PROC-003**: The system shall convert approved PRs to purchase orders (PO).

**FR-PROC-004**: The system shall track supplier information and history.

**FR-PROC-005**: The system shall record goods receipt notes (GRN).

**FR-PROC-006**: The system shall automatically update stock on GRN confirmation.

#### 3.9.3 Priority
Low - Future phase

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 General UI Requirements

**UI-001**: The system shall use a consistent color scheme (teal primary, white background).

**UI-002**: The system shall be fully responsive (desktop, tablet, mobile).

**UI-003**: The system shall use Lucide React icons consistently.

**UI-004**: The system shall display loading states for async operations.

**UI-005**: The system shall show empty states with helpful messages.

**UI-006**: The system shall provide clear error messages.

**UI-007**: The system shall use a left sidebar navigation on desktop.

**UI-008**: The system shall use a mobile-friendly hamburger menu on small screens.

#### 4.1.2 Accessibility Requirements

**UI-009**: The system shall meet WCAG 2.1 Level AA standards.

**UI-010**: The system shall support keyboard navigation.

**UI-011**: The system shall provide alt text for images.

**UI-012**: The system shall maintain sufficient color contrast (4.5:1 minimum).

### 4.2 Hardware Interfaces

**HW-001**: The system shall support USB barcode scanners (HID device mode).

**HW-002**: The system shall support Bluetooth barcode scanners (future).

**HW-003**: The system shall support thermal receipt printers (future).

**HW-004**: The system shall work on touch-screen devices.

### 4.3 Software Interfaces

**SW-001**: The system shall integrate with Firebase Authentication.

**SW-002**: The system shall use Firebase Firestore as the primary database.

**SW-003**: The system shall use Firebase Cloud Functions for server-side logic.

**SW-004**: The system shall integrate with Firebase Analytics.

**SW-005**: The system shall support Firebase Cloud Messaging for notifications (future).

**SW-006**: The system shall integrate with payment gateways (Stripe/Flutterwave) (future).

### 4.4 Communication Interfaces

**COM-001**: The system shall use HTTPS for all communications.

**COM-002**: The system shall use WebSocket for real-time updates (future).

**COM-003**: The system shall support REST API endpoints via Cloud Functions.

**COM-004**: The system shall send email notifications via Firebase Extensions.

---

## 5. System Architecture

### 5.1 Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15.1.4 | React framework with App Router |
| **UI Framework** | Tailwind CSS 3.4.17 | Utility-first styling |
| **Language** | TypeScript 5.0 | Type-safe development |
| **Icons** | Lucide React | Consistent iconography |
| **Backend** | Firebase | Authentication, database, hosting |
| **Database** | Firestore | NoSQL document store |
| **Hosting** | Firebase Hosting | Static site hosting |

### 5.2 Multi-Tenant Architecture

#### 5.2.1 Data Isolation Model

```
Firestore Structure:

organizations/
  {organizationId}/
    - name, logo, currency, taxRate, ownerId

    branches/
      {branchId}/
        - name, address, phone, license

    staff/
      {staffId}/
        - userId, name, email, role, assignedBranches[]

    products/
      {productId}/
        - name, sku, barcode, category, form, etc.

    stock/
      {stockId}/
        - productId, branchId, batch, expiry, quantity, prices

    sales/
      {saleId}/
        - branchId, cashierId, items[], total, paymentMethod

    purchases/
      {purchaseId}/
        - supplierId, items[], status, etc.

users/
  {userId}/
    - email, name, organizationId, role, assignedBranches[]
```

#### 5.2.2 Security Rules

**RULE-001**: All Firestore reads/writes must include organizationId verification.

**RULE-002**: Users can only access data from their own organization.

**RULE-003**: Role-based access control enforced at database level.

**RULE-004**: Owners can access all organization data.

**RULE-005**: Staff can only access data for assigned branches.

### 5.3 Application Architecture

```
┌─────────────────────────────────────────────┐
│           User Browser/Device                │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│         Next.js Frontend (SSR/CSR)           │
│  - React Components                          │
│  - Context Providers (Auth, Organization)    │
│  - Service Layer (Firestore operations)      │
│  - Client-side routing                       │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│            Firebase Services                 │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ Authentication│  │  Firestore   │        │
│  └──────────────┘  └──────────────┘        │
│  ┌──────────────┐  ┌──────────────┐        │
│  │Cloud Functions│  │   Analytics  │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
```

### 5.4 Component Structure

```
src/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/           # Main dashboard
│   ├── inventory/           # Inventory management
│   ├── outlets/             # Branch management
│   ├── staff/               # Staff management
│   ├── pos/                 # Point of sale
│   └── settings/            # Settings pages
│
├── components/              # Reusable components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── ProtectedRoute.tsx
│
├── contexts/                # React Context providers
│   ├── AuthContext.tsx      # Authentication state
│   └── OrganizationContext.tsx
│
├── lib/                     # Utilities and services
│   ├── firebase.ts          # Firebase configuration
│   ├── services/
│   │   ├── productService.ts
│   │   ├── staffService.ts
│   │   └── branchService.ts
│   └── utils.ts
│
└── types/                   # TypeScript interfaces
    ├── product.ts
    └── staff.ts
```

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

**NFR-PERF-001**: Page load time shall be < 3 seconds on 4G connection.

**NFR-PERF-002**: Search results shall appear within 500ms of user input.

**NFR-PERF-003**: POS checkout shall complete within 2 seconds.

**NFR-PERF-004**: The system shall support 100 concurrent users per organization.

**NFR-PERF-005**: Database queries shall use indexes for optimal performance.

**NFR-PERF-006**: The system shall implement lazy loading for large lists.

### 6.2 Security Requirements

**NFR-SEC-001**: All passwords shall be hashed using Firebase Authentication.

**NFR-SEC-002**: All API communications shall use HTTPS/TLS 1.3.

**NFR-SEC-003**: Session tokens shall expire after 24 hours of inactivity.

**NFR-SEC-004**: The system shall implement CSRF protection.

**NFR-SEC-005**: The system shall log all authentication attempts.

**NFR-SEC-006**: The system shall implement rate limiting on API endpoints.

**NFR-SEC-007**: Sensitive data shall be encrypted at rest (Firestore default).

**NFR-SEC-008**: The system shall audit all critical operations (sales, stock changes).

### 6.3 Reliability Requirements

**NFR-REL-001**: System uptime shall be ≥ 99.5% per month.

**NFR-REL-002**: Data backup shall occur automatically (Firestore managed).

**NFR-REL-003**: The system shall gracefully handle network interruptions.

**NFR-REL-004**: Error messages shall not expose sensitive system information.

**NFR-REL-005**: The system shall validate all user inputs.

### 6.4 Usability Requirements

**NFR-USE-001**: New users shall complete onboarding in < 5 minutes.

**NFR-USE-002**: POS interface shall require ≤ 3 clicks to complete a sale.

**NFR-USE-003**: The system shall provide contextual help text.

**NFR-USE-004**: Error messages shall be clear and actionable.

**NFR-USE-005**: The system shall maintain consistent UI patterns.

### 6.5 Scalability Requirements

**NFR-SCALE-001**: The system shall support up to 10,000 organizations.

**NFR-SCALE-002**: Each organization shall support up to 100 branches.

**NFR-SCALE-003**: The system shall handle up to 50,000 products per organization.

**NFR-SCALE-004**: The system shall process up to 10,000 transactions per day per organization.

### 6.6 Maintainability Requirements

**NFR-MAINT-001**: Code shall follow TypeScript best practices and ESLint rules.

**NFR-MAINT-002**: All functions shall have JSDoc comments.

**NFR-MAINT-003**: The system shall use environment variables for configuration.

**NFR-MAINT-004**: The system shall maintain separation of concerns (services, components).

**NFR-MAINT-005**: The system shall use semantic versioning for releases.

### 6.7 Compliance Requirements

**NFR-COMP-001**: The system shall comply with GDPR for EU customers.

**NFR-COMP-002**: The system shall maintain audit logs for regulatory compliance.

**NFR-COMP-003**: The system shall allow data export for user requests.

**NFR-COMP-004**: The system shall support data deletion (right to be forgotten).

---

## 7. Data Requirements

### 7.1 Database Schema

#### 7.1.1 Organization

```typescript
interface Organization {
  id: string;
  name: string;
  logo?: string;
  currency: string;           // "UGX", "USD", etc.
  taxRate: number;            // 18 = 18%
  ownerId: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 7.1.2 Branch

```typescript
interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  license: string;
  organizationId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 7.1.3 User Profile

```typescript
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  organizationId: string;
  role: "owner" | "manager" | "pharmacist" | "cashier" | "inventory_officer";
  assignedBranches: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  updatedAt: Date;
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
  paymentMethod: "cash" | "mobile_money" | "card" | "corporate";
  status: "completed" | "void" | "refunded";
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

### 7.2 Data Validation Rules

**VAL-001**: All monetary values shall be stored as positive decimals with 2 decimal places.

**VAL-002**: All dates shall be stored as Firebase Timestamps.

**VAL-003**: Email addresses shall be validated using RFC 5322 format.

**VAL-004**: Phone numbers shall accept international formats.

**VAL-005**: SKU and barcode shall be unique within an organization.

**VAL-006**: Stock quantities shall be non-negative integers.

**VAL-007**: Expiry dates shall be validated to be in the future.

### 7.3 Data Retention

**RET-001**: Active data shall be retained indefinitely.

**RET-002**: Soft-deleted records shall be retained for 90 days.

**RET-003**: Audit logs shall be retained for 7 years.

**RET-004**: Backup data shall be retained for 30 days.

---

## 8. User Roles and Permissions

### 8.1 Role Definitions

| Feature | Owner | Manager | Pharmacist | Cashier | Inventory Officer |
|---------|-------|---------|------------|---------|-------------------|
| **Dashboard** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **View Inventory** | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Add/Edit Products** | ✓ | ✓ | ✓ | - | ✓ |
| **Delete Products** | ✓ | ✓ | - | - | - |
| **Add Stock** | ✓ | ✓ | ✓ | - | ✓ |
| **Adjust Stock** | ✓ | ✓ | - | - | ✓ |
| **View POS** | ✓ | ✓ | ✓ | ✓ | - |
| **Process Sales** | ✓ | ✓ | ✓ | ✓ | - |
| **Void Transactions** | ✓ | ✓ | - | - | - |
| **View Outlets** | ✓ | ✓ | - | - | - |
| **Add/Edit Outlets** | ✓ | ✓ | - | - | - |
| **View Staff** | ✓ | ✓ | - | - | - |
| **Add/Edit Staff** | ✓ | ✓ | - | - | - |
| **Delete Staff** | ✓ | - | - | - | - |
| **View Reports** | ✓ | ✓ | ✓ | - | - |
| **Export Reports** | ✓ | ✓ | - | - | - |
| **Organization Settings** | ✓ | - | - | - | - |
| **Billing** | ✓ | - | - | - | - |

### 8.2 Permission Enforcement

**PERM-001**: Permissions shall be enforced at both frontend and backend levels.

**PERM-002**: Unauthorized access attempts shall be logged.

**PERM-003**: UI shall hide features not accessible to current role.

**PERM-004**: API requests shall verify user role before processing.

---

## 9. Appendices

### 9.1 Glossary

**Batch Number**: Unique identifier for a group of products from the same manufacturing run.

**FIFO**: First In, First Out - inventory valuation method where oldest stock is sold first.

**Multi-Tenant**: Architecture allowing multiple organizations to use the system with isolated data.

**Soft Delete**: Marking records as deleted without physically removing them from database.

**SKU**: Stock Keeping Unit - unique identifier for a product.

### 9.2 Development Phases

#### Phase 1: MVP (Current)
- ✅ Authentication and authorization
- ✅ Organization onboarding
- ✅ Dashboard
- ✅ Inventory management
- ✅ Outlet management
- ✅ Staff management
- ✅ Settings pages
- 🔄 POS (UI complete, needs backend)
- 🔄 Basic reports

#### Phase 2: Enhancement
- Procurement module
- Receipt generation and printing
- Advanced reports and analytics
- Email notifications
- Activity logs
- Shift scheduling

#### Phase 3: Advanced Features
- AI demand forecasting
- Drug interaction alerts
- Mobile app (React Native)
- Offline POS mode
- Multi-currency support
- Advanced payment integrations

### 9.3 Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-06 | Development Team | Initial SRS document |

---

**Document Status:** Draft
**Next Review Date:** 2025-12-20
**Approval Required From:** Project Manager, Lead Developer, Product Owner

---

*This SRS document is a living document and will be updated as requirements evolve.*
