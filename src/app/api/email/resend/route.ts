import { z } from "zod";
import { api, apiUser, body, success } from "@/lib/server/http";
import { localeSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { ensureEmailAvailable, issueEmailToken } from "@/lib/server/email";
import { rateLimit } from "@/lib/server/security";
export const POST = api(async (request) => {
  const user = await apiUser();
  const { locale } = await body(request, z.object({ locale: localeSchema }).strict());
  await rateLimit("resend", user.id, 3, 3600);
  if (!user.emailVerified) {
    ensureEmailAvailable();
    await db.$transaction((tx) => issueEmailToken(tx, user, "verify", locale), { timeout: 15000 });
  }
  return success();
});
