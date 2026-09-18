"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { cn } from "@/lib/utils";

const STATUSES = ["free", "trial", "active", "past_due", "cancelled", "expired"] as const;

export function SubscriptionStatusControl({ locale, id, status }: { locale: Locale; id: string; status: string }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const labels = t.dashboard.planStatus;

  async function change(next: string) {
    if (next === status) return;
    setBusy(true);
    setError(null);
    const result = await postJson("/api/admin", { resource: "subscriptions", action: "update", id, status: next });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    router.refresh();
  }

  return (
    <span className="grid gap-1">
      <select
        aria-label={t.admin.statusChange}
        value={status}
        disabled={busy}
        onChange={(event) => change(event.target.value)}
        className={cn("h-8 rounded-lg border border-border bg-background px-2 text-xs font-medium outline-none focus:border-[var(--accent)] disabled:opacity-50",
          status === "active" || status === "trial" ? "text-[var(--success)]" : "text-muted-foreground")}
      >
        {STATUSES.map((option) => (
          <option key={option} value={option}>{labels[option] ?? option}</option>
        ))}
      </select>
      {error && <span className="block max-w-48 text-[11px] leading-4 text-[var(--error)]">{error}</span>}
    </span>
  );
}
