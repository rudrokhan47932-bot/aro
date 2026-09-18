import type { Metadata } from "next";
import { dictionary, type Locale } from "@/lib/i18n";
import { Reveal } from "@/components/ui/reveal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.nav.faq} | Aro`, description: t.faq.description };
}

export default async function FaqPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);

  return (
    <div className="section-space">
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="eyebrow mb-4 justify-center">{t.faq.eyebrow}</div>
            <h1 className="section-heading mb-6">{t.faq.title}</h1>
            <p className="body-copy max-w-2xl mx-auto">{t.faq.description}</p>
          </div>
        </Reveal>

        <Reveal>
          <div className="max-w-3xl mx-auto surface px-8">
            <Accordion type="single" collapsible>
              {t.faq.items.map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
