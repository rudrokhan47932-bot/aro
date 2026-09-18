import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { SupportManager } from "@/components/admin/support-manager";
import type { AdminData } from "@/components/dashboard/types";

export function AdminSupportView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const tickets = data.tickets.map((ticket) => ({
    id: ticket.id, subject: ticket.subject, message: ticket.message,
    status: ticket.status, reply: ticket.reply, createdAt: ticket.createdAt, userEmail: ticket.user.email,
  }));

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.support} description={t.dashboard.supportDescription} />
      <SectionCard title={t.admin.support}>
        <SupportManager locale={locale} tickets={tickets} />
      </SectionCard>
    </>
  );
}
