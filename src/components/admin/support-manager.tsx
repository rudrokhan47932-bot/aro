"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { date, dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Textarea, Alert } from "@/components/auth/auth-parts";
import { Badge } from "@/components/ui/badge";

export type TicketRow = {
  id: string; subject: string; message: string; status: string; reply: string | null;
  createdAt: Date; userEmail: string;
};

const STATUSES = ["open", "in_progress", "resolved", "closed"] as const;

export function SupportManager({ locale, tickets }: { locale: Locale; tickets: TicketRow[] }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function reply(ticket: TicketRow, nextStatus?: string) {
    setBusy(true);
    setError(null);
    const result = await postJson("/api/admin", {
      resource: "tickets", action: "update", id: ticket.id,
      ...(drafts[ticket.id]?.trim() ? { reply: drafts[ticket.id] } : {}),
      ...(nextStatus ? { status: nextStatus } : {}),
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    setDrafts((current) => { const next = { ...current }; delete next[ticket.id]; return next; });
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      {error && <Alert>{error}</Alert>}
      {tickets.length === 0 ? (
        <p className="rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-muted-foreground">{t.admin.noData}</p>
      ) : (
        <div className="grid gap-4">
          {tickets.map((ticket) => {
            const statusLabel = ticket.status === "in_progress" ? t.common.pending : t.common[ticket.status as keyof typeof t.common] ?? ticket.status;
            const statusVariant = ticket.status === "open" ? "accent" : ticket.status === "in_progress" ? "warning" : ticket.status === "resolved" ? "success" : "muted";
            return (
              <div key={ticket.id} className="surface p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold">{ticket.subject}</h3>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{ticket.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      aria-label={t.admin.statusChange}
                      value={ticket.status}
                      onChange={(event) => reply(ticket, event.target.value)}
                      className="h-9 rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:border-[var(--accent)]"
                    >
                      {STATUSES.map((option) => (
                        <option key={option} value={option}>
                          {option === "in_progress" ? t.common.pending : t.common[option as keyof typeof t.common] ?? option}
                        </option>
                      ))}
                    </select>
                    <Badge variant={statusVariant as "accent" | "warning" | "success" | "muted"}>{statusLabel}</Badge>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{ticket.message}</p>
                <p className="mt-2 text-xs text-muted-foreground/80">{date(ticket.createdAt, locale)}</p>
                {ticket.reply && (
                  <div className="mt-4 rounded-xl bg-[var(--muted)] p-4">
                    <p className="mb-1 text-xs font-semibold text-muted-foreground">{t.common.reply}</p>
                    <p className="whitespace-pre-line text-sm leading-6">{ticket.reply}</p>
                  </div>
                )}
                <div className="mt-5 grid gap-3">
                  <Textarea
                    placeholder={t.admin.replyPlaceholder}
                    value={drafts[ticket.id] ?? ""}
                    onChange={(event) => setDrafts((current) => ({ ...current, [ticket.id]: event.target.value }))}
                  />
                  <div className="flex justify-end">
                    <Button onClick={() => reply(ticket)} disabled={busy || !drafts[ticket.id]?.trim()}>
                      <Send className="size-4" />
                      {t.common.reply}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
