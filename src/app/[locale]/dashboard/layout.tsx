import { dictionary, type Locale } from "@/lib/i18n";
import { requireUser } from "@/lib/server/auth";
import { db } from "@/lib/server/db";
import { DashboardShell } from "@/components/dashboard/shell";

export default async function DashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await (params as Promise<{ locale: Locale }>);
  const user = await requireUser(locale);
  const t = dictionary(locale);
  const [unread, subscription] = await db.$transaction([
    db.notification.count({ where: { userId: user.id, readAt: null } }),
    db.subscription.findUnique({ where: { userId: user.id }, select: { status: true, plan: { select: { name: true } } } }),
  ]);
  const member = user.role === "admin";
  const nav = [
    { href: `/${locale}/dashboard`, label: t.dashboard.overview, icon: "layout" },
    { href: `/${locale}/dashboard/subscription`, label: t.dashboard.subscription, icon: "credit" },
    { href: `/${locale}/dashboard/billing`, label: t.dashboard.billing, icon: "receipt" },
    { href: `/${locale}/dashboard/usage`, label: t.dashboard.usage, icon: "gauge" },
    { href: `/${locale}/dashboard/premium`, label: t.dashboard.premium, icon: "sparkles" },
  ] as const;
  const settings = [
    { href: `/${locale}/dashboard/account`, label: t.dashboard.account, icon: "user" },
    { href: `/${locale}/dashboard/security`, label: t.dashboard.security, icon: "shield" },
    { href: `/${locale}/dashboard/notifications`, label: t.dashboard.notifications, icon: "bell", count: unread },
    { href: `/${locale}/dashboard/support`, label: t.dashboard.support, icon: "chat" },
  ] as const;

  return (
    <DashboardShell
      locale={locale}
      name={user.name ?? ""}
      email={user.email}
      planName={subscription?.plan?.name ?? null}
      status={subscription?.status ?? "free"}
      planStatusCopy={t.dashboard.planStatus}
      nav={nav as unknown as { href: string; label: string; icon: string; count?: number }[]}
      settings={settings as unknown as { href: string; label: string; icon: string; count?: number }[]}
      member={member}
      workspaceLabel={t.dashboard.workspace}
      settingsLabel={t.dashboard.settings}
      adminLabel={t.dashboard.admin}
      logoutLabel={t.nav.logout}
      menuLabel={t.nav.menu}
      closeLabel={t.nav.close}
    >
      {children}
    </DashboardShell>
  );
}
