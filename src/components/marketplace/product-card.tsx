import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "./brand-mark";
import { formatCatalogPrice, type CatalogProduct } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";

export function ProductCard({ product, locale, labels, onView }: { product: CatalogProduct; locale: Locale; labels: { view: string; plans: string; from: string; popular: string; value: string }; onView: () => void }) {
  const lowest = Math.min(...product.plans.map((plan) => plan.price));
  return <article className="market-product-card" style={{ "--product-accent": product.accent } as CSSProperties}><div className="flex items-start justify-between"><BrandMark name={product.name} accent={product.accent} /><div className="flex gap-2">{product.popular && <span className="market-pill">{labels.popular}</span>}{product.bestValue && <span className="market-pill market-pill-value">{labels.value}</span>}</div></div><div className="mt-8"><div className="text-xs uppercase tracking-[0.18em] text-white/45">{product.category}</div><h3 className="mt-2 text-xl font-semibold text-white">{product.name}</h3><p className="mt-2 min-h-12 text-sm leading-6 text-white/55">{product.description[locale]}</p></div><div className="mt-8 flex items-end justify-between gap-4"><div><div className="text-xs text-white/45">{product.plans.length} {labels.plans}</div><div className="mt-1 text-2xl font-semibold text-white">{formatCatalogPrice(lowest, locale)}<span className="ml-1 text-xs font-normal text-white/45">{labels.from}</span></div></div><Button variant="outline" className="market-outline-button" onClick={onView}>{labels.view}<ArrowUpRight className="ml-1 h-4 w-4" /></Button></div></article>;
}
