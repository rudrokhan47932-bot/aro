# Premium Bangladesh Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a localized, mobile-first BDT subscription marketplace using the supplied catalog while preserving existing authentication, Prisma, admin, and payment integrations.

**Architecture:** Add a structured catalog and localized storefront components around the existing Next.js App Router. Reuse existing Plan records and payment APIs; keep product operational metadata nullable and admin-editable. Use client state only for marketplace interactions and cart presentation.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 4, Prisma, Auth.js, Stripe integration, Framer Motion, Lucide.

## Global Constraints

- Preserve existing records and use non-destructive upsert behavior.
- Prices are exact integer BDT values from the approved catalog.
- Support `/en` and `/bn` without duplicating catalog data.
- Do not invent reviews, sales numbers, trust badges, partnerships, payment methods, stock, delivery, account rules, or support terms.
- Keep existing authentication, database, admin plan management, and checkout flows working.

### Task 1: Catalog and persistence contract

**Files:**
- Create: `src/lib/catalog.ts`
- Modify: `prisma/seed.ts`
- Modify: `src/lib/plans.ts`

- [ ] Define typed products, durations, localized names/descriptions, and nullable operational metadata in `src/lib/catalog.ts`.
- [ ] Encode the exact supplied prices as BDT major-unit integers and provide helpers for lookup, formatting, and localized labels.
- [ ] Update seed/upsert logic so existing Plan records are preserved and supplied plans are inserted or updated non-destructively.
- [ ] Keep admin-managed operational fields unset unless already configured in the database.

### Task 2: Storefront presentation and interactions

**Files:**
- Modify: `src/app/[locale]/(marketing)/[[...page]]/page.tsx`
- Create: `src/components/marketplace/storefront.tsx`
- Create: `src/components/marketplace/product-card.tsx`
- Create: `src/components/marketplace/product-detail.tsx`
- Create: `src/components/marketplace/cart.tsx`
- Modify: `src/components/marketing/header.tsx`
- Modify: `src/components/marketing/footer.tsx`
- Modify: `src/lib/i18n/en.ts`
- Modify: `src/lib/i18n/bn.ts`

- [ ] Build a responsive marketplace landing page with hero/search, category filters, duration selector, and product grid.
- [ ] Add product details showing price, duration, and only configured operational fields; show a neutral pending state for unset fields.
- [ ] Add client-side cart state, cart drawer/page presentation, totals in BDT, remove controls, and checkout handoff.
- [ ] Localize all visible marketplace copy and format BDT consistently for English and Bangla.
- [ ] Use restrained motion, accessible controls, keyboard focus states, and reduced-motion compatibility.

### Task 3: Checkout integration and admin compatibility

**Files:**
- Inspect/modify: `src/app/api/subscription/route.ts`
- Inspect/modify: `src/lib/server/subscriptions.ts`
- Modify: `src/components/admin/plans-manager.tsx`
- Modify: `src/components/admin/views/plans.tsx`

- [ ] Map cart selections to existing plan identifiers and use the current checkout endpoint/provider contract.
- [ ] Ensure unsupported or unconfigured payment methods are not displayed as available options.
- [ ] Confirm admin plan editing remains the source of truth for catalog pricing and operational metadata.
- [ ] Preserve existing subscription and authentication behavior.

### Task 4: Verification

**Files:**
- Modify: `tests/server.test.ts` only if focused coverage is needed.
- Create or modify: marketplace-focused tests under `tests/` or existing Playwright coverage.

- [ ] Run typecheck and lint.
- [ ] Run unit/server tests and production build.
- [ ] Verify both locale routes, exact catalog prices, search/filter/duration behavior, cart totals, and checkout handoff.
- [ ] Report successful checks and any environment-dependent configuration still required.
