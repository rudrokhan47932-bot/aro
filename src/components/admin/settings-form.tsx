"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "@/components/auth/auth-parts";

export function SettingsForm({ locale, brand, supportEmail }: { locale: Locale; brand: string; supportEmail: string }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [form, setForm] = useState({ brand, supportEmail });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function save(key: "brand" | "supportEmail") {
    setBusy(true);
    setMessage(null);
    const result = await postJson("/api/admin", { resource: "settings", action: "update", key, value: form[key].trim() });
    setBusy(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: errorText(locale, result.key) });
      return;
    }
    setMessage({ tone: "success", text: t.common.saved });
    router.refresh();
  }

  return (
    <div className="grid max-w-md gap-5">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Field label={t.admin.brand}>
        <Input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} maxLength={120} />
        <Button type="button" size="sm" className="mt-3 w-fit" disabled={busy || form.brand.trim() === brand} onClick={() => save("brand")}>
          {t.common.saveChanges}
        </Button>
      </Field>
      <Field label={t.admin.supportEmail}>
        <Input type="email" value={form.supportEmail} onChange={(event) => setForm((current) => ({ ...current, supportEmail: event.target.value }))} maxLength={120} />
        <Button type="button" size="sm" className="mt-3 w-fit" disabled={busy || form.supportEmail.trim() === supportEmail} onClick={() => save("supportEmail")}>
          {t.common.saveChanges}
        </Button>
      </Field>
    </div>
  );
}
