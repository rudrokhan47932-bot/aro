import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dictionary, type Locale } from "@/lib/i18n";
import { requireAdmin } from "@/lib/server/auth";
import { getAdminData } from "@/lib/server/data";
import { AdminDashboardView } from "@/components/admin/views/dashboard";
import { AdminUsersView } from "@/components/admin/views/users";
import { AdminSubscriptionsView } from "@/components/admin/views/subscriptions";
import { AdminPlansView } from "@/components/admin/views/plans";
import { AdminTransactionsView } from "@/components/admin/views/transactions";
import { AdminCouponsView } from "@/components/admin/views/coupons";
import { AdminSupportView } from "@/components/admin/views/support";
import { AdminSettingsView } from "@/components/admin/views/settings";

const VIEWS = ["dashboard", "users", "subscriptions", "plans", "transactions", "coupons", "support", "settings"] as const;
type View = (typeof VIEWS)[number];

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.dashboard.admin} | Aro` };
}

export default async function AdminPage({ params }: { params: Promise<{ locale: Locale; page?: string[] }> }) {
  const { locale, page: segments } = await params;
  const view: View = (segments?.[0] as View) ?? "dashboard";
  if (!VIEWS.includes(view)) notFound();
  await requireAdmin(locale);
  const data = await getAdminData();
  const components: Record<View, (props: { locale: Locale; data: Awaited<ReturnType<typeof getAdminData>> }) => React.ReactNode> = {
    dashboard: AdminDashboardView, users: AdminUsersView, subscriptions: AdminSubscriptionsView,
    plans: AdminPlansView, transactions: AdminTransactionsView, coupons: AdminCouponsView,
    support: AdminSupportView, settings: AdminSettingsView,
  };
  const ViewComponent = components[view];
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <ViewComponent locale={locale} data={data} />
    </div>
  );
}
