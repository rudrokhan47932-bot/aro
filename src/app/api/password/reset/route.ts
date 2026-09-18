import { api, body, success, throttle } from "@/lib/server/http";
import { resetSchema } from "@/lib/server/validation";
import { resetPassword } from "@/lib/server/accounts";
export const POST = api(async (request) => {
  await throttle(request, "reset", 10);
  await resetPassword(await body(request, resetSchema));
  return success();
});
