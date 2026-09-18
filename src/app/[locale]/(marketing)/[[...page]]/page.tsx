import type { Metadata } from "next";
import { Storefront } from "@/components/marketplace/storefront";
import type { Locale } from "@/lib/i18n";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === "bn" ? "Aro — আপনার পছন্দের সাবস্ক্রিপশন" : "Aro — Premium subscriptions for Bangladesh", description: locale === "bn" ? "সহজ মূল্যে আপনার প্রিয় ডিজিটাল সাবস্ক্রিপশন।" : "A considered marketplace for digital subscriptions in Bangladesh." };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  return <Storefront locale={locale} />;
}
