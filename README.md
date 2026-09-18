# ARO — Premium Subscriptions Marketplace

A bilingual (English / বাংলা) marketplace for premium subscription plans — Netflix, Prime Video, YouTube Premium, ChatGPT Plus, Hoichoi, Chorki — built for the Bangladesh market with BDT pricing, bKash-friendly messaging, and a full customer + admin experience.

## Features

- **Marketing site** — localized storefront, pricing, FAQ, legal pages (`en` / `bn`)
- **Customer dashboard** — plan picker, billing history, notifications, support tickets, account & security settings
- **Admin panel** — plans, coupons, users, subscriptions, transactions, support inbox, settings; all changes audit-logged
- **Payments** — Stripe checkout with webhook-driven subscription state, invoice dedup, hosted-invoice allowlist
- **Auth** — NextAuth v5 (credentials + Google), magic links, email verification & password reset tokens (hashed, single-use, expiring)
- **Email** — Resend in production; private `.outbox/*.json` files in dev/test

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack dev / webpack build) |
| UI | React 19, Tailwind CSS 4, Radix UI, Framer Motion |
| Database | SQLite via Prisma 6 |
| Auth | NextAuth v5 (`next-auth` beta) with Prisma adapter |
| Payments | Stripe |
| Email | Resend |
| Testing | Node test runner (`tsx --test`), Playwright (e2e) |

## Getting Started

**Prerequisites:** Node.js 20+ and npm.

```bash
# 1. Install dependencies (also runs prisma generate)
npm install

# 2. Create your env file
cp .env.example .env

# 3. Apply migrations and seed the database
npm run db:migrate
npm run db:seed

# 4. Start the dev server
npm run dev
```

Open http://127.0.0.1:3000 — you'll be redirected to `/en`.

To bootstrap an administrator, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env` **before seeding**, and unset them afterward.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server (Turbopack) on 127.0.0.1:3000 |
| `npm run build` | Production build (`prisma generate` + `next build`) |
| `npm run start` | Serve the production build |
| `npm test` | Server-side unit/integration tests (15 suites) |
| `npm run test:e2e` | Playwright end-to-end tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply Prisma migrations (`migrate deploy`) |
| `npm run db:seed` | Seed plans and settings |
| `npm run db:generate` | Regenerate the Prisma client |

## Environment Variables

See [.env.example](.env.example) for the full template.

| Variable | Notes |
|---|---|
| `DATABASE_URL` | SQLite path relative to `prisma/schema.prisma` (e.g. `file:./dev.db`) |
| `APP_URL` / `AUTH_URL` | Exact canonical origin; HTTPS required in production, no trailing path |
| `AUTH_SECRET` | Random secret ≥ 32 bytes — **required** |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional) |
| `RESEND_API_KEY` / `EMAIL_FROM` | Required in production for registration, verification, and resets |
| `PAYMENT_PROVIDER` | `stripe` |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe credentials and webhook signature verification |
| `STRIPE_PORTAL_CONFIGURATION_ID` | Required for the billing "change plan" action |
| `TRUST_PROXY` | `true` only behind a trusted proxy that strips/replaces `x-real-ip` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | One-time admin bootstrap; unset after seeding |

## Project Structure

```
src/
├── app/
│   ├── [locale]/            # Localized pages: marketing, (auth), dashboard, admin
│   └── api/                 # Route handlers: auth, account, register, password,
│                            # email, subscription, invoices, support, webhooks/stripe
├── components/
│   ├── admin/               # Admin panel views & managers
│   ├── auth/                # Login, register, reset, verify forms
│   ├── dashboard/           # Customer dashboard views
│   ├── marketing/           # Header, footer, legal pages
│   ├── marketplace/         # Storefront & product cards
│   └── ui/                  # Shared primitives (button, card, dialog…)
├── lib/
│   ├── i18n/                # en / bn dictionaries
│   └── server/              # DB access, auth, payments, security, validation
├── prisma/
│   ├── schema.prisma        # Data model (SQLite)
│   ├── migrations/
│   └── seed.ts
└── tests/
    └── server.test.ts       # Security & behavior test suite
```

## Security Notes

The server layer is deliberately defensive; the test suite (`npm test`) locks in these behaviors:

- CSRF origin checks on state-changing routes (absent, cross-origin, and misleading origins rejected)
- Database-backed rate limiting with atomic counters
- Email tokens stored as hashes, purpose-bound, expiring, single-use
- Password reset revokes all sessions atomically; session revocation fails closed
- Stripe webhook signature verification and hosted-invoice URL allowlisting; events deduplicated
- Admin actions re-check roles in the DB and write audit entries; paid status can't be fabricated client-side
- Unimplemented payment providers fail closed

## Deployment Notes

- SQLite is fine for dev; use durable persistent storage for the database file in deployment (or swap the Prisma datasource provider).
- Set `APP_URL`/`AUTH_URL` to the exact HTTPS origin and configure `TRUST_PROXY`/`AUTH_TRUST_HOST` appropriately for your host.
- Run `npm run db:migrate` as part of your release step; the build itself does not touch the database.
