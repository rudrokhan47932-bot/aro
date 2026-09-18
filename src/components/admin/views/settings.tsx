import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { SettingsForm } from "@/components/admin/settings-form";
import type { AdminData } from "@/components/dashboard/types";

export function AdminSettingsView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const entries = new Map(data.settings.map((setting) => [setting.key, setting.value]));
  const brand = entries.get("brand") ?? "Aro";
  const supportEmail = entries.get("supportEmail") ?? process.env.EMAIL_FROM ?? "";

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.settings} description={t.admin.settingsDescription} />
      <SectionCard title={t.admin.settings}>
        <SettingsForm locale={locale} brand={brand} supportEmail={supportEmail} />
      </SectionCard>
    </>
  );
}
