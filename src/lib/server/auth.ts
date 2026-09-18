import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "./db";
import { emailSchema, localeSchema } from "./validation";
import { rateLimit, requestIdentity, sessionMatches, verifyPassword } from "./security";

const credentialSchema = z.object({ email: emailSchema, password: z.string().min(1).max(72) });
const providers = [Credentials({
  credentials: { email: { type: "email" }, password: { type: "password" } },
  async authorize(credentials, request) {
    const parsed = credentialSchema.safeParse(credentials);
    if (!parsed.success) return null;
    await rateLimit("login-ip", requestIdentity(request), 100, 900);
    await rateLimit("login-email", parsed.data.email, 10, 900);
    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!await verifyPassword(parsed.data.password, user?.passwordHash)) return null;
    return user && { id: user.id, email: user.email, name: user.name, image: user.image };
  },
})];

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db), session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  providers: [ ...providers, ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET ? [Google({
    clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET,
    // Keep Auth.js's default explicit-account-linking protection.
  })] : []) ],
  callbacks: {
    async signIn({ account, profile }) {
      return account?.provider !== "google" || profile?.email_verified === true;
    },
    async jwt({ token, user }) {
      const id = user?.id || token.sub;
      if (!id) return null;
      const current = await db.user.findUnique({ where: { id }, select: { id: true, role: true, sessionVersion: true } });
      if (!current || (!user && !sessionMatches(current, token.sessionVersion))) return null;
      token.sub = current.id; token.role = current.role; token.sessionVersion = current.sessionVersion;
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = typeof token.role === "string" ? token.role : "user";
      session.user.sessionVersion = typeof token.sessionVersion === "number" ? token.sessionVersion : -1;
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      await db.$transaction([
        db.subscription.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} }),
        db.usage.upsert({ where: { userId: user.id }, create: { userId: user.id }, update: {} }),
        db.activity.create({ data: { userId: user.id, action: "account.created" } }),
      ]);
    },
    async signIn({ user, account, profile }) {
      if (user.id && account?.provider === "google" && profile?.email_verified === true) {
        await db.user.update({ where: { id: user.id }, data: { emailVerified: new Date() } });
      }
    },
  },
  logger: { error() { /* Auth.js errors may contain sensitive provider payloads. */ } },
});

export async function currentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id } });
  return sessionMatches(user, session.user.sessionVersion) ? user : null;
}
export async function requireUser(locale: string) {
  const safeLocale = localeSchema.safeParse(locale).success ? locale : "en";
  const user = await currentUser();
  if (!user) redirect(`/${safeLocale}/login`);
  return user;
}
export async function requireAdmin(locale: string) {
  const user = await requireUser(locale);
  if (user.role !== "admin") redirect(`/${localeSchema.safeParse(locale).success ? locale : "en"}/unauthorized`);
  return user;
}
