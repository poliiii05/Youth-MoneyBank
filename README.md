# Youth MoneyBank

A tier-based digital savings platform for Filipino teenagers, built as a full-stack
portfolio project. It models the **progressive KYC framework** used by Philippine
e-money issuers: start with an email address and a ₱5,000 cap, verify a Student ID
to reach ₱20,000, verify a government ID to reach ₱100,000.

The interesting part is not the CRUD — it's the money movement. Balances are held in
integer cents, mutations run inside row-locked transactions with idempotency keys, and
every movement writes an append-only double-entry ledger record.

> **This is a portfolio project, not a bank.** No real money is processed. Cash-in runs
> through the PayPal Sandbox, and partner-bank integration is demonstrated through a
> swappable service layer rather than a live connection. A real deployment would require
> BSP e-money issuer licensing and a licensed sponsor bank.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | Laravel 12, PHP 8.2 |
| Frontend | React 18 + Inertia.js (server-driven SPA) |
| Database | MySQL 8 (InnoDB, row-level locking) |
| Styling | Tailwind CSS v4 + shadcn/ui-style primitives |
| Build | Vite 7 |
| Auth | Email + password, Google OAuth (Socialite) |
| Payments | PayPal Sandbox |
| AI | Google Gemini (support chat, savings tips) |
| Bot protection | Cloudflare Turnstile |
| Charts | Recharts |

---

## Features

### User side
- **Progressive KYC tiers** — Starter (₱5,000) → Builder (₱20,000) → Achiever (₱100,000),
  enforced server-side by `TierLimitService` and authorization middleware
- **Wallet and savings pool** — spendable balance kept separate from money set aside
- **Savings goals** — create goals, allocate and deallocate funds against them
- **Cash-in** via PayPal Sandbox
- **Transaction history** backed by a double-entry ledger
- **Streaks and badges** — milestones at 7, 14, 30, 60, 100, 180, 365 days
- **Insights dashboard** — monthly calendar, savings personality classification,
  AI-generated tips
- **Support chat** — help articles first, then Gemini, then escalation to a human agent

### Admin side
- **Two-role RBAC** — `admin` (daily operations) and `super_admin` (elevated actions),
  exposed through semantic helpers (`canApproveKyc()`, `canOverrideTier()`, …) rather
  than role-string checks
- **KYC review queue** — approve/reject with document viewer and mandatory reasons
- **User management** — tier override, suspension, force logout
- **Transaction monitoring** — flag, resolve, manual credit
- **Customer support queue** — an inbox of actionable cases (failed, pending, flagged)
- **Admin management** — promote, change role, revoke, with last-super-admin protection
- **Global audit log** — filterable, searchable, CSV export
- **Maintenance mode** toggle

### Not built (deliberately out of scope)
Cash-out to real bank accounts · peer-to-peer transfers · QR payments · debit cards ·
investment products · parent/guardian allowance distribution · SMS notifications

---

## Architecture Notes

### Money movement is transactional
Balance mutations acquire a row lock (`SELECT … FOR UPDATE`) before reading, so two
concurrent requests cannot both pass a limit check against a stale balance. Idempotency
keys prevent a retried request from double-crediting. Admin manual credits wrap three
operations — create the correction transaction, adjust the wallet, mark the original
resolved — in a single `DB::transaction()`, so partial state is impossible.

### Balances are integers, not floats
Everything is stored in **cents** as integers. Floating-point money is a well-known way
to lose a peso to rounding; the `Money` support class handles conversion at the display
boundary only.

### Append-only ledger
Every movement writes double-entry records to `ledger_entries`. Nothing is ever updated
or deleted — corrections are new entries. That makes the transaction history
reconstructible and auditable rather than merely displayed.

### Audit trail is queryable, not grepped
Admin actions write structured rows to `admin_audit_logs` — actor, target, action type,
mandatory reason, and a JSON metadata column for per-action detail. Compliance work needs
queryable data, not log files.

### Adapter pattern at the boundaries
Partner-bank operations sit behind an interface with a mock implementation. Swapping in a
real BaaS provider (UnionBank UBX, RCBC) would mean writing one adapter, not touching
business logic.

### Design system
UI is built on Tailwind v4 design tokens (`--primary`, `--tier-1/2/3`, …) defined once in
`resources/css/app.css`, consumed through shadcn/ui-style primitives in
`resources/js/Components/ui/`. Retheming the whole application — public site, user
dashboard, and admin panel — is a change to a handful of CSS variables.

---

## Local Setup

**Requirements:** PHP 8.2+, Composer, Node 18+, MySQL 8

```bash
git clone https://github.com/poliiii05/Youth_Money_Bank.git
cd Youth_Money_Bank

composer install
npm install

cp .env.example .env
php artisan key:generate
```

Create a MySQL database, then point `.env` at it:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=youth_money_bank
DB_USERNAME=root
DB_PASSWORD=
```

Run the migrations and start the app:

```bash
php artisan migrate --seed
npm run dev          # in one terminal
php artisan serve    # in another
```

### Optional integrations

The app runs without these — the affected features degrade rather than break.

| Feature | Keys needed | Where to get them |
|---|---|---|
| Google Sign-In | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) |
| AI chat & tips | `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| Cash-in | `VITE_PAYPAL_CLIENT_ID` | [PayPal Developer](https://developer.paypal.com/dashboard/) (Sandbox) |
| Bot protection | `TURNSTILE_SECRET` | [Cloudflare Turnstile](https://dash.cloudflare.com/?to=/:account/turnstile) |
| Outbound email | `MAIL_*` (SMTP) | any SMTP provider |

### KYC demo settings

```env
KYC_AUTO_APPROVE=true      # skip the admin review queue while testing
KYC_RETENTION_HOURS=24     # uploaded documents auto-delete after this
KYC_MAX_FILE_SIZE_MB=5
```

---

## Test Accounts

Seeded by `php artisan db:seed`:

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@ymb.test` | `password` |
| Admin | `admin@ymb.test` | `password` |
| User | `user@ymb.test` | `password` |

> Seeded credentials are for local development only. Never deploy with them enabled.

---

## Screenshots

_To add: landing page, user dashboard, savings goals, insights, KYC review queue, audit log._

---

## Project Status

Actively being reworked. Currently in progress:

- [x] Design system foundation (tokens + shadcn/ui-style primitives)
- [x] Public pages retheme and content accuracy pass
- [x] Auth UI rebuilt around email + password and Google OAuth
- [ ] Auth backend wiring (`POST /login`, `POST /signup`)
- [ ] Forgot-password flow over SMTP
- [ ] Retheme of the user dashboard and admin panel

---

## License

Portfolio project. Not for production use without permission.

**John Emmanuel Policarpio** · BSIT, University of Caloocan City · 2026