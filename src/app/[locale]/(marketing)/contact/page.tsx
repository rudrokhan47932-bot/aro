import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, MessageSquareText, ShieldCheck, Clock3 } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.footer.contact} | Aro`, description: t.legal.contactDescription };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);
  const points = [
    { icon: MessageSquareText, title: t.auth.loginTitle, body: t.dashboard.supportDescription },
    { icon: Clock3, title: t.pricing.questions, body: t.pricing.description },
    { icon: ShieldCheck, title: t.auth.secure, body: t.legal.privacySections[0].body },
  ];

  return (
    <div className="section-space">
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="eyebrow mb-4 justify-center">{t.footer.connect}</div>
            <h1 className="section-heading mb-6">{t.legal.contactTitle}</h1>
            <p className="body-copy max-w-2xl mx-auto">{t.legal.contactDescription}</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6">
          {points.map((point, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <section className="surface p-8 h-full">
                <span className="feature-icon mb-5">
                  <point.icon className="size-5" />
                </span>
                <h2 className="text-base font-semibold mb-3">{point.title}</h2>
                <p className="text-sm text-[var(--muted-foreground)] leading-6 line-clamp-5">{point.body}</p>
              </section>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.12}>
          <div className="text-center mt-14">
            <p className="body-copy text-sm mb-6">{t.legal.contactButton}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href={`/${locale}/dashboard/support`}>
                  {t.legal.contactButton}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={`/${locale}/register`}>{t.hero.start}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
