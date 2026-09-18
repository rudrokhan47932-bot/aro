import { z } from "zod";
import { api, apiUser, body, success } from "@/lib/server/http";
import { passwordSchema } from "@/lib/server/validation";
import { rateLimit } from "@/lib/server/security";
import { changePassword } from "@/lib/server/accounts";
export const POST = api(async (request) => {
  const user = await apiUser();
  await rateLimit("change-password", user.id, 5, 900);
  const input = await body(request, z.object({ currentPassword: z.string().min(1).max(72), password: passwordSchema }).strict());
  await changePassword(user.id, input.currentPassword, input.password);
  return success({ reauthenticate: true });
});