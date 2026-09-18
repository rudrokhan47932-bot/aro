"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, CheckCheck } from "lucide-react";
import { date, dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/auth/auth-parts";
import { EmptyState } from "@/components/dashboard/ui";

export type NotificationItem = { id: string; title: string; message: string; readAt: Date | null; createdAt: Date };

export function NotificationsList({ locale, items }: { locale: Locale; items: NotificationItem[] }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unread = items.filter((item) => !item.readAt).length;

  async function mark(payload: { id: string } | { all: true }) {
    setBusy(true);
    setError(null);
    const result = await postJson("/api/notifications", payload);
    setBusy(false);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    router.refresh();
  }

  if (items.length === 0) {
    return <EmptyState icon={BellRing} title={t.dashboard.noNotifications} description={t.dashboard.noNotificationsDesc} />;
  }

  return (
    <div className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {unread > 0 ? `${unread} · ${t.dashboard.notificationsDescription}` : t.dashboard.noNotifications}
        </p>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={() => mark({ all: true })} disabled={busy}>
            <CheckCheck className="size-3.5" />
            {t.dashboard.markRead}
          </Button>
        )}
      </div>
      <ul className="grid gap-3">
        {items.map((item) => {
          const read = Boolean(item.readAt);
          return (
            <li key={item.id} className={`surface p-5 ${read ? "" : "border-[var(--accent)]/30 bg-[var(--accent)]/[0.03]"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {!read && <span className="mr-2 inline-block size-2 rounded-full bg-[var(--accent)] align-middle" aria-label="unread" />}
                    {item.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{item.message}</p>
                  <time className="mt-2 block text-xs text-muted-foreground/80">{date(item.createdAt, locale)}</time>
                </div>
                {!read && (
                  <Button variant="ghost" size="sm" onClick={() => mark({ id: item.id })} disabled={busy}>
                    <CheckCheck className="size-3.5" />
                    {t.common.ok}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
