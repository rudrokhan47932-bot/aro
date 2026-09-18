import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { RegisterForm } from "@/components/auth/register-form";

type SearchParams = Promise<{ plan?: string | string[] }>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${dictionary(locale).auth.registerTitle} | Aro` };
}

export default async function RegisterPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: SearchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  const t = dictionary(locale);
  const plan = typeof query.plan === "string" ? query.plan : Array.isArray(query.plan) ? query.plan[0] : null;

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">{t.auth.registerTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.registerDescription}</p>
      </div>
      <RegisterForm locale={locale} plan={plan} />
      <p className="text-center text-sm text-muted-foreground">
        {t.auth.hasAccount}{" "}
        <Link href={`/${locale}/login`} className="font-semibold text-[var(--accent)] hover:underline">
          {t.auth.login}
        </Link>
      </p>
    </div>
  );
}
