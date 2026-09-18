import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { NotificationsList, type NotificationItem } from "@/components/dashboard/notifications-list";
import type { MemberData } from "@/components/dashboard/types";

export function NotificationsView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const items = data.notifications.map((item) => ({
    id: item.id, title: item.title, message: item.message, readAt: item.readAt, createdAt: item.createdAt,
  })) as NotificationItem[];

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.notifications} description={t.dashboard.notificationsDescription} />
      <SectionCard title={t.dashboard.notifications}>
        <NotificationsList locale={locale} items={items} />
      </SectionCard>
    </>
  );
}
