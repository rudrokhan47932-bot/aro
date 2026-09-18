import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { ForgotForm } from "@/components/auth/forgot-form";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${dictionary(locale).auth.forgotTitle} | Aro` };
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">{t.auth.forgotTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.forgotDescription}</p>
      </div>
      <ForgotForm locale={locale} />
      <p className="text-center text-sm text-muted-foreground">
        <Link href={`/${locale}/login`} className="font-semibold text-[var(--accent)] hover:underline">
          {t.auth.backLogin}
        </Link>
      </p>
    </div>
  );
}
