"use client";

import { dictionary, type Locale } from "@/lib/i18n";

export type ApiResult<T = undefined> = { ok: true; data: T } | { ok: false; status: number; key: string };

/** POST JSON to one of the app's API routes and normalize its `{ok}|{error}` contract. */
export async function postJson<T = undefined>(url: string, payload: unknown, method = "POST"): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const body = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (response.ok && body.ok) return { ok: true, data: (body as { ok: true } & Record<string, unknown> & { data?: T }).data as T };
    return { ok: false, status: response.status, key: body.error ?? "unexpected" };
  } catch {
    return { ok: false, status: 0, key: "unexpected" };
  }
}

/** Translate a stable error key into localized copy, falling back to `unexpected`. */
export function errorText(locale: Locale, key: string): string {
  const t = dictionary(locale);
  const fallback = t.errors.unexpected;
  return (t.errors as Record<string, string>)[key] ?? fallback;
}

/** Keep redirect targets on this site and in the same locale (avoids open redirects). */
export function safeNext(value: string | null | undefined, locale: Locale, fallback: string): string {
  if (value && value.startsWith(`/${locale}`) && !value.startsWith("//")) return value;
  if (value === "/") return `/${locale}`;
  return fallback;
}
