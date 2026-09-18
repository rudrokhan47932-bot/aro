"use client";

import { useState } from "react";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "./auth-parts";

export function ResetForm({ locale, token }: { locale: Locale; token: string }) {
  const t = dictionary(locale);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);
    const password = String(formData.get("password") ?? "");
    if (password.length < 12) {
      setError(errorText(locale, "invalidInput"));
      setBusy(false);
      return;
    }
    const result = await postJson("/api/password/reset", { token, password, locale });
    if (!result.ok) {
      setError(errorText(locale, result.key));
      setBusy(false);
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="grid gap-6">
        <Alert tone="success">{t.auth.resetDone}</Alert>
        <Button asChild>
          <Link href={`/${locale}/login`}>{t.auth.backLogin}</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={submit} className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <Field label={t.dashboard.newPassword}>
        <Input type="password" name="password" autoComplete="new-password" minLength={12} maxLength={72} required autoFocus />
        <span className="text-xs font-normal text-muted-foreground">{t.auth.passwordHint}</span>
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy ? t.auth.processing : t.auth.reset}
      </Button>
    </form>
  );
}
