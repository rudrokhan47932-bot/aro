"use client";

import { useState } from "react";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "./auth-parts";

export function ForgotForm({ locale }: { locale: Locale }) {
  const t = dictionary(locale);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);
    const email = String(formData.get("email") ?? "").trim();
    const result = await postJson("/api/password/forgot", { email, locale });
    // Identical generic response for every submission — no account enumeration.
    if (!result.ok) setError(errorText(locale, result.key));
    setSent(true);
    setBusy(false);
  }

  if (sent) {
    return <Alert tone="success">{t.auth.checkEmail}</Alert>;
  }

  return (
    <form action={submit} className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <Field label={t.common.email}>
        <Input type="email" name="email" autoComplete="email" required autoFocus />
      </Field>
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy ? t.auth.processing : t.auth.sendReset}
      </Button>
    </form>
  );
}
