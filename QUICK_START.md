# AI-Pharmacy Quick Start Guide

## 🎯 Current Status

### ✅ **What's Working Now**
- Authentication (login/signup)
- Basic organization & branch management
- Staff listing with role filtering
- Inventory display with search
- POS UI with cart functionality
- Dashboard with mock data
- Settings page structure

### ❌ **What's Missing**
- Multi-org user support
- Staff invitation system
- POS backend (no sales recording)
- Real data in dashboard
- Receipt generation
- Procurement module
- Reports

---

## 🚀 Immediate Next Steps (Priority Order)

### **1. Multi-Org User Architecture** (2-3 days)
**Why Critical:** Foundation for proper multi-tenant system

**Changes Needed:**
```typescript
// Current: Single org per user
organizationId: string

// New: Multiple orgs per user
memberships: [
  { organizationId: "org1", role: "owner", assignedOutletIds: ["outlet1"] },
  { organizationId: "org2", role: "manager", assignedOutletIds: ["outlet2"] }
]
```

**Implementation:**
- [ ] Update `src/contexts/AuthContext.tsx` with multi-org support
- [ ] Create `src/components/OrganizationSelector.tsx`
- [ ] Add `switchOrganization()` function
- [ ] Update all services to use `currentOrgId`

---

### **2. Staff Invitation System** (2-3 days)
**Why Critical:** Essential for onboarding team members

**What to Build:**
- [ ] `src/components/modals/InviteStaffModal.tsx` - Invite form
- [ ] `src/app/auth/accept-invite/page.tsx` - Acceptance flow
- [ ] `organizations/{orgId}/invites` collection in Firestore
- [ ] Cloud Function: `inviteStaff` (sends email)
- [ ] Cloud Function: `acceptInvite` (adds to org)

**User Flow:**
1. Owner clicks "Invite Staff" on staff page
2. Enters email, role, assigned outlets
3. System sends email with magic link
4. New user clicks link → signs up → added to org
5. Existing user clicks link → org added to memberships

---

### **3. POS Backend Integration** (3-4 days)
**Why Critical:** Core revenue-generating feature

**What to Build:**
- [ ] `src/lib/services/salesService.ts` - CRUD for sales
- [ ] Cloud Function: `processSale` - Handle checkout
  - Validate stock (FIFO)
  - Create sale document
  - Deduct stock from batches
  - Generate receipt number
- [ ] `src/components/Receipt.tsx` - Receipt view
- [ ] `src/components/modals/PaymentModal.tsx` - Payment selection
- [ ] Update `src/app/pos/page.tsx` to use real data

**Sale Flow:**
1. Cashier adds products to cart
2. Clicks "Complete Sale"
3. Selects payment method (cash/mobile money/card)
4. Cloud Function processes:
   - Checks stock availability
   - Deducts from oldest batches (FIFO)
   - Creates sale record
   - Logs activity
5. Shows receipt for printing

---

## 📋 Week 1 Task List

### **Day 1-2: Multi-Org Architecture**
```bash
# Files to create/modify:
src/types/user.ts                        # New: Global user types
src/contexts/AuthContext.tsx             # Modify: Add multi-org
src/components/OrganizationSelector.tsx  # New: Org picker
src/app/auth/select-org/page.tsx        # New: Org selection page
```

### **Day 3-4: Invitation System**
```bash
# Files to create:
src/types/invite.ts                          # New: Invite types
src/lib/services/inviteService.ts           # New: Invite service
src/components/modals/InviteStaffModal.tsx  # New: Invite modal
src/app/auth/accept-invite/page.tsx         # New: Accept page

# Cloud Functions:
functions/src/inviteStaff.ts     # Send invitation
functions/src/acceptInvite.ts    # Process acceptance
```

### **Day 5: Cloud Functions Setup**
```bash
# Initialize Firebase Functions
firebase init functions
cd functions && npm install

# Install dependencies
npm install firebase-functions@latest
npm install firebase-admin@latest
npm install typescript -D
```

---

## 📊 Phase Breakdown

### **Phase 1: Foundation (Week 1-2)** ← **YOU ARE HERE**
- Multi-org users
- Invitation system
- POS backend
- Receipt generation

### **Phase 2: Core Features (Week 3-4)**
- Product creation modals
- Dashboard real data
- Enhanced org/branch settings
- Stock adjustments

### **Phase 3: Procurement (Week 5-6)**
- Supplier management
- Purchase requisitions (PR)
- Purchase orders (PO)
- Goods receipt notes (GRN)

### **Phase 4: Advanced (Week 7-8)**
- Reports & analytics
- Activity logs
- Billing & subscriptions
- Platform admin

### **Phase 5: Future (Week 9+)**
- AI forecasting
- Drug interactions
- Fraud detection
- Mobile app

