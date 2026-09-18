"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/auth/auth-parts";

export function PlanStatusActions({ locale, status, cancelAtPeriodEnd }: { locale: Locale; status: string; cancelAtPeriodEnd: boolean }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(action: "portal" | "cancel" | "resume") {
    setBusy(action);
    setError(null);
    if (action === "cancel" && !window.confirm(t.dashboard.cancelConfirm)) {
      setBusy(null);
      return;
    }
    const result = await postJson<{ url?: string }>("/api/subscription", { action, locale });
    if (!result.ok) {
      setError(errorText(locale, result.key));
      setBusy(null);
      return;
    }
    if (action === "cancel" || action === "resume") {
      router.refresh();
      return;
    }
    if (result.data.url) window.location.assign(result.data.url);
  }

  const live = status === "active" || status === "trial";
  return (
    <div className="grid gap-3 sm:justify-items-end">
      {error && <Alert>{error}</Alert>}
      <div className="flex flex-wrap gap-3 sm:justify-end">
        {live && !cancelAtPeriodEnd && (
          <>
            <Button variant="outline" onClick={() => run("portal")} disabled={busy !== null}>
              {busy === "portal" ? t.common.loading : t.dashboard.portal}
            </Button>
            <Button variant="outline" onClick={() => run("cancel")} disabled={busy !== null}>
              {busy === "cancel" ? t.common.loading : t.dashboard.cancel}
            </Button>
          </>
        )}
        {live && cancelAtPeriodEnd && (
          <>
            <Button variant="outline" onClick={() => run("portal")} disabled={busy !== null}>
              {busy === "portal" ? t.common.loading : t.dashboard.portal}
            </Button>
            <Button onClick={() => run("resume")} disabled={busy !== null}>
              {busy === "resume" ? t.common.loading : t.dashboard.resume}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
