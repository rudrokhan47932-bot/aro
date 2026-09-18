# Aro subscription platform implementation plan

**Goal:** Build the requested premium English/Bangla subscription SaaS inside the existing Codex repository.

**Architecture:** Independent Next.js App Router application. Shared locale pages and dictionaries; server-rendered public pages with small interactive components. Prisma/SQLite persistence, Auth.js, server-side role enforcement, and provider-independent subscription services.

**Tech stack:** Next.js 16, TypeScript, Tailwind 4, shadcn/Radix UI, Framer Motion, Lucide, Auth.js, Prisma, Stripe, Zod, Playwright.

## Constraints

- Preserve the Codex monorepo and its unrelated untracked Python script. Keep all work inside `aro-subscriptions`.
- User explicitly authorizes implementation without additional design questions. Do not commit or create branches.
- Aro / আরও identity: warm white, navy ink, muted teal accent; no external stock photos or excessive gradients.
- Shared `/en` and `/bn` routes; localize copy, errors, metadata, dates and numerals. Technical identifiers remain Latin.
- Free accounts work locally. Paid access changes only after verified provider events. Never fabricate account/revenue data.
- Public dashboard previews and example testimonials are explicitly identified as illustrative.

## Deliverables and verification

- [ ] Foundation: npm project, strict TypeScript, Tailwind, fonts, shadcn buttons/dialog/accordion, light/dark themes and locale routing.
- [ ] Public experience: homepage, features, pricing, about, FAQ, contact, privacy, terms, refunds; reusable sections, product preview, comparison, annual pricing, SEO/social card.
- [ ] Accounts: Prisma models, migration, seed; email/password and optional Google authentication, email verification, reset, magic-link extension, throttling and server validation.
- [ ] Member workspace: overview, subscription, billing/invoices, usage, premium features, account, security, notifications, support; real data and actionable empty states.
- [ ] Payment service: modular Stripe checkout/portal/subscription changes, signature verification, idempotent webhooks, lifecycle statuses; extensible Bangladesh gateway contract.
- [ ] Admin: dashboard, users, subscribers, editable plans, transactions, coupons, revenue, support, settings; database-backed mutations, role enforcement and audits.
- [ ] Verification: typecheck, lint, production build, integration tests, mobile/desktop/browser accessibility and locale checks; independent review.
- [ ] Handoff: README and environment template with install/run/migrate/seed commands, plan configuration and provider integration instructions.

## Ownership and interfaces

Public presentation lives in `src/components/marketing` and `src/lib/i18n`. UI primitives live in `src/components/ui`. Server-only database/auth/payment code lives in `src/lib/server`; APIs live in `src/app/api`. Dashboard pages use the same dictionary and design primitives.

Plan identifiers are `starter`, `professional`, `premium`; local public prices are BDT 499/999/1999 monthly and 4990/9990/19990 yearly. API amounts use integer minor units; displayed prices use major units. Billing cycles are `monthly` and `yearly`; statuses are `free`, `trial`, `active`, `past_due`, `cancelled`, `expired`.

Validation commands: `npm run db:generate`, `npm run db:migrate`, `npm run db:seed`, `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. Browser checks cover 375/430/768/1366/1440/1920px, both locales, both themes, registration/login, protected routes, pricing toggles, forms, and mobile navigation.
