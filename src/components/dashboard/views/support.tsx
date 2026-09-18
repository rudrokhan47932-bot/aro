import { MessageSquareText } from "lucide-react";
import { date, dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard, EmptyState } from "@/components/dashboard/ui";
import { Badge } from "@/components/ui/badge";
import { SupportForm } from "@/components/dashboard/support-form";
import type { MemberData } from "@/components/dashboard/types";

function statusBadge(status: string, t: ReturnType<typeof dictionary>) {
  const variant: Record<string, "muted" | "accent" | "warning" | "success"> = {
    open: "accent", in_progress: "warning", resolved: "success", closed: "muted",
  };
  const label = status === "in_progress" ? t.common.pending : t.common[status as keyof typeof t.common];
  return <Badge variant={variant[status] ?? "muted"}>{label ?? status}</Badge>;
}

export function SupportView({ locale, data }: { locale: Locale; data: MemberData }) {
  const t = dictionary(locale);
  const { tickets } = data;

  return (
    <>
      <PageHeading eyebrow={t.dashboard.workspace} title={t.dashboard.support} description={t.dashboard.supportDescription} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <SectionCard title={t.dashboard.newTicket}>
          <SupportForm locale={locale} />
        </SectionCard>
        <SectionCard title={t.dashboard.yourTickets}>
          {tickets.length === 0 ? (
            <EmptyState icon={MessageSquareText} title={t.dashboard.noTickets} />
          ) : (
            <ul className="grid gap-4">
              {tickets.map((ticket) => (
                <li key={ticket.id} className="rounded-xl border border-border p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{ticket.subject}</h3>
                    {statusBadge(ticket.status, t)}
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">{ticket.message}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                    <time>{date(ticket.createdAt, locale)}</time>
                  </div>
                  {ticket.reply && (
                    <div className="mt-4 rounded-xl bg-[var(--muted)] p-4">
                      <p className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>{t.dashboard.support}</span>
                        {ticket.repliedAt && <time>{date(ticket.repliedAt, locale)}</time>}
                      </p>
                      <p className="whitespace-pre-line text-sm leading-6">{ticket.reply}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </>
  );
}
