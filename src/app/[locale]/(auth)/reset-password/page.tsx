import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { ResetForm } from "@/components/auth/reset-form";

type SearchParams = Promise<{ token?: string | string[] }>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${dictionary(locale).auth.resetTitle} | Aro` };
}

export default async function ResetPasswordPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: SearchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  const t = dictionary(locale);
  const token = typeof query.token === "string" ? query.token : Array.isArray(query.token) ? query.token[0] : null;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">{t.auth.resetTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.resetDescription}</p>
      </div>
      {token ? (
        <ResetForm locale={locale} token={token} />
      ) : (
        <div className="grid gap-6">
          <p className="text-sm leading-6 text-muted-foreground">{t.errors.invalidToken}</p>
          <Link href={`/${locale}/forgot-password`} className="text-center text-sm font-semibold text-[var(--accent)] hover:underline">
            {t.auth.sendReset}
          </Link>
        </div>
      )}
    </div>
  );
}
