import { z } from "zod";
import { api, apiUser, body, success } from "@/lib/server/http";
import { nameSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/security";
export const PATCH = api(async (request) => {
  const user = await apiUser();
  await rateLimit("account", user.id, 20, 900);
  const input = await body(request, z.object({ name: nameSchema }).strict());
  await db.$transaction([
    db.user.update({ where: { id: user.id }, data: input }),
    db.activity.create({ data: { userId: user.id, action: "account.updated" } }),
  ]);
  return success();
});