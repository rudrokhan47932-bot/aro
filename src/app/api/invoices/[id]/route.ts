import { api, apiUser } from "@/lib/server/http";
import { db } from "@/lib/server/db";
import { ApiError, rateLimit } from "@/lib/server/security";
import { idSchema } from "@/lib/server/validation";
import { safeInvoiceUrl } from "@/lib/server/payments/webhook";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return api(async () => {
    const user = await apiUser();
    await rateLimit("invoice", user.id, 60, 900);
    const id = idSchema.parse((await context.params).id);
    const invoice = await db.transaction.findFirst({ where: { id, userId: user.id } });
    if (!invoice) throw new ApiError("notFound", 404);
    const url = safeInvoiceUrl(invoice.invoiceUrl);
    if (url) return new Response(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
    const lines = ["Aro payment record", "Record: " + invoice.id, "Date: " + invoice.createdAt.toISOString(),
      "Account: " + user.email, "Description: " + invoice.description, "Status: " + invoice.status,
      "Amount: " + invoice.currency + " " + (invoice.amount / 100).toFixed(2),
      "Provider invoice: " + (invoice.providerInvoiceId || "Not available")];
    return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": 'attachment; filename="aro-invoice-' + encodeURIComponent(invoice.id) + '.txt"',
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }, { origin: false })(request);
}