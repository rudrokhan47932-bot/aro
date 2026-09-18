"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Alert } from "./auth-parts";

type State = { phase: "idle" | "working" | "done" | "failed"; message?: string };

export function VerifyPanel({ locale, token, authed }: { locale: Locale; token: string | null; authed: boolean }) {
  const t = dictionary(locale);
  // Begin in the working phase whenever a token arrives so the consume runs once.
  const [state, setState] = useState<State>({ phase: token ? "working" : "idle" });

  useEffect(() => {
    if (!token || state.phase !== "working") return;
    let cancelled = false;
    postJson("/api/email/verify", { token }).then((result) => {
      if (cancelled) return;
      setState(result.ok
        ? { phase: "done" }
        : { phase: "failed", message: errorText(locale, result.key) });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function resend() {
    setState({ phase: "working" });
    const result = await postJson("/api/email/resend", { locale });
    setState(result.ok
      ? { phase: "done", message: t.auth.checkEmail }
      : { phase: "failed", message: errorText(locale, result.key) });
  }

  if (state.phase === "working") {
    return <Alert tone="success">{t.auth.processing}</Alert>;
  }

  if (state.phase === "done") {
    return (
      <div className="grid gap-6">
        <Alert tone="success">{state.message ?? t.auth.verified}</Alert>
        <Button asChild className="w-full">
          <Link href={`/${locale}/dashboard`}>{t.dashboard.overview}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {state.phase === "failed" && <Alert>{state.message}</Alert>}
      {authed ? (
        <>
          <p className="text-sm leading-6 text-muted-foreground">{t.auth.verifyDescription}</p>
          <Button className="w-full" onClick={resend}>{t.auth.resend}</Button>
        </>
      ) : (
        <>
          <p className="text-sm leading-6 text-muted-foreground">{t.auth.verifyDescription}</p>
          <Button asChild className="w-full">
            <Link href={`/${locale}/login`}>{t.auth.login}</Link>
          </Button>
        </>
      )}
    </div>
  );
}
