import type { Prisma, Subscription } from "@prisma/client";
import { ApiError } from "./security";

export function hasEntitlement(subscription: Pick<Subscription, "status" | "currentPeriodEnd" | "trialEnd"> | null, now = new Date()) {
  if (!subscription || !["trial", "active"].includes(subscription.status)) return false;
  const end = subscription.status === "trial" ? subscription.trialEnd : subscription.currentPeriodEnd;
  return !!end && end > now;
}
export function stripeStatus(status: string) {
  switch (status) {
    case "trialing": return "trial";
    case "active": return "active";
    case "past_due": case "unpaid": case "paused": return "past_due";
    case "canceled": return "cancelled";
    case "incomplete_expired": return "expired";
    case "incomplete": return "free";
    default: throw new ApiError("invalidInput", 400);
  }
}
export type SubscriptionSnapshot = {
  userId: string; customerId: string; providerSubscriptionId: string; planId: string;
  status: string; billingCycle: "monthly" | "yearly"; unitAmount: number; currency: string;
  currentPeriodStart: Date; currentPeriodEnd: Date; trialStart: Date | null; trialEnd: Date | null;
  cancelAtPeriodEnd: boolean; cancelledAt: Date | null; endedAt: Date | null;
};
export async function applySubscriptionSnapshot(tx: Prisma.TransactionClient, snapshot: SubscriptionSnapshot, eventCreated: number) {
  const { customerId, ...fields } = snapshot;
  const user = await tx.user.findUnique({ where: { id: snapshot.userId } });
  if (!user || user.stripeCustomerId !== customerId) throw new ApiError("forbidden", 403);
  const plan = await tx.plan.findUnique({ where: { id: snapshot.planId } });
  if (!plan || snapshot.currency !== "BDT" || !Number.isSafeInteger(snapshot.unitAmount) || snapshot.unitAmount < 0) throw new ApiError("invalidInput", 400);
  const existing = await tx.subscription.findUnique({ where: { userId: user.id } });
  if (existing && eventCreated < existing.providerEventCreated) return false;
  if (existing?.providerSubscriptionId && existing.providerSubscriptionId !== snapshot.providerSubscriptionId) {
    // An old terminal subscription must never replace a newly attached one.
    if (["cancelled", "expired"].includes(snapshot.status)) return false;
    if (!["cancelled", "expired", "free"].includes(existing.status)) throw new ApiError("conflict", 409);
  }
  if ((!existing?.providerSubscriptionId || existing.planId !== plan.id || existing.billingCycle !== snapshot.billingCycle) &&
    (!plan.active || snapshot.unitAmount !== (snapshot.billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice))) throw new ApiError("conflict", 409);
  const data = { ...fields, provider: "stripe", providerEventCreated: eventCreated,
    trialUsed: existing?.trialUsed || !!snapshot.trialStart, checkoutSessionId: null, checkoutUrl: null, checkoutExpiresAt: null, checkoutKey: null, checkoutRequestHash: null };
  await tx.subscription.upsert({ where: { userId: user.id }, create: data, update: data });
  const limits = hasEntitlement(snapshot) ? ({ starter: [100, 100], professional: [1000, 1024], premium: [10000, 10240] }[plan.slug] ?? [100, 100]) : [10, 100];
  await tx.usage.upsert({ where: { userId: user.id }, create: { userId: user.id, toolsLimit: limits[0], storageLimit: limits[1] }, update: { toolsLimit: limits[0], storageLimit: limits[1] } });
  await tx.activity.create({ data: { userId: user.id, action: "subscription.synced", metadata: { status: snapshot.status, planId: plan.id } } });
  return true;
}
