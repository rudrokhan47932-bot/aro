import { date, dictionary, money, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard, EmptyState } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import { ReceiptText } from "lucide-react";
import type { AdminData } from "@/components/dashboard/types";

function tone(status: string): "success" | "warning" | "error" | "muted" {
  if (status === "paid") return "success";
  if (status === "pending") return "warning";
  if (status === "failed" || status === "refunded") return "error";
  return "muted";
}

export function AdminTransactionsView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const { transactions } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.transactions} description={t.admin.revenueNote} />
      <SectionCard title={t.admin.transactions}>
        {transactions.length === 0 ? (
          <EmptyState icon={ReceiptText} title={t.admin.noRevenue} />
        ) : (
          <div className="table-wrap border-0 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.common.date}</th>
                  <th>{t.common.email}</th>
                  <th>{t.common.description}</th>
                  <th>{t.common.amount}</th>
                  <th>{t.admin.provider}</th>
                  <th>{t.common.status}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{date(transaction.createdAt, locale)}</td>
                    <td className="max-w-52 truncate text-muted-foreground">{transaction.user.email}</td>
                    <td className="max-w-64 truncate text-muted-foreground">{transaction.description}</td>
                    <td className="font-semibold">{money(transaction.amount, locale, transaction.currency)}</td>
                    <td className="text-muted-foreground">{transaction.provider}</td>
                    <td><Badge variant={tone(transaction.status)}>{t.common[transaction.status as keyof typeof t.common] ?? transaction.status}</Badge></td>
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
