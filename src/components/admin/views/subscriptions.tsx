import { date, dictionary, money, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard, EmptyState } from "@/components/dashboard/ui";
import { CreditCard } from "lucide-react";
import { SubscriptionStatusControl } from "@/components/admin/subscription-status";
import type { AdminData } from "@/components/dashboard/types";

export function AdminSubscriptionsView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const { subscriptions } = data;
  const paid = subscriptions.filter((subscription) => subscription.status !== "free" && subscription.status !== "expired");

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.subscriptions} description={t.admin.description} />
      <SectionCard title={`${t.admin.subscriptions} (${paid.length})`}>
        {subscriptions.length === 0 ? (
          <EmptyState icon={CreditCard} title={t.admin.noData} description={t.admin.noDataDescription} />
        ) : (
          <div className="table-wrap border-0 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t.common.email}</th>
                  <th>{t.common.plan}</th>
                  <th>{t.common.status}</th>
                  <th>{t.common.cycle}</th>
                  <th>{t.common.amount}</th>
                  <th>{t.admin.periodEnd}</th>
                  <th>{t.admin.provider}</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="max-w-52 truncate text-muted-foreground">{subscription.user.email}</td>
                    <td className="font-medium">{subscription.plan?.name ?? t.dashboard.planStatus.free}</td>
                    <td>
                      <SubscriptionStatusControl locale={locale} id={subscription.id} status={subscription.status} />
                    </td>
                    <td className="capitalize">{subscription.billingCycle}</td>
                    <td className="font-semibold">{money(subscription.unitAmount, locale, subscription.currency)}</td>
                    <td className="text-muted-foreground">
                      {subscription.currentPeriodEnd ? date(subscription.currentPeriodEnd, locale) : "—"}
                      {subscription.cancelAtPeriodEnd && <span className="ml-1.5 text-xs text-[var(--warning)]">↷</span>}
                    </td>
                    <td className="text-muted-foreground">{subscription.provider ?? "—"}</td>
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
