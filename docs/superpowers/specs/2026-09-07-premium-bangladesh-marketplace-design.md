# Premium Bangladesh Subscription Marketplace

## Goal

Turn the existing Aro Next.js application into a polished, mobile-first digital subscription marketplace for Bangladesh while preserving authentication, Prisma persistence, admin plan management, and existing checkout/payment behavior.

## Catalog

Catalog data will live in a reusable structured module, not page markup. Each product owns its plans and localized copy. Prices are integer BDT amounts and match the supplied catalog exactly:

- Netflix: 300 / 850 / 1550 / 2850 for 1 month, 3 months, 6 months, 1 year
- Prime Video: 120 / 350 / 600 for 1 month, 6 months, 1 year
- Hoichoi: 350 / 490 for 6 months, 1 year
- Chorki: 350 / 450 for 6 months, 1 year
- YouTube Premium: 250 / 1350 / 2450 for 1 month, 6 months, 1 year
- ChatGPT Plus: 400 / 1090 / 1990 for 1 month, 3 months, 6 months

Account type, access rules, delivery time, stock, and support terms remain unset until configured through the existing admin workflow. The UI will label missing values as configuration pending rather than inventing claims.

## Experience

The localized marketplace landing page will provide a hero/search area, category filters, duration selectors, product cards, product detail views, a cart drawer/page, and checkout handoff. English and Bangla routes share the same catalog and use BDT formatting. The design uses warm neutral surfaces, deep green/navy ink, restrained accent color, generous spacing, clear pricing hierarchy, and subtle motion with reduced-motion support.

## Architecture

The storefront uses client components only for search, filtering, duration selection, cart state, and dialogs. Product/catalog definitions remain in a shared library. Existing Prisma Plan records are preserved and synchronized through a non-destructive upsert seed path. Existing auth, dashboard, admin plan management, APIs, and payment provider logic remain the source of truth for account and checkout operations.

Checkout will only invoke an already-supported payment flow. The UI will not claim payment methods, delivery guarantees, inventory, or partnerships that are not configured.

## Verification

Run typecheck, lint, unit tests, production build, and focused browser/API checks where available. Verify both locales, BDT formatting, catalog totals, search/filter behavior, cart totals, and checkout handoff without changing production records destructively.
