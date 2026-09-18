import { Boxes, Database } from "lucide-react";
import { dictionary, number, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard, Progress } from "@/components/dashboard/ui";
import type { MemberData } from "@/components/dashboard/types";

function volume(megabytes: number): string {
  if (megabytes >= 1000) {
    const gb = megabytes / 1000;
    return `${gb % 1 === 0 ? gb.toFixed(0) : gb.toFixed(1)} GB`;
  }
  return `${megabytes} MB`;
}

export function UsageView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { usage } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.usage} description={t.dashboard.usageDescription} />
      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title={t.dashboard.toolsUsed} description={t.dashboard.resetUsage}>
          <Progress
            value={usage.toolsUsed}
            max={usage.toolsLimit}
            display={`${number(usage.toolsUsed, locale)} / ${number(usage.toolsLimit, locale)}`}
          />
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Boxes className="size-4 text-[var(--accent)]" />
            {t.pricing.planFeatures[0][0]}
          </p>
        </SectionCard>
        <SectionCard title={t.dashboard.storage} description={t.dashboard.resetUsage}>
          <Progress
            value={usage.storageUsed}
            max={usage.storageLimit}
            display={`${volume(usage.storageUsed)} / ${volume(usage.storageLimit)}`}
          />
          <p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <Database className="size-4 text-[var(--accent)]" />
            {t.pricing.planFeatures[0][1]}
          </p>
        </SectionCard>
      </div>
    </>
  );
}
