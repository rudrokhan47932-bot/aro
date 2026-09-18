import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { Brand } from "@/components/brand";
import { Preferences } from "@/components/preferences";
import { Button } from "@/components/ui/button";
import { LockKeyhole, ArrowLeft, Home } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${dictionary(locale).errors.forbidden} | Aro` };
}

export default async function UnauthorizedPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <Brand locale={locale} />
        <Preferences locale={locale} />
      </header>
      <main className="flex flex-1 items-center justify-center px-6 pb-20">
        <div className="max-w-md text-center">
          <span className="mx-auto mb-8 grid size-16 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--accent)]">
            <LockKeyhole className="size-7" />
          </span>
          <h1 className="section-heading mb-4">{t.admin.noAdmin}</h1>
          <p className="body-copy text-sm mb-10">{t.admin.noAdminDescription}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link href={`/${locale}/dashboard`}>
                <ArrowLeft className="h-4 w-4" />
                {t.dashboard.overview}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/${locale}`}>
                <Home className="h-4 w-4" />
                {t.nav.home}
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
