import { Badge } from "@/components/ui/badge";
import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { AccountForm } from "@/components/dashboard/account-form";
import type { MemberData } from "@/components/dashboard/types";

export function AccountView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { user } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.account} description={t.dashboard.accountDescription} />
      <SectionCard title={t.dashboard.account}>
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-12 place-items-center rounded-2xl bg-[var(--accent)]/12 font-bold text-[var(--accent)]">
              {(user.name?.[0] ?? user.email[0] ?? "A").toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold">{user.email}</p>
              <p className="text-xs text-muted-foreground">
                {t.common.role}: {user.role}
              </p>
            </div>
            <Badge variant={user.emailVerified ? "success" : "warning"}>
              {user.emailVerified ? t.dashboard.emailVerified : t.dashboard.emailUnverified}
            </Badge>
          </div>
          <AccountForm locale={locale} initialName={user.name ?? ""} />
        </div>
      </SectionCard>
    </>
  );
}
