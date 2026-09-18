import { after, before, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { unlink } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import type Stripe from "stripe";
import { registerSchema, passwordSchema, adminSchema, subscriptionSchema } from "../src/lib/server/validation";

const root = process.cwd();
const databasePath = path.join(root, "prisma", `server-test-${randomUUID()}.db`);
let db: PrismaClient;
let security: typeof import("../src/lib/server/security");
let accounts: typeof import("../src/lib/server/accounts");
let subscriptions: typeof import("../src/lib/server/subscriptions");
let payments: typeof import("../src/lib/server/payments");
let webhook: typeof import("../src/lib/server/payments/webhook");
let admin: typeof import("../src/lib/server/admin");
let passwordHash: string;
const runSeed = () => execFileSync(process.execPath, ["--import", "tsx", "prisma/seed.ts"], {
  cwd: root, env: { ...process.env, ADMIN_EMAIL: "", ADMIN_PASSWORD: "" }, stdio: "pipe",
});
before(async () => {
  process.env.DATABASE_URL = `file:${databasePath.replaceAll("\\", "/")}`;
  process.env.APP_URL = "http://localhost:3000";
  Object.assign(process.env, { NODE_ENV: "test" });
  process.env.STRIPE_SECRET_KEY = "sk_test_local_unit_tests_only";
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_local_unit_tests_only";
  process.env.PAYMENT_PROVIDER = "stripe";
  delete process.env.RESEND_API_KEY; delete process.env.EMAIL_FROM;
  execFileSync(process.execPath, ["node_modules/prisma/build/index.js", "migrate", "deploy"], { cwd: root, env: process.env, stdio: "pipe" });
  runSeed(); runSeed();
  ({ db } = await import("../src/lib/server/db"));
  security = await import("../src/lib/server/security");
  accounts = await import("../src/lib/server/accounts");
  subscriptions = await import("../src/lib/server/subscriptions");
  payments = await import("../src/lib/server/payments");
  webhook = await import("../src/lib/server/payments/webhook");
  admin = await import("../src/lib/server/admin");
  passwordHash = await security.hashPassword("a-long-test-password");
});
after(async () => {
  await db?.$disconnect();
  for (const suffix of ["", "-journal", "-wal", "-shm"]) await unlink(databasePath + suffix).catch(() => {});
});
const createUser = (fields: { role?: string; stripeCustomerId?: string } = {}) => db.user.create({ data: {
  email: `${randomUUID()}@example.test`, name: "Test member", passwordHash, ...fields,
  subscription: { create: {} }, usage: { create: {} },
} });
function snapshot(userId: string, customerId: string): import("../src/lib/server/subscriptions").SubscriptionSnapshot {
  return { userId, customerId, providerSubscriptionId: `sub_${randomUUID()}`, planId: "starter", status: "active", billingCycle: "monthly", unitAmount: 49900, currency: "BDT",
    currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 86_400_000), trialStart: null, trialEnd: null,
    cancelAtPeriodEnd: false, cancelledAt: null, endedAt: null };
}

