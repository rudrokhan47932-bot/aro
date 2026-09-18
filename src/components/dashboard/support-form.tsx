"use client";

import { useState } from "react";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Alert } from "@/components/auth/auth-parts";

export function SupportForm({ locale }: { locale: Locale }) {
  const t = dictionary(locale);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);
    const subject = String(formData.get("subject") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const result = await postJson("/api/support", { subject, message, locale });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return <Alert tone="success">{t.dashboard.ticketSent}</Alert>;
  }

  return (
    <form action={submit} className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <Field label={t.common.subject}>
        <Input name="subject" minLength={3} maxLength={160} required />
      </Field>
      <Field label={t.common.message}>
        <Textarea name="message" minLength={10} maxLength={10000} required />
      </Field>
      <div>
        <Button type="submit" disabled={busy}>
          {busy ? t.common.saving : t.common.send}
        </Button>
      </div>
    </form>
  );
}
