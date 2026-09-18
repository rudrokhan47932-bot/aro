"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "@/components/auth/auth-parts";

export function PasswordForm({ locale }: { locale: Locale }) {
  const t = dictionary(locale);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    const result = await postJson("/api/account/password", { currentPassword, password });
    if (!result.ok) {
      setError(errorText(locale, result.key));
      setBusy(false);
      return;
    }
    // The server bumped sessionVersion, revoking every existing session.
    await signOut({ callbackUrl: `/${locale}/login` });
  }

  return (
    <form onSubmit={submit} className="grid max-w-md gap-5">
      {error && <Alert>{error}</Alert>}
      <Field label={t.dashboard.currentPassword}>
        <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" required />
      </Field>
      <Field label={t.dashboard.newPassword}>
        <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" minLength={12} maxLength={72} required />
        <span className="text-xs font-normal text-muted-foreground">{t.auth.passwordHint}</span>
      </Field>
      <div>
        <Button type="submit" disabled={busy || !currentPassword || password.length < 12}>
          {busy ? t.common.saving : t.dashboard.updatePassword}
        </Button>
      </div>
    </form>
  );
}
