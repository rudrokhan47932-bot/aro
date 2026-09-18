import { Prisma } from "@prisma/client";
import { db } from "./db";
import { ApiError, consumeToken, hashPassword, verifyPassword } from "./security";
import { ensureEmailAvailable, issueEmailToken } from "./email";
import { passwordSchema, registerSchema, resetSchema } from "./validation";
import { z } from "zod";

export async function register(input: z.infer<typeof registerSchema>) {
  input = registerSchema.parse(input);
  ensureEmailAvailable();
  const passwordHash = await hashPassword(input.password);
  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.create({ data: { name: input.name, email: input.email, passwordHash,
        subscription: { create: {} }, usage: { create: {} },
        activities: { create: { action: "account.created" } },
        notifications: { create: { title: "Welcome to Aro", message: "Verify your email to activate paid subscriptions." } },
      } });
      await issueEmailToken(tx, user, "verify", input.locale);
    }, { timeout: 15000 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ApiError("emailExists", 409);
    throw error;
  }
}

export async function resetPassword(input: z.infer<typeof resetSchema>) {
  input = resetSchema.parse(input);
  const passwordHash = await hashPassword(input.password);
  await db.$transaction(async (tx) => {
    const userId = await consumeToken(tx, input.token, "reset");
    await tx.user.update({ where: { id: userId }, data: { passwordHash, sessionVersion: { increment: 1 } } });
    await tx.emailToken.deleteMany({ where: { userId, purpose: "reset" } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.activity.create({ data: { userId, action: "password.reset" } });
  });
}

export async function changePassword(userId: string, currentPassword: string, password: string) {
  passwordSchema.parse(password);
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !await verifyPassword(currentPassword, user.passwordHash)) throw new ApiError("invalidCredentials", 400);
  const passwordHash = await hashPassword(password);
  await db.$transaction(async (tx) => {
    const updated = await tx.user.updateMany({ where: { id: userId, sessionVersion: user.sessionVersion }, data: { passwordHash, sessionVersion: { increment: 1 } } });
    if (!updated.count) throw new ApiError("conflict", 409);
    await tx.emailToken.deleteMany({ where: { userId, purpose: "reset" } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.activity.create({ data: { userId, action: "password.changed" } });
  });
}
