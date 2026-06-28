# my-app

Internal disbursement management dashboard built with Next.js 16 App Router.

---

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn

### Install & Run

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). The app redirects to `/auth/login` if no session exists.

---

## Login Credentials

| Role | Username | Password | Access |
|------|----------|----------|--------|
| Super Admin | `superadmin` | `superadmin123` | All pages including Audit Log |
| Admin | `admin` | `admin123` | Dashboard, Disbursements |
| Operator | `operator` | `operator123` | Dashboard, Disbursements |

Sessions use JWT stored in `httpOnly` cookies. Access token expires in **15 minutes**; refresh token lasts **7 days**.

---

## Pages & Features

### `/dashboard`
- Summary statistics cards (total transactions, pending, success, failed)
- Recent transaction chart

### `/disbursements`
- Transaction table with global search, sorting, and pagination (10 / 20 / 30 / 50 / 100 rows per page)
- Row checkbox selection with badge counter
- **Export CSV** — exports selected rows as `disbursements-export-YYYY-MM-DD.csv`
- Approve / Reject actions (admin & superadmin only)
- **Create Disbursement** — form with validation (sender name, bank, account number, amount, date, note)
- Admin fee calculated automatically: Rp 2,500 for amounts below Rp 5,000,000 — Rp 5,000 at or above

### `/disbursements/batch`
- Spreadsheet-style table for creating up to 10 disbursements at once
- Inline validation per cell; admin fee auto-calculated per row
- Accessible to operator, admin, and superadmin

### `/audit-logs` _(superadmin only)_
- Full audit trail: entity link, action badge, actor + role, before/after diff, IP address, timestamp
- Filters: action type, actor username, date range picker (Apply / Cancel — selection is not committed until Apply is clicked)
- Data served by MSW in development; falls back to the Next.js API route (`/api/audit-logs`) on first load

---

## Running Tests

```bash
# Run all tests once
yarn test

# Watch mode
yarn test:watch

# Run a specific test file
yarn vitest run __tests__/calculateAdminFee.test.ts
```

### Test Files

| File | What it covers |
|------|----------------|
| `__tests__/calculateAdminFee.test.ts` | Admin fee tier logic — boundary values, invalid input |
| `__tests__/StatusBadge.test.tsx` | Badge renders correct Indonesian label and color class per status |
| `__tests__/DisbursementForm.test.tsx` | Form validation — amount too low, non-digit account number, all-valid schema parse |
| `__tests__/useAuth.test.ts` | `useAuth` hook — valid JWT, expired JWT, missing cookie |

---

## Technical Notes

### Mock Data (MSW)

[Mock Service Worker](https://mswjs.io/) intercepts API calls in development:

- `GET /api/audit-logs` — 20 seeded entries spanning the last 7 days
- Disbursement data is fetched from a live mock REST API (`NEXT_PUBLIC_API_URL`)

On first page load the Service Worker may not yet be active (browser registration race). The Next.js route handler at `app/api/audit-logs/route.ts` serves as a reliable fallback so data always appears without a manual refresh.

### Auth Flow

```
POST /api/auth/login
  → signs access_token (15 min) + refresh_token (7 days) as httpOnly cookies

DashboardLayout (Server Component)
  → reads access_token via next/headers cookies()
  → decodes payload (no network call)
  → injects { username, role } into UserProvider

Client components
  → useUser()  — reads from React context (server-decoded, always fresh)
  → useAuth()  — reads & decodes cookie client-side (used for expiry checks / tests)
```

### Key Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| Next.js | 16 | App Router, Server Components, API routes |
| React | 19 | UI |
| TanStack Query | v5 | Data fetching & caching |
| TanStack Table | v8 | Headless table (sorting, pagination, row selection) |
| React Hook Form + Zod | — | Form state & schema validation |
| shadcn/ui + Radix UI | — | Accessible component primitives |
| MSW | v2 | API mocking in development |
| jose | v6 | JWT sign & decode |
| Vitest + Testing Library | — | Unit & component tests (jsdom environment) |

### Project Structure

```
├── app/
│   ├── (auth)/
│   │   └── auth/
│   │       └── login/
│   │           └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← session guard + UserProvider
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── disbursements/
│   │   │   ├── page.tsx
│   │   │   ├── batch/
│   │   │   │   └── page.tsx        ← spreadsheet bulk-create
│   │   │   └── components/
│   │   │       ├── DisbursementForm.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       ├── StatusConfig.ts
│   │   │       ├── TransactionColumns.tsx
│   │   │       ├── TransactionDetail.tsx
│   │   │       ├── CreateDisbursementDialog.tsx
│   │   │       └── ActionConfirmDialog.tsx
│   │   └── audit-logs/
│   │       └── page.tsx            ← superadmin only
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── refresh/route.ts
│   │   └── audit-logs/
│   │       └── route.ts            ← MSW fallback
│   ├── layout.tsx
│   └── page.tsx                    ← redirects to /dashboard
├── components/
│   ├── custom-table.tsx            ← TanStack Table wrapper
│   ├── app-shell.tsx
│   ├── sidebar.tsx
│   ├── navbar.tsx
│   ├── disbursement-stats.tsx
│   ├── logout-button.tsx
│   └── ui/                         ← shadcn/ui primitives
│       ├── date-range-picker.tsx   ← custom (draft state + Apply/Cancel)
│       ├── currency-input.tsx
│       └── ...
├── hooks/
│   ├── useAuth.ts                  ← client-side JWT decode + expiry
│   ├── UseTransaction.ts           ← TanStack Query: transactions
│   ├── UseAuditLog.ts              ← TanStack Query: audit logs
│   ├── use-debounce.ts
│   └── use-mobile.ts
├── lib/
│   ├── api/
│   │   ├── transactions.ts         ← axios client (mock REST API)
│   │   └── audit-logs.ts           ← axios client (local /api)
│   ├── jwt.ts                      ← signToken / verifyToken / decodePayload
│   ├── format.ts                   ← formatRupiah, formatDate
│   ├── axios.ts
│   ├── types.ts                    ← re-export shim
│   └── utils.ts
├── mocks/
│   ├── browser.ts                  ← MSW worker setup
│   ├── MSWProvider.tsx             ← starts worker on client
│   ├── handlers/
│   │   ├── index.ts
│   │   └── audit-logs.ts
│   └── data/
│       └── audit-logs.ts           ← 20 seeded entries
├── models/
│   ├── Transaction.ts
│   └── AuditLog.ts
├── providers/
│   ├── user-provider.tsx           ← UserContext + useUser()
│   └── query-provider.tsx
├── __tests__/
│   ├── setup.ts                    ← jest-dom matchers
│   ├── calculateAdminFee.test.ts
│   ├── StatusBadge.test.tsx
│   ├── DisbursementForm.test.tsx
│   └── useAuth.test.ts
├── middleware.ts                   ← JWT auth guard (Edge Runtime)
└── vitest.config.ts
```
