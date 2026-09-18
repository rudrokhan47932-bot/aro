import { api, apiUser, body, success } from "@/lib/server/http";
import { subscriptionSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { ApiError, rateLimit } from "@/lib/server/security";
import { paymentAdapter } from "@/lib/server/payments";
export const POST = api(async (request) => {
  const user = await apiUser();
  await rateLimit("subscription", user.id, 15, 900);
  const input = await body(request, subscriptionSchema);
  const adapter = paymentAdapter();
  if (input.action === "checkout") return success(await adapter.checkout({ user, planId: input.planId!, billingCycle: input.billingCycle!, locale: input.locale }));
  if (input.action === "portal" || input.action === "change") {
    if (input.action === "change" && !process.env.STRIPE_PORTAL_CONFIGURATION_ID) throw new ApiError("paymentUnavailable", 503);
    return success(await adapter.portal(user, input.locale));
  }
  await adapter.setCancellation(user.id, input.action === "cancel");
  await db.activity.create({ data: { userId: user.id, action: input.action === "cancel" ? "subscription.cancel_requested" : "subscription.resume_requested" } });
  return success({ pending: true });
});