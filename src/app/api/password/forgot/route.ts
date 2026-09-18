import { api, body, success, throttle } from "@/lib/server/http";
import { forgotSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { ensureEmailAvailable, issueEmailToken } from "@/lib/server/email";
import { ApiError, rateLimit } from "@/lib/server/security";
import { after } from "next/server";
export const POST = api(async (request) => {
  await throttle(request, "forgot", 30);
  const input = await body(request, forgotSchema);
  ensureEmailAvailable();
  try { await rateLimit("forgot-email", input.email, 3, 3600); }
  catch (error) { if (error instanceof ApiError && error.status === 429) return success(); throw error; }
  // Account lookup and email delivery happen after the identical response for every email.
  after(async () => {
    try {
      const user = await db.user.findUnique({ where: { email: input.email } });
      if (user) await db.$transaction((tx) => issueEmailToken(tx, user, "reset", input.locale), { timeout: 15000 });
    } catch { /* Never expose account existence, tokens, or mail-provider payloads. */ }
  });
  return success();
});
