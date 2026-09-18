import type { Metadata } from "next";
import Link from "next/link";
import { dictionary, number, type Locale } from "@/lib/i18n";
import { getPublicPlans } from "@/lib/server/data";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Minus } from "lucide-react";
import type { PublicPlan } from "@/lib/plans";

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = dictionary(locale);
  return { title: `${t.nav.pricing} | Aro`, description: t.pricing.description };
}

type Cell = { kind: "yes" | "no" | "text"; text?: string };
type PlanCells = Record<"starter" | "professional" | "premium", Cell>;

function matrix(t: ReturnType<typeof dictionary>, locale: Locale): { label: string; cells: PlanCells }[] {
  const tick = { kind: "yes" } as const;
  const cross = { kind: "no" } as const;
  const gb = (value: number) => `${number(value, locale)} GB`;
  return [
    { label: t.pricing.rows[0], cells: { starter: { kind: "text", text: t.pricing.personal }, professional: { kind: "text", text: t.pricing.personal }, premium: { kind: "text", text: t.pricing.team } } },
    { label: t.pricing.rows[1], cells: { starter: { kind: "text", text: gb(10) }, professional: { kind: "text", text: gb(100) }, premium: { kind: "text", text: gb(1000) } } },
    { label: t.pricing.rows[2], cells: { starter: { kind: "text", text: "5" }, professional: { kind: "text", text: "20" }, premium: { kind: "text", text: t.pricing.unlimited } } },
    { label: t.pricing.rows[3], cells: { starter: cross, professional: tick, premium: tick } },
    { label: t.pricing.rows[4], cells: { starter: cross, professional: tick, premium: tick } },
    { label: t.pricing.rows[5], cells: { starter: cross, professional: cross, premium: tick } },
    { label: t.pricing.rows[6], cells: { starter: cross, professional: cross, premium: tick } },
    { label: t.pricing.rows[7], cells: { starter: cross, professional: cross, premium: tick } },
    { label: t.pricing.rows[8], cells: { starter: cross, professional: tick, premium: tick } },
  ];
}

const PLAN_KEYS = ["starter", "professional", "premium"] as const;
function planColumn(plan: PublicPlan): keyof PlanCells | null {
  const key = PLAN_KEYS.find((candidate) => candidate === plan.slug);
  return key ?? null;
}

function CellMark({ cell }: { cell: Cell }) {
  if (cell.kind === "yes") return <Check className="mx-auto h-4 w-4 text-[var(--accent)]" aria-label="✓" />;
  if (cell.kind === "no") return <Minus className="mx-auto h-4 w-4 text-[var(--muted-foreground)] opacity-40" aria-label="–" />;
  return <span className="text-xs text-muted-foreground">{cell.text}</span>;
}

export default async function PricingPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = dictionary(locale);
  const plans = await getPublicPlans();
  const rows = matrix(t, locale);

  return (
    <div className="section-space">
      <div className="container-page">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="eyebrow mb-4 justify-center">{t.pricing.eyebrow}</div>
            <h1 className="section-heading mb-6">
              {t.pricing.title}
              <span className="text-[var(--accent)]"> {t.pricing.accent}</span>
            </h1>
            <p className="body-copy max-w-2xl mx-auto">{t.pricing.description}</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.05}>
              <Card className={`h-full ${plan.highlighted ? "border-[var(--accent)] border-2 shadow-lg relative" : "hover:shadow-md transition-shadow"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[var(--accent)] text-white px-3 py-1 text-xs font-semibold">
                      {t.pricing.mostPopular}
                    </Badge>
                  </div>
                )}
                <CardHeader className={`pb-4 ${plan.highlighted ? "pt-8" : "pt-6"}`}>
                  <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">৳{Math.round(plan.monthlyPrice / 100)}</span>
                      <span className="text-sm text-[var(--muted-foreground)]">/{t.common.month}</span>
                    </div>
                    <p className="text-xs mt-1 text-[var(--muted-foreground)]">{t.pricing.billedMonth}</p>
                    {plan.highlighted && (
                      <p className="text-xs mt-2 text-[var(--accent)] font-medium">
                        {t.pricing.annualSaving}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3 mb-6">
                    {(plan.features as string[]).slice(0, 5).map((feature, j) => (
                      <div key={j} className="flex items-start gap-2">
                        <Check className="h-4 w-4 mt-0.5 shrink-0 text-[var(--accent)]" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant={plan.highlighted ? "accent" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link href={`/${locale}/register?plan=${plan.id}`}>
                      {t.pricing.start}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-[var(--muted)]/30 border-[var(--border)]">
              <CardHeader>
                <CardTitle className="text-lg">{t.pricing.compare}</CardTitle>
                <CardDescription>{t.pricing.comparisonDescription}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-4 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <div>{t.common.all}</div>
                    {plans.map((plan) => (
                      <div key={plan.id} className="text-center">{plan.name}</div>
                    ))}
                  </div>
                  {rows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] items-center gap-4 border-t border-[var(--border)] py-3.5 text-sm">
                      <div className="font-medium">{row.label}</div>
                      {plans.map((plan) => {
                        const column = planColumn(plan);
                        const cell = column ? row.cells[column] : { kind: "no" } as Cell;
                        return (
                          <div key={plan.id} className="text-center">
                            <CellMark cell={cell} />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <p className="mt-8 text-center text-xs text-muted-foreground">
              {t.pricing.note}
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
