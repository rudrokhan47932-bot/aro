"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "@/components/auth/auth-parts";

export function AccountForm({ locale, initialName }: { locale: Locale; initialName: string }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const result = await postJson("/api/account", { name: name.trim() }, "PATCH");
    setBusy(false);
    if (!result.ok) {
      setMessage({ tone: "error", text: errorText(locale, result.key) });
      return;
    }
    setMessage({ tone: "success", text: t.common.saved });
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid max-w-md gap-5">
      {message && <Alert tone={message.tone}>{message.text}</Alert>}
      <Field label={t.common.name}>
        <Input name="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={80} required />
      </Field>
      <div>
        <Button type="submit" disabled={busy || name.trim() === initialName}>
          {busy ? t.common.saving : t.common.saveChanges}
        </Button>
      </div>
    </form>
  );
}
