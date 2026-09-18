import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "./db";
import { adminSchema, emailSchema, planCreateSchema } from "./validation";
import { ApiError, digest } from "./security";
import { paymentAdapter, providerCall, stripeClient } from "./payments";

export async function mutateAdmin(actorId: string, input: z.infer<typeof adminSchema>) {
  input = adminSchema.parse(input);
  const actor = await db.user.findUnique({ where: { id: actorId } });
  if (!actor) throw new ApiError("unauthorized", 401);
  if (actor.role !== "admin") throw new ApiError("forbidden", 403);
  const audit = (tx: Prisma.TransactionClient, id: string) => tx.activity.create({ data: {
    userId: actorId, action: `admin.${input.resource}.${input.action}`, metadata: { id, fields: Object.keys(input).filter((k) => !["resource", "action", "id"].includes(k)) },
  } });
  if (input.resource === "plans") {
    const { action, id } = input;
    const fields = planCreateSchema.partial().parse(input);
    if (action === "update" && (!id || !Object.keys(fields).length)) throw new ApiError("invalidInput", 400);
    return db.$transaction(async (tx) => {
      const plan = action === "create" ? await tx.plan.create({ data: { ...planCreateSchema.parse(fields), currency: "BDT" } }) : await tx.plan.update({ where: { id }, data: fields });
      await audit(tx, plan.id); return { plan };
    });
  }
  if (input.resource === "coupons") {
    paymentAdapter(); // Reject unsupported/unconfigured providers before advertising discounts.
    if (input.action === "create") {
      if (!input.code || !input.percentOff) throw new ApiError("invalidInput", 400);
      const expiresAt = input.expiresAt ? new Date(input.expiresAt) : null;
      if (expiresAt && expiresAt <= new Date()) throw new ApiError("invalidInput", 400);
      if (await db.coupon.findUnique({ where: { code: input.code } })) throw new ApiError("conflict", 409);
      const code = input.code, percentOff = input.percentOff;
      const key = digest(JSON.stringify([code, percentOff, expiresAt, input.maxRedemptions ?? null]));
      const stripe = stripeClient();
      const coupon = await providerCall(() => stripe.coupons.create({ id: `aro_${digest(code).slice(0, 32)}`, name: code, percent_off: percentOff, duration: "once",
        ...(expiresAt ? { redeem_by: Math.floor(expiresAt.getTime() / 1000) } : {}), ...(input.maxRedemptions ? { max_redemptions: input.maxRedemptions } : {}),
      }, { idempotencyKey: `aro-coupon-${key}` }));
      const promotion = await providerCall(() => stripe.promotionCodes.create({ promotion: { type: "coupon", coupon: coupon.id }, code, active: input.active ?? true,
        ...(expiresAt ? { expires_at: Math.floor(expiresAt.getTime() / 1000) } : {}), ...(input.maxRedemptions ? { max_redemptions: input.maxRedemptions } : {}),
      }, { idempotencyKey: `aro-promotion-${key}-${input.active ?? true}` }));
      return db.$transaction(async (tx) => {
        const saved = await tx.coupon.create({ data: { code, percentOff, active: promotion.active, expiresAt, maxRedemptions: input.maxRedemptions, providerCouponId: coupon.id, providerPromotionId: promotion.id } });
        await audit(tx, saved.id); return { coupon: saved };
      });
    }
    if (!input.id || typeof input.active !== "boolean") throw new ApiError("invalidInput", 400);
    const existing = await db.coupon.findUnique({ where: { id: input.id } });
    if (!existing) throw new ApiError("notFound", 404);
    if (!existing.providerPromotionId || (input.code !== undefined && input.code !== existing.code) ||
      (input.percentOff !== undefined && input.percentOff !== existing.percentOff) ||
      (input.maxRedemptions !== undefined && input.maxRedemptions !== existing.maxRedemptions) ||
      (input.expiresAt !== undefined && input.expiresAt !== (existing.expiresAt?.toISOString() ?? null))) throw new ApiError("conflict", 409);
    const promotion = await providerCall(() => stripeClient().promotionCodes.update(existing.providerPromotionId!, { active: input.active }));
    return db.$transaction(async (tx) => {
      const coupon = await tx.coupon.update({ where: { id: existing.id }, data: { active: promotion.active, redemptions: promotion.times_redeemed } });
      await audit(tx, coupon.id); return { coupon };
    });
  }
  if (input.resource === "subscriptions") {
    const sub = await db.subscription.findUnique({ where: { id: input.id } });
    if (!sub) throw new ApiError("notFound", 404);
    if (sub.providerSubscriptionId) {
      if (input.status !== undefined || typeof input.cancelAtPeriodEnd !== "boolean") throw new ApiError("conflict", 409);
      await paymentAdapter(sub.provider || "").setCancellation(sub.userId, input.cancelAtPeriodEnd);
      await db.$transaction((tx) => audit(tx, sub.id));
      return { pending: true };
    }
    if (!input.status || !["free", "cancelled", "expired"].includes(input.status) || input.cancelAtPeriodEnd !== undefined) throw new ApiError("conflict", 409);
    const status = input.status;
    return db.$transaction(async (tx) => {
      const result = await tx.subscription.updateMany({ where: { id: sub.id, providerSubscriptionId: null }, data: { status,
        planId: null, currentPeriodStart: null, currentPeriodEnd: null, trialStart: null, trialEnd: null, cancelAtPeriodEnd: false,
        cancelledAt: status === "cancelled" ? new Date() : null, endedAt: status === "expired" ? new Date() : null } });
      if (result.count !== 1) throw new ApiError("conflict", 409);
      await audit(tx, sub.id); return { subscription: await tx.subscription.findUnique({ where: { id: sub.id } }) };
    });
  }
  if (input.resource === "tickets") {
    if (input.status === undefined && input.reply === undefined) throw new ApiError("invalidInput", 400);
    const { id, reply, status } = input;
    return db.$transaction(async (tx) => {
      const ticket = await tx.ticket.update({ where: { id }, data: { status, reply, ...(reply ? { repliedAt: new Date() } : {}) } });
      if (reply) await tx.notification.create({ data: { userId: ticket.userId, title: "Support replied", message: ticket.subject } });
      await audit(tx, id); return { ticket };
    });
  }
  const { key } = input;
  const value = key === "supportEmail" ? emailSchema.parse(input.value) : input.value;
  return db.$transaction(async (tx) => {
    const setting = await tx.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
    await audit(tx, key); return { setting };
  });
}
