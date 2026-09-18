import { Reveal } from "@/components/ui/reveal";

export type LegalSection = { title: string; body: string };

export function LegalPage({ eyebrow, title, intro, sections, lastUpdated }: {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
  lastUpdated?: string;
}) {
  return (
    <div className="section-space">
      <div className="container-page max-w-4xl">
        <Reveal>
          <div className="mb-14">
            <div className="eyebrow mb-4">{eyebrow}</div>
            <h1 className="section-heading mb-6">{title}</h1>
            <p className="body-copy max-w-2xl">{intro}</p>
          </div>
        </Reveal>
        <div className="space-y-5">
          {sections.map((section, i) => (
            <Reveal key={i} delay={i * 0.04}>
              <section className="surface p-8">
                <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
                <p className="text-sm leading-7 whitespace-pre-line">{section.body}</p>
              </section>
            </Reveal>
          ))}
        </div>
        {lastUpdated && (
          <p className="mt-10 text-xs text-muted-foreground">{lastUpdated}</p>
        )}
      </div>
    </div>
  );
}