test("migration and repeated seed create plans, no users or fabricated revenue", async () => {
  assert.equal(await db.plan.count(), 3);
  assert.equal(await db.user.count(), 0);
  assert.equal(await db.transaction.count(), 0);
  await db.plan.update({ where: { id: "starter" }, data: { description: "An administrator edit" } });
  runSeed();
  assert.equal((await db.plan.findUniqueOrThrow({ where: { id: "starter" } })).description, "An administrator edit");
});
test("validation rejects mass assignment, unsupported locales, unsafe prices and bcrypt truncation", () => {
  const valid = { name: "Member", email: " MEMBER@EXAMPLE.COM ", password: "a-secure-password", locale: "bn" };
  assert.equal(registerSchema.parse(valid).email, "member@example.com");
  assert.equal(registerSchema.safeParse({ ...valid, role: "admin" }).success, false);
  assert.equal(registerSchema.safeParse({ ...valid, locale: "fr" }).success, false);
  assert.equal(passwordSchema.safeParse("আ".repeat(25)).success, false);
  assert.equal(adminSchema.safeParse({ resource: "plans", action: "update", id: "starter", monthlyPrice: -1 }).success, false);
  assert.equal(subscriptionSchema.safeParse({ action: "checkout", locale: "en" }).success, false);
});
test("migration enforces role, subscription status, amount and email uniqueness", async () => {
  const user = await createUser();
  await assert.rejects(db.user.update({ where: { id: user.id }, data: { role: "superuser" } }));
  await assert.rejects(db.subscription.update({ where: { userId: user.id }, data: { status: "paid-by-browser" } }));
  await assert.rejects(db.transaction.create({ data: { userId: user.id, amount: -1, description: "bad", status: "paid" } }));
  await assert.rejects(db.user.create({ data: { email: user.email } }));
});
test("CSRF rejects absent, cross-origin and misleading origin headers", () => {
  security.assertSameOrigin(new Request("http://localhost:3000/api/account", { headers: { origin: "http://localhost:3000" } }));
  const invalidHeaders: Record<string, string>[] = [{}, { origin: "https://attacker.test" }, { origin: "null" }, { origin: "http://localhost:3000", "sec-fetch-site": "cross-site" }];
  for (const headers of invalidHeaders) {
    assert.throws(() => security.assertSameOrigin(new Request("http://localhost:3000/api/account", { headers })), { key: "forbidden" });
  }
});
test("password comparison rejects absent hashes and session revocation fails closed", async () => {
  assert.equal(await security.verifyPassword("a-long-test-password", passwordHash), true);
  assert.equal(await security.verifyPassword("wrong-password", passwordHash), false);
  assert.equal(await security.verifyPassword("a-long-test-password", null), false);
  assert.equal(security.sessionMatches({ sessionVersion: 2 }, 2), true);
  for (const version of [1, undefined, "2"]) assert.equal(security.sessionMatches({ sessionVersion: 2 }, version), false);
  assert.equal(security.sessionMatches(null, 2), false);
});
test("database rate limits reject concurrent excess requests", async () => {
  const identity = randomUUID();
  const results = await Promise.allSettled(Array.from({ length: 6 }, () => security.rateLimit("test", identity, 3, 60)));
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 3);
  assert.equal(results.filter((r) => r.status === "rejected" && r.reason.key === "tooManyRequests").length, 3);
});
test("email tokens are purpose-bound, expiring, single-use and stored only as hashes", async () => {
  const user = await createUser(), token = security.newToken();
  await db.emailToken.create({ data: { userId: user.id, tokenHash: security.digest(token), purpose: "verify", expiresAt: new Date(Date.now() + 60000) } });
  assert.equal(await db.emailToken.findUnique({ where: { tokenHash: token } }), null);
  await assert.rejects(db.$transaction((tx) => security.consumeToken(tx, token, "reset")), { key: "invalidToken" });
  assert.equal(await db.$transaction((tx) => security.consumeToken(tx, token, "verify")), user.id);
  await assert.rejects(db.$transaction((tx) => security.consumeToken(tx, token, "verify")), { key: "invalidToken" });
  await db.emailToken.create({ data: { userId: user.id, tokenHash: security.digest(token), purpose: "verify", expiresAt: new Date(Date.now() - 1) } });
  await assert.rejects(db.$transaction((tx) => security.consumeToken(tx, token, "verify")), { key: "invalidToken" });
});
test("reset atomically changes password, consumes tokens and revokes sessions", async () => {
  const user = await createUser(), token = security.newToken();
  await db.emailToken.create({ data: { userId: user.id, tokenHash: security.digest(token), purpose: "reset", expiresAt: new Date(Date.now() + 60000) } });
  await db.session.create({ data: { userId: user.id, sessionToken: randomUUID(), expires: new Date(Date.now() + 60000) } });
  const input = { token, password: "the-new-secure-password", locale: "en" as const };
  await accounts.resetPassword(input);
  const updated = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  assert.equal(updated.sessionVersion, 1);
  assert.equal(await security.verifyPassword(input.password, updated.passwordHash), true);
  assert.equal(await db.session.count({ where: { userId: user.id } }), 0);
  await assert.rejects(accounts.resetPassword(input), { key: "invalidToken" });
});
test("production mail misconfiguration fails registration before mutation", async () => {
  const count = await db.user.count();
  Object.assign(process.env, { NODE_ENV: "production" }); process.env.APP_URL = "https://aro.example";
  try { await assert.rejects(accounts.register({ name: "Member", email: "mail-missing@example.test", password: "a-secure-password", locale: "en" }), { key: "emailUnavailable" }); }
  finally { Object.assign(process.env, { NODE_ENV: "test" }); process.env.APP_URL = "http://localhost:3000"; }
  assert.equal(await db.user.count(), count);
});
test("expired and nonpaying subscriptions cannot authorize premium access", () => {
  const currentPeriodEnd = new Date(Date.now() + 60000);
  assert.equal(subscriptions.hasEntitlement({ status: "active", currentPeriodEnd, trialEnd: null }), true);
  for (const status of ["free", "past_due", "cancelled", "expired"]) assert.equal(subscriptions.hasEntitlement({ status, currentPeriodEnd, trialEnd: null }), false);
  assert.equal(subscriptions.hasEntitlement({ status: "active", currentPeriodEnd: new Date(0), trialEnd: null }), false);
  assert.equal(subscriptions.hasEntitlement({ status: "trial", currentPeriodEnd, trialEnd: null }), false);
});
test("provider mapping and stale events cannot alter the wrong account or regress status", async () => {
  const user = await createUser({ stripeCustomerId: `cus_${randomUUID()}` });
  const state = snapshot(user.id, user.stripeCustomerId!);
  await assert.rejects(db.$transaction((tx) => subscriptions.applySubscriptionSnapshot(tx, { ...state, customerId: "cus_someone_else" }, 100)), { key: "forbidden" });
  await db.$transaction((tx) => subscriptions.applySubscriptionSnapshot(tx, state, 200));
  assert.equal(await db.$transaction((tx) => subscriptions.applySubscriptionSnapshot(tx, { ...state, status: "past_due" }, 100)), false);
  assert.equal((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status, "active");
  await assert.rejects(db.$transaction((tx) => subscriptions.applySubscriptionSnapshot(tx, { ...state, planId: "premium", unitAmount: 1 }, 300)), { key: "conflict" });
});
test("Stripe signatures and hosted invoice allowlist reject forgery and unsafe redirects", () => {
  const stripe = payments.stripeClient(), raw = JSON.stringify({ id: "evt_test", type: "ping", data: { object: {} } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload: raw, secret: process.env.STRIPE_WEBHOOK_SECRET! });
  assert.equal(webhook.verifyStripeEvent(raw, signature).id, "evt_test");
  assert.throws(() => webhook.verifyStripeEvent(raw + " ", signature), { key: "invalidInput" });
  assert.throws(() => webhook.verifyStripeEvent(raw, null), { key: "invalidInput" });
  for (const url of ["javascript:alert(1)", "https://invoice.stripe.com.attacker.test/x", "https://attacker.test/x", "https://name@invoice.stripe.com/x"]) assert.equal(webhook.safeInvoiceUrl(url), null);
  assert.equal(webhook.safeInvoiceUrl("https://invoice.stripe.com/i/test"), "https://invoice.stripe.com/i/test");
});
test("webhook transactions deduplicate invoice revenue and use canonical subscription state", async () => {
  const user = await createUser({ stripeCustomerId: `cus_${randomUUID()}` }), stripe = payments.stripeClient();
  const remote = { id: `sub_${randomUUID()}`, customer: user.stripeCustomerId, metadata: { aroUserId: user.id }, status: "active", cancel_at_period_end: false,
    items: { data: [{ quantity: 1, current_period_start: Math.floor(Date.now() / 1000), current_period_end: Math.floor(Date.now() / 1000) + 86400,
      price: { unit_amount: 49900, currency: "bdt", metadata: {}, recurring: { interval: "month", interval_count: 1 }, product: { id: "prod_test", metadata: { planId: "starter" } } } }] } };
  const invoice = { id: `in_${randomUUID()}`, customer: user.stripeCustomerId, currency: "bdt", status: "paid", amount_paid: 49900, amount_due: 49900,
    created: Math.floor(Date.now() / 1000), parent: { subscription_details: { subscription: remote.id } }, status_transitions: { paid_at: Math.floor(Date.now() / 1000) }, hosted_invoice_url: "https://invoice.stripe.com/i/test" };
  const originalSub = stripe.subscriptions.retrieve, originalInvoice = stripe.invoices.retrieve;
  stripe.subscriptions.retrieve = (async () => remote) as unknown as typeof originalSub;
  stripe.invoices.retrieve = (async () => invoice) as unknown as typeof originalInvoice;
  const event = { id: `evt_${randomUUID()}`, type: "invoice.paid", created: 100, data: { object: { id: invoice.id } } } as Stripe.Event;
  try {
    assert.deepEqual(await webhook.processStripeEvent(event), { duplicate: false });
    assert.deepEqual(await webhook.processStripeEvent(event), { duplicate: true });
    await webhook.processStripeEvent({ ...event, id: `evt_${randomUUID()}`, type: "invoice.payment_succeeded" } as Stripe.Event);
    assert.equal(await db.transaction.count({ where: { userId: user.id } }), 1);
    assert.equal((await db.transaction.aggregate({ where: { userId: user.id }, _sum: { amount: true } }))._sum.amount, 49900);
    assert.equal((await db.subscription.findUniqueOrThrow({ where: { userId: user.id } })).status, "active");
    const invalid = { ...event, id: `evt_${randomUUID()}` };
    remote.customer = "cus_wrong";
    await assert.rejects(webhook.processStripeEvent(invalid));
    assert.equal(await db.webhookEvent.findUnique({ where: { id: invalid.id } }), null);
  } finally { stripe.subscriptions.retrieve = originalSub; stripe.invoices.retrieve = originalInvoice; }
});
test("admin authorization rechecks DB roles, audits changes, and forbids fabricated paid status", async () => {
  const user = await createUser(), actor = await createUser({ role: "admin" });
  const setting = { resource: "settings", action: "update", key: "brand", value: "Aro Test" } as const;
  await assert.rejects(admin.mutateAdmin(user.id, setting), { key: "forbidden" });
  await admin.mutateAdmin(actor.id, setting);
  assert.equal((await db.setting.findUniqueOrThrow({ where: { key: "brand" } })).value, "Aro Test");
  assert.equal(await db.activity.count({ where: { userId: actor.id, action: "admin.settings.update" } }), 1);
  const sub = await db.subscription.findUniqueOrThrow({ where: { userId: user.id } });
  await assert.rejects(admin.mutateAdmin(actor.id, { resource: "subscriptions", action: "update", id: sub.id, status: "active" }), { key: "conflict" });
  await db.user.update({ where: { id: actor.id }, data: { role: "user" } });
  await assert.rejects(admin.mutateAdmin(actor.id, setting), { key: "forbidden" });
});
test("unimplemented payment providers fail closed", () => {
  for (const provider of ["sslcommerz", "bkash", "nagad", "amarpay", "unknown"]) assert.throws(() => payments.paymentAdapter(provider), { key: "paymentUnavailable" });
});
