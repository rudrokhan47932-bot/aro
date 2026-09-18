import { z } from "zod";

export const localeSchema = z.enum(["en", "bn"]);
export const emailSchema = z.string().trim().toLowerCase().email().max(254);
export const passwordSchema = z.string().min(12).max(72).refine(
  (value) => Buffer.byteLength(value, "utf8") <= 72, "Password exceeds bcrypt byte limit",
);
export const nameSchema = z.string().trim().min(2).max(80);
export const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/);
export const idSchema = z.string().min(1).max(128);
export const billingSchema = z.enum(["monthly", "yearly"]);
export const statusSchema = z.enum(["free", "trial", "active", "past_due", "cancelled", "expired"]);
export const registerSchema = z.object({ name: nameSchema, email: emailSchema, password: passwordSchema, locale: localeSchema }).strict();
export const forgotSchema = z.object({ email: emailSchema, locale: localeSchema }).strict();
export const resetSchema = z.object({ token: tokenSchema, password: passwordSchema, locale: localeSchema }).strict();
export const subscriptionSchema = z.object({
  action: z.enum(["checkout", "portal", "cancel", "resume", "change"]),
  planId: idSchema.optional(), billingCycle: billingSchema.optional(), locale: localeSchema,
}).strict().refine((v) => v.action !== "checkout" || !!(v.planId && v.billingCycle));
const amount = z.number().int().min(100).max(100_000_000);
const planFields = {
  name: z.string().trim().min(2).max(80), description: z.string().trim().max(1000),
  monthlyPrice: amount, yearlyPrice: amount, features: z.array(z.string().trim().min(1).max(200)).max(30),
  active: z.boolean(), highlighted: z.boolean(), trialDays: z.number().int().min(0).max(90),
};
export const adminSchema = z.discriminatedUnion("resource", [
  z.object({resource: z.literal("plans"), action: z.enum(["create", "update"]), id: idSchema.optional(),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60).optional(),
    ...z.object(planFields).partial().shape }).strict(),
  z.object({resource: z.literal("coupons"), action: z.enum(["create", "update"]), id: idSchema.optional(),
    code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/).optional(),
    percentOff: z.number().int().min(1).max(100).optional(), active: z.boolean().optional(),
    expiresAt: z.iso.datetime().nullable().optional(), maxRedemptions: z.number().int().min(1).max(1_000_000).nullable().optional(),
  }).strict(),
  z.object({resource: z.literal("subscriptions"), action: z.literal("update"), id: idSchema,
    status: statusSchema.optional(), cancelAtPeriodEnd: z.boolean().optional(),
  }).strict(),
  z.object({resource: z.literal("tickets"), action: z.literal("update"), id: idSchema,
    status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(), reply: z.string().trim().min(1).max(10000).optional(),
  }).strict(),
  z.object({resource: z.literal("settings"), action: z.enum(["create", "update"]), id: idSchema.optional(),
    key: z.enum(["brand", "supportEmail"]), value: z.string().trim().min(1).max(120),
  }).strict(),
]);
export const planCreateSchema = z.object({ ...planFields, slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(60) });
