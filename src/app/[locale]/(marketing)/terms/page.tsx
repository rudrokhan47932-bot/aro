import type { Metadata } from "next";
import { dictionary, type Locale } from "@/lib/i18n";
import { LegalPage } from "@/components/marketing/legal-page";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.footer.terms} | Aro`, description: t.legal.intro };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);
  return (
    <LegalPage
      eyebrow={t.legal.termsTitle}
      title={t.legal.title}
      intro={t.legal.intro}
      sections={t.legal.termsSections}
      lastUpdated={t.legal.lastUpdated}
    />
  );
}