---

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Deploy functions
cd functions && npm run deploy

# Deploy hosting
firebase deploy --only hosting

# Run emulators (for testing)
firebase emulators:start
```

---

## 📁 Key Files Reference

### **Context & State Management**
- `src/contexts/AuthContext.tsx` - User authentication & org switching
- `src/contexts/OrganizationContext.tsx` - Current org & branches

### **Services (Data Layer)**
- `src/lib/services/productService.ts` - Product CRUD
- `src/lib/services/staffService.ts` - Staff CRUD
- `src/lib/services/branchService.ts` - Branch CRUD
- `src/lib/services/organizationService.ts` - Org CRUD
- `src/lib/services/salesService.ts` - ❌ **TO BE CREATED**
- `src/lib/services/inviteService.ts` - ❌ **TO BE CREATED**

### **Pages**
- `src/app/dashboard/page.tsx` - Dashboard
- `src/app/inventory/page.tsx` - Inventory management
- `src/app/pos/page.tsx` - Point of sale
- `src/app/outlets/page.tsx` - Branch management
- `src/app/staff/page.tsx` - Staff management
- `src/app/settings/page.tsx` - Settings

### **Components**
- `src/components/layout/Sidebar.tsx` - Main navigation
- `src/components/ProtectedRoute.tsx` - Auth guard

---

## 🔥 Firestore Collections

### **Current Structure**
```
users/{uid}
  - Simple user profile with single org

organizations/{orgId}
  - Organization info

organizations/{orgId}/branches/{branchId}
  - Branch/outlet info

organizations/{orgId}/staff/{staffId}
  - Staff members

organizations/{orgId}/products/{productId}
  - Product catalog

organizations/{orgId}/stock/{stockId}
  - Stock batches
```

### **Target Structure (After Phase 1)**
```
users/{uid}  ← Global profile with memberships[]

organizations/{orgId}
  - Enhanced with taxConfig, receiptSettings, aiSettings

organizations/{orgId}/users/{uid}  ← Org-specific membership
organizations/{orgId}/invites/{inviteId}  ← New
organizations/{orgId}/outlets/{outletId}  ← Enhanced
organizations/{orgId}/products/{productId}
organizations/{orgId}/stockBatches/{batchId}
organizations/{orgId}/sales/{saleId}  ← New
organizations/{orgId}/suppliers/{supplierId}  ← Future
organizations/{orgId}/purchaseOrders/{poId}  ← Future
organizations/{orgId}/reportsCache/{reportId}  ← Future
```

---

## 🎓 Learning Resources

### **Firebase**
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Cloud Functions](https://firebase.google.com/docs/functions)
- [Firebase Authentication](https://firebase.google.com/docs/auth)

### **Next.js**
- [App Router Guide](https://nextjs.org/docs/app)
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions)

### **Multi-Tenant Architecture**
- [Multi-Tenant SaaS Patterns](https://docs.aws.amazon.com/prescriptive-guidance/latest/saas-multitenant-api-access-authorization/welcome.html)

---

## 🐛 Common Issues & Solutions

### **Issue: Firebase credentials not loading**
**Solution:** Check `.env.local` exists and restart dev server

### **Issue: "Organization not found"**
**Solution:** User might not have completed onboarding. Check Firestore for user doc.

### **Issue: "Permission denied" in Firestore**
**Solution:** Firestore security rules not set up. Currently in test mode, need to implement rules.

### **Issue: Cloud Functions not deploying**
**Solution:** Ensure you're on Blaze plan (pay-as-you-go) for Firebase.

---

## 📞 Support

- **Documentation:** See `IMPLEMENTATION_PLAN.md` for detailed spec
- **Architecture:** See `Develpoment.md` for product spec
- **SRS:** See `SRS.md` for requirements
- **Deployment:** See `DEPLOYMENT.md` for hosting guide

---

## ✅ Daily Checklist

### **Before Starting:**
- [ ] Pull latest changes from git
- [ ] Check dev server is running
- [ ] Review current todo in IMPLEMENTATION_PLAN.md

### **During Development:**
- [ ] Write code in small, testable chunks
- [ ] Test in browser frequently
- [ ] Check Firestore console for data
- [ ] Use console.log for debugging

### **Before Committing:**
- [ ] Run linter: `npm run lint`
- [ ] Test key user flows manually
- [ ] Check no sensitive data in code
- [ ] Write clear commit message

### **End of Day:**
- [ ] Commit and push changes
- [ ] Update IMPLEMENTATION_PLAN.md progress
- [ ] Note any blockers or questions

---

**Ready to Start?**
👉 Begin with **Task 1.1: Multi-Org User Architecture** in IMPLEMENTATION_PLAN.md
