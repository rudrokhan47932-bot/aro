import { PrismaClient } from "@prisma/client";

const globalDb = globalThis as unknown as { aroDb?: PrismaClient };
export const db = globalDb.aroDb ?? new PrismaClient({ datasourceUrl: process.env.DATABASE_URL || "file:./dev.db" });
if (process.env.NODE_ENV !== "production") globalDb.aroDb = db;
