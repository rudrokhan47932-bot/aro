import { z } from "zod";
import { api, apiUser, body, success } from "@/lib/server/http";
import { idSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { ApiError, rateLimit } from "@/lib/server/security";
export const POST = api(async (request) => {
  const user = await apiUser();
  await rateLimit("notifications", user.id, 60, 900);
  const input = await body(request, z.object({ id: idSchema.optional(), all: z.boolean().optional() }).strict()
    .refine((v) => v.all === true ? !v.id : !!v.id));
  if (input.id && !await db.notification.findFirst({ where: { id: input.id, userId: user.id } })) throw new ApiError("notFound", 404);
  const result = await db.notification.updateMany({ where: { userId: user.id, ...(input.id ? { id: input.id } : {}), readAt: null }, data: { readAt: new Date() } });
  return success({ count: result.count });
});