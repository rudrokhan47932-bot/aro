import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { emailSchema, passwordSchema } from "../src/lib/server/validation";

const prisma = new PrismaClient();
async function main() {
  const plans = [
    { id: "starter", name: "Starter", description: "Essential tools for getting started.", monthlyPrice: 49900, yearlyPrice: 499000, highlighted: false, features: ["Core member tools", "100 MB storage", "Email support"] },
    { id: "professional", name: "Professional", description: "More room for growing teams and ambitious work.", monthlyPrice: 99900, yearlyPrice: 999000, highlighted: true, features: ["All core tools", "1 GB storage", "Priority support"] },
    { id: "premium", name: "Premium", description: "Full access and dedicated support.", monthlyPrice: 199900, yearlyPrice: 1999000, highlighted: false, features: ["Full member access", "10 GB storage", "Dedicated support"] },
  ];
  for (const plan of plans) await prisma.plan.upsert({ where: { id: plan.id }, update: {}, create: { ...plan, slug: plan.id, currency: "BDT", trialDays: 0 } });
  if (process.env.ADMIN_EMAIL || process.env.ADMIN_PASSWORD) {
    const email = emailSchema.parse(process.env.ADMIN_EMAIL);
    const password = passwordSchema.parse(process.env.ADMIN_PASSWORD);
    // Explicit bootstrap only. Never promote an existing account or reset its password on re-seed.
    await prisma.user.upsert({ where: { email }, update: {}, create: { email, name: "Administrator", role: "admin", emailVerified: new Date(), passwordHash: await hash(password, 12), subscription: { create: {} }, usage: { create: {} } } });
  }
}
main().catch(() => { process.stderr.write("Seed failed. Check database and bootstrap configuration.\n"); process.exitCode = 1; }).finally(() => prisma.$disconnect());
