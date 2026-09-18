"use client";

import { usePathname } from "next/navigation";
import { Header } from "./header";
import { Footer } from "./footer";
import type { Locale } from "@/lib/i18n";

export function MarketingChrome({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const pathname = usePathname();
  const isMarketplace = pathname === `/${locale}`;
  return <>{!isMarketplace && <Header locale={locale} />}<main className="flex-1">{children}</main><div className={isMarketplace ? "marketplace-footer" : undefined}><Footer locale={locale} /></div></>;
}
