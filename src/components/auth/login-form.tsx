"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { dictionary, type Locale } from "@/lib/i18n";
import { errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "./auth-parts";

export function LoginForm({ locale, redirectUrl, googleEnabled }: { locale: Locale; redirectUrl: string; googleEnabled: boolean }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signIn("credentials", { redirect: false, email, password });
    if (result?.error) {
      setError(errorText(locale, "invalidCredentials"));
      setBusy(false);
      return;
    }
    router.push(redirectUrl);
    router.refresh();
  }

  async function google() {
    if (!googleEnabled) {
      setError(t.auth.googleUnavailable);
      return;
    }
    await signIn("google", { callbackUrl: redirectUrl });
  }

  return (
    <form action={submit} className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <Field label={t.common.email}>
        <Input type="email" name="email" autoComplete="email" required autoFocus />
      </Field>
      <Field label={t.common.password}>
        <Input type="password" name="password" autoComplete="current-password" required />
      </Field>
      <div className="flex justify-end">
        <a href={`/${locale}/forgot-password`} className="text-xs font-semibold text-[var(--accent)] hover:underline">
          {t.auth.forgot}
        </a>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy ? t.auth.processing : t.auth.login}
      </Button>
      <div className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-[var(--border)]" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{t.auth.or}</span>
        <span className="h-px flex-1 bg-[var(--border)]" />
      </div>
      <Button type="button" variant="outline" className="w-full" onClick={google} disabled={busy}>
        {t.auth.google}
      </Button>
    </form>
  );
}
