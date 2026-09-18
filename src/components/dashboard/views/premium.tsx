import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/button";
import { PremiumTools, LockedTools } from "@/components/dashboard/premium-tools";
import type { MemberData } from "@/components/dashboard/types";

export function PremiumView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { subscription, user } = data;
  const entitled = Boolean(subscription && subscription.status !== "free" && subscription.status !== "expired");

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.premium} description={t.dashboard.premiumDescription} />
      {entitled ? (
        <PremiumTools locale={locale} />
      ) : (
        <div className="grid gap-6">
          {!user.emailVerified && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[rgb(202_138_4/0.35)] bg-[rgb(202_138_4/0.08)] px-5 py-4">
              <p className="flex items-center gap-2 text-sm font-medium text-[var(--warning)]">
                <LockKeyhole className="size-4" />
                {t.dashboard.verifyNotice}
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/${locale}/verify-email`}>{t.auth.resend}</Link>
              </Button>
            </div>
          )}
          <SectionCard title={t.dashboard.locked} description={t.dashboard.freeDesc}>
            <LockedTools locale={locale} cta={t.dashboard.locked} />
            <div className="mt-6 flex justify-center">
              <Button asChild>
                <Link href={`/${locale}/dashboard/subscription`}>
                  {t.dashboard.viewPlans}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </SectionCard>
        </div>
      )}
    </>
  );
}
