import { api, success } from "@/lib/server/http";
import { ApiError } from "@/lib/server/security";
import { processStripeEvent, verifyStripeEvent } from "@/lib/server/payments/webhook";
export const runtime = "nodejs";
export const POST = api(async (request) => {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("invalidInput", 400);
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.byteLength;
      if (size > 1_048_576) { await reader.cancel(); throw new ApiError("invalidInput", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const event = verifyStripeEvent(Buffer.concat(chunks).toString("utf8"), request.headers.get("stripe-signature"));
  return success(await processStripeEvent(event));
}, { origin: false });