import { z } from "zod";
import { api, apiUser, body, success } from "@/lib/server/http";
import { localeSchema } from "@/lib/server/validation";
import { db } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/security";
export const POST = api(async (request) => {
  const user = await apiUser();
  await rateLimit("support", user.id, 5, 3600);
  const input = await body(request, z.object({ subject: z.string().trim().min(3).max(160), message: z.string().trim().min(10).max(10000), locale: localeSchema }).strict());
  const ticket = await db.$transaction(async (tx) => {
    const ticket = await tx.ticket.create({ data: { ...input, userId: user.id } });
    await tx.activity.create({ data: { userId: user.id, action: "support.created", metadata: { ticketId: ticket.id } } });
    return ticket;
  });
  return success({ ticket }, 201);
});