import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import { Sparkles, Headphones, TrendingUp, Globe2, Lock, RefreshCw, Zap, Star, ArrowRight } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.nav.features} | Aro`, description: t.features.description };
}

export default async function FeaturesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);
  const icons = [Sparkles, Headphones, TrendingUp, Globe2, Lock, RefreshCw, Zap, Star];

  return (
    <div className="section-space">
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="eyebrow mb-4 justify-center">{t.features.eyebrow}</div>
            <h1 className="section-heading mb-6">
              {t.features.title}
              <span className="text-[var(--accent)]"> {t.features.accent}</span>
            </h1>
            <p className="body-copy max-w-2xl mx-auto">{t.features.description}</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {t.features.items.map((item, i) => {
            const Icon = icons[i];
            return (
              <Reveal key={i} delay={i * 0.05}>
                <div className="surface p-8 h-full group">
                  <div className="feature-icon mb-5">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="eyebrow text-[9px] mb-3 opacity-60">{item.label}</div>
                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                  <p className="text-sm text-[var(--muted-foreground)] leading-relaxed mb-6">{item.description}</p>
                  <Link href={`/${locale}/pricing`} className="inline-flex items-center text-sm font-semibold text-[var(--accent)]">
                    {t.common.learnMore}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}