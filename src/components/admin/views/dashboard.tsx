import Link from "next/link";
import { CircleDollarSign, CreditCard, LifeBuoy, Sparkles, Users } from "lucide-react";
import { date, dictionary, money, type Locale } from "@/lib/i18n";
import { PageHeading, Stat, EmptyState, SectionCard } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminData } from "@/components/dashboard/types";

export function AdminDashboardView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const { users, tickets, activities, summary } = data;
  const openTickets = tickets.filter((ticket) => ticket.status === "open" || ticket.status === "in_progress");

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.title} description={t.admin.description} />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label={t.admin.totalUsers} value={String(summary.totalUsers)} icon={Users} hint={t.dashboard.memberSince} />
        <Stat label={t.admin.paidSubscriptions} value={String(summary.activeSubscriptions)} icon={CreditCard} hint={`${t.admin.subscriptions}: ${summary.totalSubscriptions}`} />
        <Stat label={t.admin.revenueTotal} value={money(summary.totalRevenue, locale, summary.currency)} icon={CircleDollarSign} hint={t.admin.revenueNote} />
        <Stat label={t.admin.openTickets} value={String(openTickets.length)} icon={LifeBuoy} hint={`${t.dashboard.planStatus.active}: ${summary.monthlyRecurringRevenue > 0 ? money(summary.monthlyRecurringRevenue, locale, summary.currency) : t.admin.noRevenue}`} />
      </div>

      {users.length === 0 ? (
        <EmptyState icon={Sparkles} title={t.admin.noData} description={t.admin.noDataDescription} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <SectionCard title={t.admin.users} action={
            <Button variant="ghost" size="sm" asChild><Link href={`/${locale}/admin/users`}>{t.common.viewAll}</Link></Button>
          }>
            <ul className="grid gap-1">
              {users.slice(0, 6).map((user) => (
                <li key={user.id} className="flex items-center justify-between gap-3 border-b border-border py-3 last:border-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--muted)] text-xs font-bold text-[var(--accent)]">
                      {(user.name?.[0] ?? user.email[0] ?? "?").toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{user.name ?? user.email}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="muted">{user.role}</Badge>
                    <span className="text-xs text-muted-foreground">{date(user.createdAt, locale)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title={t.admin.support} action={
            <Button variant="ghost" size="sm" asChild><Link href={`/${locale}/admin/support`}>{t.common.viewAll}</Link></Button>
          }>
            {tickets.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.noData}</p>
            ) : (
              <ul className="grid gap-3">
                {tickets.slice(0, 5).map((ticket) => (
                  <li key={ticket.id} className="flex items-center justify-between gap-3 rounded-xl border border-border p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{ticket.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">{ticket.user.email}</p>
                    </div>
                    <Badge variant={ticket.status === "open" ? "warning" : ticket.status === "resolved" ? "success" : "muted"}>
                      {ticket.status === "in_progress" ? t.common.pending : t.common[ticket.status as keyof typeof t.common] ?? ticket.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard title={t.dashboard.recentActivity} className="lg:col-span-2">
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t.admin.noData}</p>
            ) : (
              <ul className="grid gap-1">
                {activities.slice(0, 8).map((activity) => (
                  <li key={activity.id} className="flex items-center justify-between gap-3 border-b border-border py-2.5 last:border-0">
                    <span className="text-sm">{activity.action}</span>
                    <span className="flex items-center gap-3 text-xs text-muted-foreground">
                      {activity.user?.email && <span>{activity.user.email}</span>}
                      <time>{date(activity.createdAt, locale)}</time>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </div>
      )}
    </>
  );
}
