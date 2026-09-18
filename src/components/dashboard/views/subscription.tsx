import { CircleAlert, CreditCard } from "lucide-react";
import { date, dictionary, money, type Locale } from "@/lib/i18n";
import { getPublicPlans } from "@/lib/server/data";
import { PageHeading, SectionCard, PlanStatusBadge, EmptyState } from "@/components/dashboard/ui";
import { PlanPicker } from "@/components/dashboard/plan-picker";
import { PlanStatusActions } from "@/components/dashboard/plan-status-actions";
import type { MemberData } from "@/components/dashboard/types";

export async function SubscriptionView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { user, subscription } = data;
  const plans = await getPublicPlans();
  const paid = subscription && subscription.status !== "free" && subscription.status !== "expired";
  const plan = subscription?.plan ?? null;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.subscription} description={t.dashboard.planDescription} />

      {!user.emailVerified && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgb(202_138_4/0.35)] bg-[rgb(202_138_4/0.08)] px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--warning)]">
            <CircleAlert className="size-4" />
            {t.dashboard.verifyNotice}
          </p>
        </div>
      )}

      <div className="mb-8">
        <SectionCard
          title={t.dashboard.currentPlan}
          description={subscription && subscription.cancelAtPeriodEnd ? t.dashboard.cancelledNotice : t.dashboard.planDescription}
          action={subscription ? <PlanStatusBadge status={subscription.status} label={t.dashboard.planStatus[subscription.status as keyof typeof t.dashboard.planStatus] ?? subscription.status} /> : undefined}
        >
          {!paid ? (
            <EmptyState icon={CreditCard} title={t.dashboard.planStatus.free} description={t.dashboard.freeDesc} />
          ) : subscription ? (
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div className="grid gap-1">
                <p className="text-xl font-bold">{plan?.name ?? subscription.status}</p>
                <p className="text-sm text-muted-foreground">
                  {money(subscription.unitAmount, locale, subscription.currency)} /{" "}
                  {subscription.billingCycle === "yearly" ? t.common.yearly : t.common.monthly}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {subscription.currentPeriodStart && date(subscription.currentPeriodStart, locale)}
                  {" — "}
                  {subscription.currentPeriodEnd && date(subscription.currentPeriodEnd, locale)}
                </p>
              </div>
              <PlanStatusActions locale={locale} status={subscription.status} cancelAtPeriodEnd={subscription.cancelAtPeriodEnd} />
            </div>
          ) : null}
        </SectionCard>
      </div>

      <PageHeading title={t.pricing.compare} description={t.pricing.comparisonDescription} />
      <PlanPicker
        locale={locale}
        plans={plans}
        currentPlanId={plan?.id ?? null}
        currentPlanActive={Boolean(paid)}
        emailVerified={Boolean(user.emailVerified)}
      />
    </>
  );
}
