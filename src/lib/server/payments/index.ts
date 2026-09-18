import Stripe from "stripe";
import type { User } from "@prisma/client";
import { db } from "../db";
import { ApiError, appOrigin, digest, newToken } from "../security";

export type PaymentProvider = "stripe" | "sslcommerz" | "bkash" | "nagad" | "amarpay";
export type CheckoutInput = { user: User; planId: string; billingCycle: "monthly" | "yearly"; locale: "en" | "bn" };
export interface PaymentAdapter {
  checkout(input: CheckoutInput): Promise<{ url: string }>;
  portal(user: User, locale: "en" | "bn"): Promise<{ url: string }>;
  setCancellation(userId: string, cancel: boolean): Promise<void>;
}
let client: Stripe | undefined;
export function stripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) throw new ApiError("paymentUnavailable", 503);
  return client ??= new Stripe(process.env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2, timeout: 10000 });
}
export async function providerCall<T>(operation: () => Promise<T>): Promise<T> {
  try { return await operation(); }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError("paymentUnavailable", 503); }
}
export function providerId(value: string | { id: string } | null | undefined) { return typeof value === "string" ? value : value?.id; }

async function customerFor(user: User) {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await providerCall(() => stripeClient().customers.create({ email: user.email, name: user.name || undefined, metadata: { aroUserId: user.id } }, { idempotencyKey: `aro-customer-${user.id}` }));
  await db.user.updateMany({ where: { id: user.id, stripeCustomerId: null }, data: { stripeCustomerId: customer.id } });
  const current = await db.user.findUniqueOrThrow({ where: { id: user.id } });
  return current.stripeCustomerId!;
}

const stripeAdapter: PaymentAdapter = {
  async checkout({ user, planId, billingCycle, locale }) {
    stripeClient();
    if (!user.emailVerified) throw new ApiError("forbidden", 403);
    const plan = await db.plan.findFirst({ where: { id: planId, active: true } });
    if (!plan || plan.currency !== "BDT") throw new ApiError("notFound", 404);
    const unitAmount = billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
    if (!Number.isSafeInteger(unitAmount) || unitAmount < 100 || unitAmount > 100_000_000) throw new ApiError("invalidInput", 400);
    const customer = await customerFor(user);
    const requestHash = digest(JSON.stringify([plan.id, plan.updatedAt.toISOString(), billingCycle, locale]));
    const reservation = await db.$transaction(async (tx) => {
      const sub = await tx.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} });
      if (["active", "trial", "past_due"].includes(sub.status) || (sub.providerSubscriptionId && !["cancelled", "expired"].includes(sub.status))) throw new ApiError("conflict", 409);
      if (sub.checkoutExpiresAt && sub.checkoutExpiresAt > new Date()) {
        if (sub.checkoutRequestHash !== requestHash) throw new ApiError("conflict", 409);
        return sub;
      }
      return tx.subscription.update({ where: { id: sub.id }, data: { checkoutKey: newToken(), checkoutRequestHash: requestHash,
        checkoutExpiresAt: new Date(Math.floor(Date.now() / 1000) * 1000 + 3_600_000), checkoutUrl: null, checkoutSessionId: null } });
    });
    if (reservation.checkoutUrl) return { url: reservation.checkoutUrl };
    const metadata = { aroUserId: user.id, planId: plan.id, billingCycle };
    const session = await providerCall(() => stripeClient().checkout.sessions.create({
      mode: "subscription", customer, client_reference_id: user.id, metadata, payment_method_types: ["card"], allow_promotion_codes: true,
      expires_at: Math.floor(reservation.checkoutExpiresAt!.getTime() / 1000),
      line_items: [{ quantity: 1, price_data: { currency: "bdt", unit_amount: unitAmount,
        recurring: { interval: billingCycle === "yearly" ? "year" : "month" },
        product_data: { name: plan.name, description: plan.description || undefined, metadata: { planId: plan.id } } } }],
      subscription_data: { metadata, ...(plan.trialDays > 0 && !reservation.trialUsed ? { trial_period_days: plan.trialDays } : {}) },
      success_url: `${appOrigin()}/${locale}/dashboard/subscription?checkout=success`,
      cancel_url: `${appOrigin()}/${locale}/dashboard/subscription?checkout=cancelled`,
    }, { idempotencyKey: `aro-checkout-${reservation.checkoutKey}` }));
    if (!session.url) throw new ApiError("paymentUnavailable", 503);
    await db.subscription.updateMany({ where: { id: reservation.id, checkoutKey: reservation.checkoutKey }, data: { checkoutSessionId: session.id, checkoutUrl: session.url } });
    return { url: session.url };
  },
  async portal(user, locale) {
    if (!user.stripeCustomerId) throw new ApiError("conflict", 409);
    const session = await providerCall(() => stripeClient().billingPortal.sessions.create({
      customer: user.stripeCustomerId!, return_url: `${appOrigin()}/${locale}/dashboard/subscription`,
      ...(process.env.STRIPE_PORTAL_CONFIGURATION_ID ? { configuration: process.env.STRIPE_PORTAL_CONFIGURATION_ID } : {}),
    }));
    return { url: session.url };
  },
  async setCancellation(userId, cancel) {
    const sub = await db.subscription.findUnique({ where: { userId }, include: { user: true } });
    if (!sub?.providerSubscriptionId || sub.provider !== "stripe") throw new ApiError("conflict", 409);
    await providerCall(async () => {
      const remote = await stripeClient().subscriptions.retrieve(sub.providerSubscriptionId!);
      if (providerId(remote.customer) !== sub.user.stripeCustomerId || remote.metadata.aroUserId !== userId) throw new ApiError("forbidden", 403);
      if (!["active", "trialing", "past_due"].includes(remote.status)) throw new ApiError("conflict", 409);
      await stripeClient().subscriptions.update(remote.id, { cancel_at_period_end: cancel });
    });
    // Provider-confirmed webhook is the sole writer of entitlement and lifecycle fields.
  },
};
export function paymentAdapter(provider: string = process.env.PAYMENT_PROVIDER || "stripe"): PaymentAdapter {
  if (provider !== "stripe") throw new ApiError("paymentUnavailable", 503);
  stripeClient();
  return stripeAdapter;
}
