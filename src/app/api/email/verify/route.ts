import { z } from "zod";
import { api, body, success, throttle } from "@/lib/server/http";
import { tokenSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { consumeToken } from "@/lib/server/security";
export const POST = api(async (request) => {
  await throttle(request, "verify", 20);
  const { token } = await body(request, z.object({ token: tokenSchema }).strict());
  await db.$transaction(async (tx) => {
    const userId = await consumeToken(tx, token, "verify");
    await tx.user.update({ where: { id: userId }, data: { emailVerified: new Date() } });
    await tx.emailToken.deleteMany({ where: { userId, purpose: "verify" } });
    await tx.activity.create({ data: { userId, action: "email.verified" } });
  });
  return success();
});
