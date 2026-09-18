import { api, apiUser, body, success } from "@/lib/server/http";
import { adminSchema } from "@/lib/server/validation";
import { rateLimit } from "@/lib/server/security";
import { mutateAdmin } from "@/lib/server/admin";
export const POST = api(async (request) => {
  const user = await apiUser(true);
  await rateLimit("admin", user.id, 60, 900);
  return success(await mutateAdmin(user.id, await body(request, adminSchema)));
});
