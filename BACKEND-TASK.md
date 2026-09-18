# Backend task

Build real persistent auth, member/admin data APIs, and Stripe-ready subscriptions. Main agent owns all UI, locale dictionaries, CSS, routes other than API routes, package configuration, and README. Your exclusive write scope: `prisma/**`, `src/lib/server/**`, `src/app/api/**`, `src/types/**`, `tests/server.test.ts`, `.env.example`, `BACKEND-REPORT.md`. Do not edit outside this app or commit. Install/migrate only after coordinator says dependencies installed; coordinator owns npm install and main verification.

Use package dependencies already declared. Auth.js v5 beta 30 + Prisma adapter + JWT sessions, credentials + optional Google. Prisma 6 SQLite local default. User model includes name/email/passwordHash/emailVerified/image/role/sessionVersion, plus Auth.js account/session/verification-token models. Plan model includes id/slug/name/description/monthlyPrice/yearlyPrice/currency/features JSON/highlighted/active/trialDays/timestamps (prices integer minor units). Subscription model includes requested lifecycle fields and provider IDs, cancelAtPeriodEnd. Transaction, coupon, ticket, notification, activity, usage, settings and webhook-idempotency models as needed. All times persisted. No seeded users or pretend revenue; seed only plans.

Public plan defaults: starter 49900 monthly,499000 yearly; professional 99900,999000; premium 199900,1999000. Currency BDT. IDs/slugs starter/professional/premium. Status free/trial/active/past_due/cancelled/expired. Roles user/admin. Billing monthly/yearly. Seed sets plans only, optionally initial admin via explicit ADMIN_EMAIL and ADMIN_PASSWORD env (do not embed or echo secret).

## Exports consumed by UI

`src/lib/server/db.ts`: export `db` Prisma client singleton.

`src/lib/server/auth.ts`: export `{ auth, handlers, signIn, signOut }`, `requireUser(locale: string)` returning DB user (with id,name,email,role,emailVerified,image), `requireAdmin(locale: string)`; redirects localized login/unauthorized as appropriate. `auth()` session user includes id and role, re-read DB for access control, sessionVersion checks for password revocation.

`src/lib/server/data.ts`: export `getPublicPlans()` returning active Plan records, `getMemberData(userId: string)` returning `{ user, subscription, transactions, tickets, notifications, activities, usage }` (subscription includes plan; usage object `{toolsUsed,toolsLimit,storageUsed,storageLimit}`), `getAdminData()` returning `{ users, subscriptions, plans, transactions, coupons, tickets, activities }` (relations user/plan included). Limits bounded, distinguish totals if dashboard aggregates require count; include accurate summary totals. UI will inspect actual exports/types before integration.

## APIs consumed by UI

All JSON success `{ ok: true, ... }`; failure `{ error: string }` where error is stable localized key (`invalidInput`, `invalidCredentials`, `emailExists`, `emailUnavailable`, `paymentUnavailable`, `unauthorized`, `forbidden`, `tooManyRequests`, `invalidToken`, `notFound`, `conflict`, `unexpected`). Always correct HTTP status. Validate locale `en|bn` and reject invalid inputs with Zod.

- `/api/auth/[...nextauth]` Auth.js handlers.
- POST `/api/register` `{name,email,password,locale}`. Create free user. Verification required for paid checkout; free login allowed. Email verify/reset delivery via RESEND_API_KEY + EMAIL_FROM; local-only `.outbox` files in dev, never log/expose tokens. If production email missing, fail before mutation when email is required. No user enumeration on reset/magic link.
- POST `/api/password/forgot` `{email,locale}`; POST `/api/password/reset` `{token,password,locale}`.
- POST `/api/email/verify` `{token}`; POST `/api/email/resend` authenticated `{locale}`.
- Optional magic-link POST `/api/magic-link` `{email,locale}` + credentials token handler or secure consumption; if only architecture ready clearly document connection.
- PATCH `/api/account` `{name}`; POST `/api/account/password` `{currentPassword,password}`; POST `/api/notifications` `{id?:string,all?:boolean}` marks owned notifications read.
- POST `/api/support` `{subject,message,locale}`.
- POST `/api/subscription` `{action:'checkout'|'portal'|'cancel'|'resume'|'change', planId?, billingCycle?,locale}`. Checkout returns `{url}`; current free user checkout requires verified email. Server-owned database plan prices; recurring Stripe price_data, idempotency. Change action can use Stripe portal if configured; never immediate unverified local paid entitlement. Payment adapter contract for Stripe/SSLCommerz/bKash/Nagad/AmarPay with unsupported providers fail closed. Stripe secret env credentials; do not require for build or public pages.
- GET `/api/invoices/[id]` session and transaction ownership, return safe plain invoice download or verified hosted Stripe invoice redirect; no accepting arbitrary URLs from browser.
- POST `/api/webhooks/stripe` raw body signature validation, idempotent DB event transaction, no secrets in logs; map statuses/trial/cancel; invoice success/failure and subscription changes. Never trust redirect query for entitlements. Verify customer/user mapping; avoid stale events regressions; sanitize error output.
- POST `/api/admin` `{resource:'plans'|'coupons'|'subscriptions'|'tickets'|'settings', action:'create'|'update', id?, ...fields }` persisted admin-only mutations. Plans editable name/description/monthlyPrice/yearlyPrice/features/active/trialDays/highlighted. Coupons code/percentOff/active/expiry/redemption bounds, synchronize or validate provider limitations; no pretending discount works if not connected. Subscription status management must coordinate provider when applicable, reject incompatible manual overwrites. Support status/reply; settings persist key/value allowlisted (brand/supportEmail). Currency preserve BDT. Validate mutations, use same-origin/CSRF defenses, DB-backed rate limits for sensitive requests, safe amount bounds, unique constraints. Write audit events.

Include Prisma SQL migration and migration_lock.toml, idempotent seed, unit/integration tests meaningful for validation/state/auth constraints. `.env.example` required variables and setup docs in BACKEND-REPORT.md. Read applicable D:/codex/AGENTS.md; root code is Rust monorepo, do not touch it. Shell sandbox calls stall here; use exec_command with sandbox_permissions=require_escalated for all command operations, with precise justifications. apply_patch works once app root exists. Use UTF8 on PowerShell reads. Report API differences immediately by send_input or final report. Do not ask user questions.
