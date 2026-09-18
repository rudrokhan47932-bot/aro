"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { dictionary, number, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea, Alert } from "@/components/auth/auth-parts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type PlanRow = {
  id: string; slug: string; name: string; description: string;
  monthlyPrice: number; yearlyPrice: number; currency: string;
  highlighted: boolean; active: boolean; trialDays: number; features: unknown;
};

type Draft = { slug: string; name: string; description: string; monthlyPrice: number; yearlyPrice: number; active: boolean; highlighted: boolean; trialDays: number; featuresText: string };

function toDraft(plan: PlanRow): Draft {
  const features = Array.isArray(plan.features) ? (plan.features as string[]).join("\n") : JSON.stringify(plan.features ?? [], null, 2);
  return {
    slug: plan.slug, name: plan.name, description: plan.description,
    monthlyPrice: plan.monthlyPrice, yearlyPrice: plan.yearlyPrice,
    active: plan.active, highlighted: plan.highlighted, trialDays: plan.trialDays, featuresText: features,
  };
}

export function PlansManager({ locale, plans }: { locale: Locale; plans: PlanRow[] }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [editing, setEditing] = useState<PlanRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);

  function openEdit(plan: PlanRow) { setEditing(plan); setDraft(toDraft(plan)); setError(null); }
  function openCreate() { setCreating(true); setEditing(null); setDraft({ slug: "", name: "", description: "", monthlyPrice: 49900, yearlyPrice: 499000, active: true, highlighted: false, trialDays: 0, featuresText: "" }); setError(null); }
  function close() { setCreating(false); setEditing(null); setDraft(null); setError(null); }

  async function save() {
    if (!draft) return;
    setBusy(true);
    setError(null);
    const features = draft.featuresText.split("\n").map((line) => line.trim()).filter(Boolean);
    const payload: Record<string, unknown> = {
      name: draft.name, description: draft.description,
      monthlyPrice: draft.monthlyPrice, yearlyPrice: draft.yearlyPrice,
      features, active: draft.active, highlighted: draft.highlighted, trialDays: draft.trialDays,
    };
    if (creating) payload.slug = draft.slug;
    const result = await postJson("/api/admin", { resource: "plans", action: creating ? "create" : "update", id: editing?.id, ...payload });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    close();
    router.refresh();
  }

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => current ? { ...current, [key]: value } : current);

  const dialog = draft && (
    <Dialog open={Boolean(draft)} onOpenChange={(open) => { if (!open) close(); }}>
      <DialogContent closeLabel={t.nav.close} className="max-w-2xl">
        <DialogTitle>{creating ? t.admin.createPlan : t.admin.editPlan}</DialogTitle>
        <DialogDescription>{t.admin.settingsDescription}</DialogDescription>
        <div className="mt-4 grid gap-5">
          {error && <Alert>{error}</Alert>}
          {creating && (
            <Field label={t.admin.slug}>
              <Input value={draft.slug} onChange={(event) => set("slug", event.target.value)} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
            </Field>
          )}
          <Field label={t.common.name}>
            <Input value={draft.name} onChange={(event) => set("name", event.target.value)} required />
          </Field>
          <Field label={t.admin.descriptionField}>
            <Textarea value={draft.description} onChange={(event) => set("description", event.target.value)} />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={`${t.admin.monthlyPrice} (BDT)`}>
              <Input type="number" min={100} max={100000000} value={draft.monthlyPrice} onChange={(event) => set("monthlyPrice", Number(event.target.value))} required />
            </Field>
            <Field label={`${t.admin.yearlyPrice} (BDT)`}>
              <Input type="number" min={100} max={100000000} value={draft.yearlyPrice} onChange={(event) => set("yearlyPrice", Number(event.target.value))} required />
            </Field>
          </div>
          <Field label={t.admin.trialDays}>
            <Input type="number" min={0} max={90} value={draft.trialDays} onChange={(event) => set("trialDays", Number(event.target.value))} />
          </Field>
          <Field label={t.admin.featuresField}>
            <Textarea value={draft.featuresText} onChange={(event) => set("featuresText", event.target.value)} />
          </Field>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.active} onChange={(event) => set("active", event.target.checked)} className="size-4 accent-[var(--accent)]" />
              {t.admin.activeLabel}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={draft.highlighted} onChange={(event) => set("highlighted", event.target.checked)} className="size-4 accent-[var(--accent)]" />
              {t.admin.highlighted}
            </label>
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-5">
            <Button variant="outline" onClick={close}>{t.common.cancel}</Button>
            <Button onClick={save} disabled={busy || !draft.name || (creating && !draft.slug)}>
              {busy ? t.common.saving : t.admin.savePlan}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="grid gap-6">
      {dialog}
      <div className="flex justify-end">
        <Button onClick={openCreate}><Plus className="size-4" />{t.admin.createPlan}</Button>
      </div>
      <div className="table-wrap overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t.admin.slug}</th>
              <th>{t.common.name}</th>
              <th>{t.admin.monthlyPrice}</th>
              <th>{t.admin.yearlyPrice}</th>
              <th>{t.admin.trialDays}</th>
              <th>{t.common.status}</th>
              <th>{t.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((plan) => (
              <tr key={plan.id}>
                <td className="font-mono text-xs text-muted-foreground">{plan.slug}</td>
                <td className="font-medium">
                  {plan.name}
                  {plan.highlighted && <span className="ml-2 text-xs text-[var(--accent)]">★</span>}
                </td>
                <td className="font-semibold">{number(plan.monthlyPrice / 100, locale)}</td>
                <td className="font-semibold">{number(plan.yearlyPrice / 100, locale)}</td>
                <td className="text-muted-foreground">{plan.trialDays}</td>
                <td><Badge variant={plan.active ? "success" : "muted"}>{plan.active ? t.common.active : t.common.inactive}</Badge></td>
                <td>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(plan)}>
                    <Pencil className="size-3.5" />
                    {t.common.edit}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
