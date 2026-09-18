import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: string; sessionVersion: number } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT { role?: string; sessionVersion?: number }
}
