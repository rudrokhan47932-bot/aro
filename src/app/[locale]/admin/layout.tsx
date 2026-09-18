import { dictionary, type Locale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { AdminShell } from "@/components/admin/shell";

export default async function AdminLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await (params as Promise<{ locale: Locale }>);
  const user = await requireAdmin(locale);
  const t = dictionary(locale);
  const admin = [
    { href: `/${locale}/admin`, label: t.admin.dashboard, icon: "dashboard" },
    { href: `/${locale}/admin/users`, label: t.admin.users, icon: "users" },
    { href: `/${locale}/admin/subscriptions`, label: t.admin.subscriptions, icon: "subscriptions" },
    { href: `/${locale}/admin/plans`, label: t.admin.plans, icon: "plans" },
    { href: `/${locale}/admin/transactions`, label: t.admin.transactions, icon: "transactions" },
    { href: `/${locale}/admin/coupons`, label: t.admin.coupons, icon: "coupons" },
    { href: `/${locale}/admin/support`, label: t.admin.support, icon: "support" },
    { href: `/${locale}/admin/settings`, label: t.admin.settings, icon: "settings" },
  ];

  return (
    <AdminShell
      locale={locale}
      email={user.email}
      items={admin}
      workspaceLabel={t.admin.title}
      memberLabel={t.dashboard.workspace}
      adminLabel={t.dashboard.admin}
      logoutLabel={t.nav.logout}
      menuLabel={t.nav.menu}
    >
      {children}
    </AdminShell>
  );
}
