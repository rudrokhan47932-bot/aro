import Stripe from "stripe";
import { Prisma } from "@prisma/client";
import { db } from "../db";
import { ApiError } from "../security";
import { applySubscriptionSnapshot, stripeStatus, type SubscriptionSnapshot } from "../subscriptions";
import { providerCall, providerId, stripeClient } from "./index";

const date = (seconds: number | null | undefined) => seconds ? new Date(seconds * 1000) : null;
export function safeInvoiceUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "invoice.stripe.com" && !url.username && !url.password && !url.port ? url.href : null;
  } catch { return null; }
}
function snapshotOf(sub: Stripe.Subscription): SubscriptionSnapshot {
  const item = sub.items.data[0], customerId = providerId(sub.customer);
  const { aroUserId: userId } = sub.metadata;
  const price = item?.price;
  const product = price?.product;
  const planId = price?.metadata.planId || (product && typeof product !== "string" && !product.deleted ? product.metadata.planId : undefined);
  const billingCycle = price?.recurring?.interval === "year" ? "yearly" : "monthly";
  if (!userId || !planId || !customerId || sub.items.data.length !== 1 || item.quantity !== 1 ||
    !price?.recurring || price.recurring.interval_count !== 1 || price.unit_amount === null || price.currency !== "bdt" ||
    !["monthly", "yearly"].includes(billingCycle) || price.recurring.interval !== (billingCycle === "yearly" ? "year" : "month")) throw new ApiError("invalidInput", 400);
  return { userId, customerId, planId, providerSubscriptionId: sub.id, status: stripeStatus(sub.status),
    billingCycle: billingCycle as "monthly" | "yearly", unitAmount: price.unit_amount, currency: "BDT",
    currentPeriodStart: date(item.current_period_start)!, currentPeriodEnd: date(item.current_period_end)!,
    trialStart: date(sub.trial_start), trialEnd: date(sub.trial_end), cancelAtPeriodEnd: sub.cancel_at_period_end,
    cancelledAt: date(sub.canceled_at), endedAt: date(sub.ended_at) };
}
export function verifyStripeEvent(raw: string, signature: string | null) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new ApiError("paymentUnavailable", 503);
  if (!signature || signature.length > 4096) throw new ApiError("invalidInput", 400);
  try { return stripeClient().webhooks.constructEvent(raw, signature, process.env.STRIPE_WEBHOOK_SECRET); }
  catch { throw new ApiError("invalidInput", 400); }
}

export async function processStripeEvent(event: Stripe.Event) {
  if (await db.webhookEvent.findUnique({ where: { id: event.id } })) return { duplicate: true };
  let snapshot: SubscriptionSnapshot | undefined, invoice: Stripe.Invoice | undefined, promotion: Stripe.PromotionCode | undefined;
  if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted", "customer.subscription.paused", "customer.subscription.resumed"].includes(event.type)) {
    const id = (event.data.object as Stripe.Subscription).id;
    // Fetch canonical provider state: old delivery payloads must not undo newer billing changes.
    snapshot = snapshotOf(await providerCall(() => stripeClient().subscriptions.retrieve(id, { expand: ["items.data.price.product"] })));
  } else if (["invoice.paid", "invoice.payment_succeeded", "invoice.payment_failed"].includes(event.type)) {
    invoice = await providerCall(() => stripeClient().invoices.retrieve((event.data.object as Stripe.Invoice).id));
    const subId = providerId(invoice.parent?.subscription_details?.subscription);
    if (!subId) invoice = undefined; // One-off/non-subscription invoices do not grant access.
    else {
      snapshot = snapshotOf(await providerCall(() => stripeClient().subscriptions.retrieve(subId, { expand: ["items.data.price.product"] })));
      if (providerId(invoice.customer) !== snapshot.customerId || invoice.currency !== "bdt") throw new ApiError("forbidden", 403);
    }
  } else if (["promotion_code.created", "promotion_code.updated"].includes(event.type)) {
    promotion = await providerCall(() => stripeClient().promotionCodes.retrieve((event.data.object as Stripe.PromotionCode).id));
  }
  try {
    await db.$transaction(async (tx) => {
      await tx.webhookEvent.create({ data: { id: event.id, type: event.type, created: event.created } });
      if (snapshot) {
        const current = await tx.subscription.findUnique({ where: { userId: snapshot.userId } });
        // Stripe timestamps have second resolution. Re-fetch tied events while holding the
        // transaction's write lock so concurrently fetched snapshots cannot reverse each other.
        if (current?.providerEventCreated === event.created) {
          const subId = snapshot.providerSubscriptionId;
          snapshot = snapshotOf(await providerCall(() => stripeClient().subscriptions.retrieve(subId, { expand: ["items.data.price.product"] })));
        }
      }
      if (snapshot) await applySubscriptionSnapshot(tx, snapshot, event.created);
      if (invoice && snapshot) {
        const paid = invoice.status === "paid";
        const amount = paid ? invoice.amount_paid : invoice.amount_due;
        if (!Number.isSafeInteger(amount) || amount < 0 || amount > 2_147_483_647) throw new ApiError("invalidInput", 400);
        const existing = await tx.transaction.findUnique({ where: { providerInvoiceId: invoice.id } });
        if (existing && existing.userId !== snapshot.userId) throw new ApiError("forbidden", 403);
        if (!existing || existing.status !== "paid" || paid) {
          const fields = { userId: snapshot.userId, amount, currency: "BDT", status: paid ? "paid" : "failed",
            description: `Aro ${snapshot.billingCycle} subscription`, provider: "stripe", providerInvoiceId: invoice.id,
            invoiceUrl: safeInvoiceUrl(invoice.hosted_invoice_url), paidAt: date(invoice.status_transitions.paid_at) };
          await tx.transaction.upsert({ where: { providerInvoiceId: invoice.id }, create: { ...fields, createdAt: date(invoice.created)! }, update: fields });
          if (!existing || existing.status !== fields.status) await tx.notification.create({ data: { userId: snapshot.userId,
            title: paid ? "Payment received" : "Payment needs attention", message: paid ? "Your payment is recorded. Your invoice is available in Billing." : "Please review your payment method in the billing portal." } });
        }
      }
      if (promotion) await tx.coupon.updateMany({ where: { providerPromotionId: promotion.id }, data: { active: promotion.active, redemptions: promotion.times_redeemed } });
    }, { timeout: 35000, maxWait: 10000 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002" && await db.webhookEvent.findUnique({ where: { id: event.id } })) return { duplicate: true };
    throw error;
  }
  return { duplicate: false };
}
