"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "./auth-parts";

export function RegisterForm({ locale, plan }: { locale: Locale; plan: string | null }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData) {
    setBusy(true);
    setError(null);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    if (password.length < 12) {
      setError(errorText(locale, "invalidInput"));
      setBusy(false);
      return;
    }
    const created = await postJson("/api/register", { name, email, password, locale });
    if (!created.ok) {
      setError(errorText(locale, created.key));
      setBusy(false);
      return;
    }
    const result = await signIn("credentials", { redirect: false, email, password });
    if (result?.error) {
      router.push(`/${locale}/login?email=${encodeURIComponent(email)}`);
      return;
    }
    router.push(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <form action={submit} className="grid gap-5">
      {error && <Alert>{error}</Alert>}
      <Field label={t.common.name}>
        <Input name="name" autoComplete="name" minLength={2} maxLength={80} required autoFocus placeholder={t.auth.namePlaceholder} />
      </Field>
      <Field label={t.common.email}>
        <Input type="email" name="email" autoComplete="email" required />
      </Field>
      <Field label={t.common.password}>
        <Input type="password" name="password" autoComplete="new-password" minLength={12} maxLength={72} required />
        <span className="text-xs font-normal text-muted-foreground">{t.auth.passwordHint}</span>
      </Field>
      <p className="text-xs leading-5 text-muted-foreground">
        {t.auth.agreement}{" "}
        <Link href={`/${locale}/terms`} className="font-semibold text-[var(--accent)] hover:underline">{t.footer.terms}</Link>{" "}
        {t.auth.and}{" "}
        <Link href={`/${locale}/privacy`} className="font-semibold text-[var(--accent)] hover:underline">{t.footer.privacy}</Link>
        {plan ? ` · ${plan}` : ""}
      </p>
      <Button type="submit" className="w-full" size="lg" disabled={busy}>
        {busy ? t.auth.processing : t.auth.register}
      </Button>
    </form>
  );
}
