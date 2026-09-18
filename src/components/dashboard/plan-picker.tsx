"use client";

import { useState } from "react";
import { dictionary, money, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { planCopy, type PublicPlan } from "@/lib/plans";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/auth/auth-parts";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function PlanPicker({ locale, plans, currentPlanId, currentPlanActive, emailVerified }: {
  locale: Locale; plans: PublicPlan[]; currentPlanId: string | null; currentPlanActive: boolean; emailVerified: boolean;
}) {
  const t = dictionary(locale);
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(plan: PublicPlan) {
    setError(null);
    if (!emailVerified) {
      setError(t.errors.emailNotVerified);
      return;
    }
    setBusy(plan.id);
    const result = await postJson<{ url?: string }>("/api/subscription", {
      action: "checkout", planId: plan.id, billingCycle: cycle, locale,
    });
    setBusy(null);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    if (result.data.url) window.location.assign(result.data.url);
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">{t.pricing.note}</p>
        <div role="tablist" aria-label={t.common.cycle} className="flex rounded-full border border-border bg-muted/60 p-1">
          {(["monthly", "yearly"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={cycle === option}
              onClick={() => setCycle(option)}
              className={cn("rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
                cycle === option ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {option === "monthly" ? t.common.monthly : t.common.yearly}
              {option === "yearly" && <span className="ml-1.5 text-[var(--accent)]">{t.common.save}</span>}
            </button>
          ))}
        </div>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => {
          const copy = planCopy(plan, locale);
          const price = cycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice;
          const current = plan.id === currentPlanId;
          const active = current && currentPlanActive;
          return (
            <section key={plan.id} className={cn("surface relative flex flex-col p-6", plan.highlighted && "border-2 border-[var(--accent)]")}>
              {plan.highlighted && (
                <Badge variant="accent" className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {t.pricing.mostPopular}
                </Badge>
              )}
              <h3 className="text-lg font-semibold">{copy.name}</h3>
              <p className="mt-1 min-h-9 text-xs text-muted-foreground">{copy.description}</p>
              <p className="mt-5 text-[28px] font-bold tracking-tight">
                {money(price, locale, plan.currency)}
                <span className="text-sm font-normal text-muted-foreground">/{cycle === "yearly" ? t.common.year : t.common.month}</span>
              </p>
              <ul className="mt-5 grid gap-2.5">
                {copy.features.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs leading-5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-[var(--accent)]" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              {active ? (
                <Badge variant="success" className="mt-6 w-full justify-center py-2">{t.dashboard.planStatus.active}</Badge>
              ) : (
                <Button
                  className="mt-6 w-full"
                  variant={plan.highlighted ? "accent" : "outline"}
                  disabled={busy !== null}
                  onClick={() => choose(plan)}
                >
                  {busy === plan.id ? t.common.loading : current ? t.dashboard.upgrade : t.pricing.choose}
                </Button>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
