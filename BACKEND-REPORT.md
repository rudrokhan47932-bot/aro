# Aro backend implementation

Status: implementation in progress.

## Authorized design and implementation plan

Scope is limited to prisma/**, src/lib/server/**, src/app/api/**, src/types/**,
tests/server.test.ts, .env.example and this report. No commits or branches.

1. Create SQLite schema, SQL migration and idempotent plan-only seed. Persist authentication,
   subscriptions, billing events, application data, email token hashes and rate limits.
2. Implement Auth.js JWT credentials/optional Google, database role/version checks,
   validated same-origin APIs, bcrypt passwords, expiring single-use verification/reset tokens.
3. Implement bounded member/admin reads and audited administrative writes.
4. Implement Stripe checkout/portal/cancellation and verified, transactional webhook processing.
   Other payment providers fail closed. Paid access never follows browser redirects.
5. Generate Prisma, apply migration to an isolated test database, exercise security/state
   constraints and typecheck. Record exact verification and UI integration contract below.

The provided brief is the approved design. Questions, additional approval gates and commits
are excluded by the task instructions. Production mail must be configured before required
email mutations. Development mail uses private local outbox files. No demo members or revenue.
