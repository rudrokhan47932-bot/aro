import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { PlansManager } from "@/components/admin/plans-manager";
import type { AdminData } from "@/components/dashboard/types";

export function AdminPlansView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const plans = data.plans.map((plan) => ({
    id: plan.id, slug: plan.slug, name: plan.name, description: plan.description,
    monthlyPrice: plan.monthlyPrice, yearlyPrice: plan.yearlyPrice, currency: plan.currency,
    highlighted: plan.highlighted, active: plan.active, trialDays: plan.trialDays,
    features: plan.features as unknown,
  }));

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.plans} description={t.admin.settingsDescription} />
      <SectionCard title={t.admin.plans} description={`${t.admin.currency}: BDT`}>
        <PlansManager locale={locale} plans={plans} />
      </SectionCard>
    </>
  );
}
