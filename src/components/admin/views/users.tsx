import { date, dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import type { AdminData } from "@/components/dashboard/types";

function roleTone(role: string) {
  return role === "admin" ? "accent" : "muted";
}

export function AdminUsersView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const { users } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.users} description={t.admin.description} />
      <SectionCard title={t.admin.users}>
        <div className="table-wrap border-0 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.common.name}</th>
                <th>{t.common.email}</th>
                <th>{t.admin.role}</th>
                <th>{t.common.plan}</th>
                <th>{t.common.status}</th>
                <th>{t.common.date}</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name ?? "—"}</td>
                  <td className="text-muted-foreground">{user.email}</td>
                  <td><Badge variant={roleTone(user.role) as "accent" | "muted"}>{user.role}</Badge></td>
                  <td>{user.subscription?.plan?.name ?? t.dashboard.planStatus.free}</td>
                  <td>
                    <Badge variant="muted">
                      {t.dashboard.planStatus[user.subscription?.status as keyof typeof t.dashboard.planStatus] ?? t.dashboard.planStatus.free}
                    </Badge>
                  </td>
                  <td className="text-muted-foreground">{date(user.createdAt, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </>
  );
}
