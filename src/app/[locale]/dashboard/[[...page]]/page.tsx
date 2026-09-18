import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dictionary, type Locale } from "@/lib/i18n";
import { getMemberData } from "@/lib/server/data";
import { requireUser } from "@/lib/server/auth";
import { OverviewView } from "@/components/dashboard/views/overview";
import { SubscriptionView } from "@/components/dashboard/views/subscription";
import { BillingView } from "@/components/dashboard/views/billing";
import { UsageView } from "@/components/dashboard/views/usage";
import { PremiumView } from "@/components/dashboard/views/premium";
import { AccountView } from "@/components/dashboard/views/account";
import { SecurityView } from "@/components/dashboard/views/security";
import { NotificationsView } from "@/components/dashboard/views/notifications";
import { SupportView } from "@/components/dashboard/views/support";

const VIEWS = [
  "overview", "subscription", "billing", "usage", "premium",
  "account", "security", "notifications", "support",
] as const;
type View = (typeof VIEWS)[number];

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.dashboard.workspace} | Aro` };
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: Locale; page?: string[] }> }) {
  const { locale, page: segments } = await params;
  const view: View = segments?.[0] as View ?? "overview";
  if (!VIEWS.includes(view)) notFound();
  const user = await requireUser(locale);
  const data = await getMemberData(user.id);
  const page = {
    locale, user: data.user, data,
    overview: OverviewView, subscription: SubscriptionView, billing: BillingView, usage: UsageView,
    premium: PremiumView, account: AccountView, security: SecurityView, notifications: NotificationsView,
    support: SupportView,
  }[view];
  return <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-8 sm:py-10">{page({ locale, data })}</div>;
}
