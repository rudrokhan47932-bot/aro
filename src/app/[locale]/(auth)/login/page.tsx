import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { LoginForm } from "@/components/auth/login-form";

type SearchParams = Promise<{ next?: string | string[]; email?: string | string[] }>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${dictionary(locale).auth.loginTitle} | Aro` };
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: SearchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  const t = dictionary(locale);
  const next = first(query.next);
  const redirectUrl = next?.startsWith(`/${locale}`) && !next.startsWith("//") ? next : `/${locale}/dashboard`;
  const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">{t.auth.loginTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.loginDescription}</p>
      </div>
      <LoginForm locale={locale} redirectUrl={redirectUrl} googleEnabled={googleEnabled} />
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.noAccount}{" "}
        <Link href={`/${locale}/register`} className="font-semibold text-[var(--accent)] hover:underline">
          {t.auth.register}
        </Link>
      </p>
    </div>
  );
}
