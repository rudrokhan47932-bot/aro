import { api, body, success, throttle } from "@/lib/server/http";
import { registerSchema } from "@/lib/server/validation";
import { register } from "@/lib/server/accounts";
export const POST = api(async (request) => {
  await throttle(request, "register", 10, 3600);
  await register(await body(request, registerSchema));
  return success({}, 201);
});
