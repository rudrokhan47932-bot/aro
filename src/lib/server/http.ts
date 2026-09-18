import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ApiError, assertSameOrigin, rateLimit, requestIdentity } from "./security";
import { currentUser } from "./auth";

export function success(data: Record<string, unknown> = {}, status = 200) {
  return Response.json({ ok: true, ...data }, { status, headers: { "Cache-Control": "no-store" } });
}
export function api(handler: (request: Request) => Promise<Response>, options: { origin?: boolean } = {}) {
  return async (request: Request) => {
    try {
      if (options.origin !== false) assertSameOrigin(request);
      return await handler(request);
    } catch (error) {
      let key = "unexpected", status = 500;
      if (error instanceof ApiError) { key = error.key; status = error.status; }
      else if (error instanceof z.ZodError || error instanceof SyntaxError) { key = "invalidInput"; status = 400; }
      else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") { key = "conflict"; status = 409; }
        if (error.code === "P2025") { key = "notFound"; status = 404; }
      }
      return Response.json({ error: key }, { status, headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) } });
    }
  };
}
export async function body<T extends z.ZodType>(request: Request, schema: T): Promise<z.output<T>> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) throw new ApiError("invalidInput", 415);
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("invalidInput", 400);
  const chunks: Uint8Array[] = []; let bytes = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      bytes += value.byteLength;
      if (bytes > 32_768) { await reader.cancel(); throw new ApiError("invalidInput", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return schema.parse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
}
export async function apiUser(admin = false) {
  const user = await currentUser();
  if (!user) throw new ApiError("unauthorized", 401);
  if (admin && user.role !== "admin") throw new ApiError("forbidden", 403);
  return user;
}
export async function throttle(request: Request, scope: string, limit = 10, seconds = 900) {
  await rateLimit(scope, requestIdentity(request), limit, seconds);
}
