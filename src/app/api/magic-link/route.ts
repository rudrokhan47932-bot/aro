import { api, body, throttle } from "@/lib/server/http";
import { forgotSchema } from "@/lib/server/validation";
import { ApiError } from "@/lib/server/security";
// Optional extension is deliberately unavailable until a sign-in token consumer is wired.
export const POST = api(async (request) => {
  await throttle(request, "magic-link", 10);
  await body(request, forgotSchema);
  throw new ApiError("emailUnavailable", 503);
});
