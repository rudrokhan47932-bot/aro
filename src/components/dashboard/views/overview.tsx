import Link from "next/link";
import { CheckCircle2, CircleAlert, CreditCard, LayoutGrid, LifeBuoy, Sparkles, CalendarDays } from "lucide-react";
import { date, dictionary, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { PageHeading, Stat, PlanStatusBadge, EmptyState } from "@/components/dashboard/ui";
import type { MemberData } from "@/components/dashboard/types";

const ACTIVITY_KEYS: Record<string, string> = {
  "account.created": "registered",
  "account.updated": "profile_updated",
  "password.changed": "password_updated",
  "password.reset": "password_updated",
  "email.verified": "email_verified",
  "subscription.created": "subscription_updated",
  "subscription.updated": "subscription_updated",
  "subscription.cancel_requested": "subscription_updated",
  "subscription.resume_requested": "subscription_updated",
  "support.created": "ticket_created",
};

export function OverviewView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { user, subscription, activities, usage } = data;
  const paid = subscription && subscription.status !== "free" && subscription.status !== "expired";
  const status = paid ? subscription!.status : user.emailVerified ? "free" : "free";
  const statusLabel = paid ? t.dashboard.planStatus[subscription!.status as keyof typeof t.dashboard.planStatus] : t.dashboard.planStatus.free;
  const memberSince = date(user.createdAt, locale);

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={`${t.dashboard.greeting}, ${user.name ?? ""}.`} description={t.dashboard.description} />

      {!user.emailVerified && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgb(202_138_4/0.35)] bg-[rgb(202_138_4/0.08)] px-5 py-4">
          <p className="flex items-center gap-2 text-sm font-medium text-[var(--warning)]">
            <CircleAlert className="size-4" />
            {t.dashboard.verifyNotice}
          </p>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/${locale}/verify-email`}>{t.auth.resend}</Link>
          </Button>
        </div>
      )}

      {(!paid || subscription?.status === "expired") && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-5 py-5">
          <div>
            <p className="text-sm font-semibold">{t.dashboard.freeDesc}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.dashboard.noRenewal}</p>
          </div>
          <Button size="sm" asChild>
            <Link href={`/${locale}/dashboard/subscription`}>{t.dashboard.viewPlans}</Link>
          </Button>
        </div>
      )}

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.dashboard.currentPlan} value={paid ? (subscription!.plan?.name ?? statusLabel) : t.dashboard.planStatus.free}
          hint={subscription && subscription.cancelAtPeriodEnd ? t.dashboard.cancelledNotice : memberSince}
          icon={Sparkles} />
        <Stat label={t.dashboard.accountStatus}
          value={user.emailVerified ? t.dashboard.emailVerified : t.dashboard.emailUnverified}
          icon={user.emailVerified ? CheckCircle2 : CircleAlert} />
        <Stat label={t.dashboard.toolsUsed} value={`${usage.toolsUsed} / ${usage.toolsLimit}`} icon={LayoutGrid} />
        <Stat label={t.dashboard.renewal}
          value={subscription?.currentPeriodEnd ? date(subscription.currentPeriodEnd, locale) : t.dashboard.noRenewal}
          icon={CalendarDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="surface p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">{t.dashboard.recentActivity}</h2>
            <PlanStatusBadge status={status} label={statusLabel} />
          </div>
          {activities.length === 0 ? (
            <EmptyState icon={Sparkles} title={t.dashboard.noActivity} description={t.dashboard.noActivityDesc} />
          ) : (
            <ul className="grid gap-1">
              {activities.map((activity) => {
                const key = ACTIVITY_KEYS[activity.action] ?? activity.action;
                const label = key in t.dashboard.activityLabels
                  ? t.dashboard.activityLabels[key as keyof typeof t.dashboard.activityLabels]
                  : key;
                return (
                  <li key={activity.id} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
                    <span className="text-sm">{label}</span>
                    <time className="shrink-0 text-xs text-muted-foreground">{date(activity.createdAt, locale)}</time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <aside className="surface p-6">
          <h2 className="mb-4 text-base font-semibold">{t.dashboard.quickActions}</h2>
          <div className="grid gap-2.5">
            <Button variant="outline" asChild className="justify-start"><Link href={`/${locale}/dashboard/premium`}><Sparkles className="size-4 text-[var(--accent)]" />{t.dashboard.explore}</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href={`/${locale}/dashboard/subscription`}><CreditCard className="size-4 text-[var(--accent)]" />{t.dashboard.manage}</Link></Button>
            <Button variant="outline" asChild className="justify-start"><Link href={`/${locale}/dashboard/support`}><LifeBuoy className="size-4 text-[var(--accent)]" />{t.dashboard.help}</Link></Button>
          </div>
        </aside>
      </div>
    </>
  );
}
