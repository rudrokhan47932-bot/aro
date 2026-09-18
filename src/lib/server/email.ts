import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ApiError, appOrigin, digest, newToken } from "./security";
import type { Prisma } from "@prisma/client";

export function ensureEmailAvailable() {
  appOrigin();
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) return;
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "test") throw new ApiError("emailUnavailable", 503);
}
async function deliver(to: string, subject: string, text: string, deliveryId: string) {
  ensureEmailAvailable();
  if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": deliveryId },
        body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [to], subject, text }), signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) throw new Error();
    } catch { throw new ApiError("emailUnavailable", 503); }
  } else {
    // Never place mail in public/, return it from APIs, or log token-bearing URLs.
    const directory = path.join(process.cwd(), ".outbox");
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(path.join(directory, `${deliveryId}.json`), JSON.stringify({ to, subject, text }), { mode: 0o600, flag: "wx" });
  }
}

export async function issueEmailToken(tx: Prisma.TransactionClient, user: { id: string; email: string }, purpose: "verify" | "reset", locale: "en" | "bn") {
  const token = newToken();
  await tx.emailToken.deleteMany({ where: { userId: user.id, OR: [{ purpose }, { expiresAt: { lt: new Date() } }] } });
  await tx.emailToken.create({ data: { userId: user.id, purpose, tokenHash: digest(token), expiresAt: new Date(Date.now() + (purpose === "verify" ? 86_400_000 : 3_600_000)) } });
  const route = purpose === "verify" ? "verify-email" : "reset-password";
  const link = `${appOrigin()}/${locale}/${route}?token=${token}`;
  const subject = locale === "bn" ? (purpose === "verify" ? "Aro ইমেইল যাচাই করুন" : "Aro পাসওয়ার্ড পরিবর্তন করুন") : (purpose === "verify" ? "Verify your Aro email" : "Reset your Aro password");
  const message = locale === "bn" ? `এই লিঙ্কটি একবার ব্যবহার করা যাবে। আপনি অনুরোধ না করলে উপেক্ষা করুন।\n\n${link}` : `Use this link once to ${purpose === "verify" ? "verify your email" : "reset your password"}. If you did not request this, ignore this email.\n\n${link}`;
  await deliver(user.email, subject, message, digest(token));
}
