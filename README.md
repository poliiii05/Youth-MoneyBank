# Youth MoneyBank

A modern banking platform built for portfolio demonstration. Features a comprehensive admin panel with role-based access control, KYC management, transaction monitoring, and audit logging.

## 🎯 Key Features

### User Side
- 🏦 Multi-tier KYC system (Tier 1-3 with ₱5K/₱20K/₱100K wallet limits)
- 💰 Wallet operations (add money via PayPal/GCash, transfers, savings goals)
- 📊 Transaction history with double-entry ledger system
- 🎯 Savings goals with progress tracking
- 🔐 Google OAuth + Cloudflare Turnstile verification

### Admin Panel
- 👥 **2-role RBAC system:** Admin (operational) + Super Admin (elevated)
- 📋 **KYC Reviews:** Approve/reject applications with document viewer
- 👤 **User Management:** Override tier, suspend, force logout
- 💳 **Transaction Monitoring:** Flag suspicious, resolve, manual credits
- 🆘 **Customer Support Queue:** Failed/pending/flagged transactions with actions
- 🛡️ **Admin Management:** Promote, change role, revoke with safeguards
- 📊 **Global Audit Log:** Filterable, searchable, exportable to CSV
- ⚙️ **Settings:** Profile, password change, system info

## 🏗️ Tech Stack

- **Backend:** Laravel 12.55, PHP 8.2, MySQL
- **Frontend:** Inertia.js, React 18, Tailwind CSS
- **Charts:** Recharts
- **Notifications:** react-hot-toast
- **Auth:** Laravel Breeze + Google Socialite + Cloudflare Turnstile

## 🚀 Demo Access

**Live Demo:** [URL after deployment]

### Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | johnemmanuelpolicarpio05@gmail.com | [your password] |
| Admin | jmpolicarpio087@gmail.com | [your password] |
| Regular User | phantom6thman93@gmail.com | [your password] |

## 🔑 Architecture Highlights

### Atomic Money Movement
Manual Credit operations use `DB::transaction()` for atomicity — 3 operations (create correction transaction, update wallet balance, mark original as resolved) all succeed or all rollback.

### Banking-Grade Audit Trail
Every state-changing admin action writes to a centralized `admin_audit_logs` table with:
- Actor + target user
- Action type + category  
- Mandatory reason (min 10-20 chars)
- JSON metadata for action-specific details
- Immutable timestamps

### Role-Based Permissions
Semantic permission helpers on User model:
- `canApproveKyc()`, `canManageUsers()`, `canOverrideTier()`
- `canSuspendUsers()`, `canForceLogout()`, `canManageAdmins()`
- Independent of role string for flexibility

### Real-Time Polling
Sidebar badges update every 30 seconds via lightweight JSON endpoint. Toast notifications fire when new customer support cases arrive.

### Contextual Workflows
URL parameters (`?from=cs`) carry workflow context — clicking a CS case → action → returns to CS queue (inbox pattern).

## 🎓 Interview Talking Points

### 1. Atomic Transactions for Money Movement
> "Manual Credit uses DB::transaction() to ensure atomicity. The 3 operations — creating the correction transaction, incrementing the wallet balance, and marking the original as resolved — all succeed or all rollback. Partial state would create accounting inconsistencies in a banking system."

### 2. Audit Trail Architecture
> "I built a dedicated admin_audit_logs table separate from Laravel's log files. Compliance teams need queryable, structured audit data — not grep-able files. The JSON metadata column gives schema flexibility per action type."

### 3. 2-Role Simplification
> "Instead of 3+ admin roles, I consolidated to 2: admin (daily ops) and super_admin (elevated actions). The User model exposes semantic permission helpers like canOverrideTier() — independent of role strings, making the system easier to extend."

### 4. Customer Support as Action Queue
> "Customer Support is a separate page from Transactions, but they share the same detail view. The CS page is an inbox — only actionable items (failed, pending, flagged AND not resolved). Clicking a case carries ?from=cs, and after the action, the user returns to the queue. This matches the Gmail/Linear inbox pattern."

### 5. Banking-Grade Safeguards
> "Admin Management has multiple safeguards: cannot self-modify (UI hides menu for own row), cannot demote/revoke the last super_admin (system needs at least one), cannot promote suspended users. All actions require minimum 10-character reasons for compliance."

### 6. UI Simplification
> "The Customer Support queue went from 5 filter tabs to 2 (Open Cases + Resolved) based on user feedback. Issue types now appear as colored badges per row instead of separate filters. This matches Stripe Dispute Center's pattern — simple top-level structure, push detail to rows."

## 🛠️ Local Setup

```bash
# Clone
git clone <repo-url>
cd YouthMoneyBank

# Install dependencies
composer install
npm install

# Environment
cp .env.example .env
php artisan key:generate

# Database
php artisan migrate
php artisan db:seed

# Compile assets
npm run dev

# Run
php artisan serve
```

## 📸 Screenshots

[Add screenshots of: Dashboard, KYC Review, Customer Support, Audit Log, Admin Management]

## 📝 License

Portfolio project — not for production use without permission. ,