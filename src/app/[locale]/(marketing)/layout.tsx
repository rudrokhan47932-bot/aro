import { MarketingChrome } from "@/components/marketing/marketing-chrome";
import type { Locale } from "@/lib/i18n";

export default async function MarketingLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await (params as Promise<{ locale: Locale }>);
  return <MarketingChrome locale={locale}>{children}</MarketingChrome>;
}
