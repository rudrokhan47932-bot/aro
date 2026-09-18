import Link from "next/link";
import { Download, ReceiptText } from "lucide-react";
import { date, dictionary, money, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard, EmptyState } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MemberData } from "@/components/dashboard/types";

function statusTone(status: string): "success" | "warning" | "error" | "muted" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "failed" || status === "refunded") return "error";
  return "muted";
}

export function BillingView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { transactions } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.billing} description={t.dashboard.billingDescription} />
      <SectionCard title={t.dashboard.billing}>
        {transactions.length === 0 ? (
          <EmptyState icon={ReceiptText} title={t.dashboard.noInvoices} description={t.dashboard.noInvoicesDesc} />
        ) : (
          <div className="table-wrap overflow-x-auto border-0">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.common.date}</th>
                  <th>{t.common.description}</th>
                  <th>{t.common.amount}</th>
                  <th>{t.common.status}</th>
                  <th>{t.dashboard.invoice}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{date(transaction.createdAt, locale)}</td>
                    <td className="max-w-56 truncate text-muted-foreground">{transaction.description}</td>
                    <td className="font-semibold">{money(transaction.amount, locale, transaction.currency)}</td>
                    <td>
                      <Badge variant={statusTone(transaction.status)}>{t.common[transaction.status as keyof typeof t.common] ?? transaction.status}</Badge>
                    </td>
                    <td>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/api/invoices/${transaction.id}`}>
                          <Download className="size-3.5" />
                          {t.common.download}
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}
