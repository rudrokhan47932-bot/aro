import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.nav.about} | Aro`, description: t.about.description };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);

  return (
    <div className="section-space">
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="eyebrow mb-4 justify-center">{t.about.eyebrow}</div>
            <h1 className="section-heading mb-6">
              {t.about.title}
              <span className="text-[var(--accent)]"> {t.about.accent}</span>
            </h1>
            <p className="body-copy max-w-2xl mx-auto">{t.about.description}</p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-stretch mb-8">
          <Reveal>
            <section className="surface p-8 lg:p-10 h-full">
              <div className="eyebrow mb-5">{t.about.mission}</div>
              <p className="text-sm leading-7">{t.about.body}</p>
            </section>
          </Reveal>
          <Reveal delay={0.08}>
            <section className="surface p-8 lg:p-10 h-full bg-[var(--muted)]/40">
              <ul className="grid gap-4 h-full content-center">
                {t.about.values.map((value, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent)]/12 text-[var(--accent)]">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-sm font-medium">{value}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="text-center mt-14">
            <Button size="lg" asChild>
              <Link href={`/${locale}/register`}>
                {t.cta.button}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
