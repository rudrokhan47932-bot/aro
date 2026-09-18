import { createHash, randomBytes } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { Prisma } from "@prisma/client";
import { db } from "./db";

export type ErrorKey = "invalidInput" | "invalidCredentials" | "emailExists" | "emailUnavailable" | "paymentUnavailable" | "unauthorized" | "forbidden" | "tooManyRequests" | "invalidToken" | "notFound" | "conflict" | "unexpected";
export class ApiError extends Error {
  constructor(public key: ErrorKey, public status: number) { super(key); }
}
export function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
export function newToken() { return randomBytes(32).toString("hex"); }
export function hashPassword(password: string) { return hash(password, 12); }
// A fixed valid hash keeps missing-account checks on the same expensive comparison path.
const dummyHash = "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxRbBmOCXI1OLc6NCBCcBYXGr.O";
export async function verifyPassword(password: string, passwordHash: string | null | undefined) {
  const valid = await compare(password, passwordHash || dummyHash);
  return !!passwordHash && valid;
}

export function appOrigin() {
  const value = process.env.APP_URL || process.env.AUTH_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:3000");
  try {
    const url = new URL(value);
    if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (process.env.NODE_ENV === "production" ? url.protocol !== "https:" : !["http:", "https:"].includes(url.protocol))) throw new Error();
    return url.origin;
  } catch { throw new ApiError("unexpected", 503); }
}

export function assertSameOrigin(request: Request) {
  if (request.headers.get("origin") !== appOrigin()) throw new ApiError("forbidden", 403);
  const site = request.headers.get("sec-fetch-site");
  if (site && !["same-origin", "none"].includes(site)) throw new ApiError("forbidden", 403);
}

export function requestIdentity(request: Request) {
  // Only enable behind a proxy that replaces, rather than appends, this header.
  return process.env.TRUST_PROXY === "true" ? (request.headers.get("x-real-ip") || "unknown").slice(0, 100) : "shared";
}

export async function rateLimit(scope: string, identity: string, limit: number, seconds: number) {
  const now = Date.now();
  const bucket = Math.floor(now / (seconds * 1000));
  const key = digest(`${scope}:${identity}:${bucket}`);
  const record = await db.rateLimit.upsert({
    where: { key }, create: { key, count: 1, expiresAt: new Date((bucket + 1) * seconds * 1000) },
    update: { count: { increment: 1 } },
  });
  if (record.count > limit) throw new ApiError("tooManyRequests", 429);
  // Bounded cleanup; no dependence on an in-process counter or single server instance.
  const stale = await db.rateLimit.findMany({ where: { expiresAt: { lt: new Date(now) } }, select: { key: true }, take: 50 });
  if (stale.length) await db.rateLimit.deleteMany({ where: { key: { in: stale.map((r) => r.key) } } });
}

export async function consumeToken(tx: Prisma.TransactionClient, token: string, purpose: string) {
  const record = await tx.emailToken.findUnique({ where: { tokenHash: digest(token) } });
  if (!record || record.purpose !== purpose || record.expiresAt <= new Date()) throw new ApiError("invalidToken", 400);
  const deleted = await tx.emailToken.deleteMany({ where: { id: record.id, expiresAt: { gt: new Date() } } });
  if (deleted.count !== 1) throw new ApiError("invalidToken", 400);
  return record.userId;
}

export function sessionMatches(user: { sessionVersion: number } | null, version: unknown): boolean {
  return !!user && typeof version === "number" && user.sessionVersion === version;
}
