import { Badge } from "@/components/ui/badge";
import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { PasswordForm } from "@/components/dashboard/password-form";
import type { MemberData } from "@/components/dashboard/types";

export function SecurityView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { user } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.security} description={t.dashboard.securityDescription} />
      <div className="grid gap-6">
        <SectionCard title={t.dashboard.passwordSecurity} description={t.dashboard.passwordDescription}>
          <PasswordForm locale={locale} />
        </SectionCard>
        <SectionCard title={t.dashboard.emailVerified}>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? t.dashboard.emailVerified : t.dashboard.emailUnverified}
            </Badge>
          </div>
        </SectionCard>
      </div>
    </>
  );
}
