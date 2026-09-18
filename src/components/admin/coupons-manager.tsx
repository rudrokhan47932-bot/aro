"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { date, dictionary, type Locale } from "@/lib/i18n";
import { postJson, errorText } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field, Input, Alert } from "@/components/auth/auth-parts";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export type CouponRow = {
  id: string; code: string; percentOff: number; active: boolean;
  expiresAt: Date | null; maxRedemptions: number | null; redemptions: number;
};

export function CouponsManager({ locale, coupons }: { locale: Locale; coupons: CouponRow[] }) {
  const t = dictionary(locale);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [percentOff, setPercentOff] = useState(10);
  const [expires, setExpires] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");

  function close() { setOpen(false); setError(null); setCode(""); setPercentOff(10); setExpires(""); setMaxRedemptions(""); }

  async function create() {
    setBusy(true);
    setError(null);
    const result = await postJson("/api/admin", {
      resource: "coupons", action: "create", code,
      percentOff, active: true,
      expiresAt: expires ? new Date(expires).toISOString() : null,
      maxRedemptions: maxRedemptions ? Number(maxRedemptions) : null,
    });
    setBusy(false);
    if (!result.ok) {
      setError(errorText(locale, result.key));
      return;
    }
    close();
    router.refresh();
  }

  async function toggle(coupon: CouponRow) {
    const result = await postJson("/api/admin", { resource: "coupons", action: "update", id: coupon.id, active: !coupon.active });
    if (!result.ok) return;
    router.refresh();
  }

  return (
    <div className="grid gap-6">
      {coupons.length === 0 ? (
        <p className="rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-muted-foreground">{t.admin.couponNote}</p>
      ) : (
        <div className="table-wrap overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.admin.code}</th>
                <th>{t.admin.percentOff}</th>
                <th>{t.common.status}</th>
                <th>{t.admin.expires}</th>
                <th>{t.admin.maxRedemptions}</th>
                <th>{t.common.actions}</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="font-mono text-xs font-semibold">{coupon.code}</td>
                  <td>{coupon.percentOff}%</td>
                  <td><Badge variant={coupon.active ? "success" : "muted"}>{coupon.active ? t.common.active : t.common.inactive}</Badge></td>
                  <td className="text-muted-foreground">{coupon.expiresAt ? date(coupon.expiresAt, locale) : "—"}</td>
                  <td className="text-muted-foreground">{coupon.maxRedemptions ? `${coupon.redemptions}/${coupon.maxRedemptions}` : "∞"}</td>
                  <td>
                    <Button variant="ghost" size="sm" onClick={() => toggle(coupon)}>
                      {coupon.active ? t.common.inactive : t.common.active}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={() => { setOpen(true); setError(null); }}>
          <Plus className="size-4" />
          {t.admin.createCoupon}
        </Button>
      </div>

      <Dialog open={open} onOpenChange={(next) => { if (!next) close(); }}>
        <DialogContent closeLabel={t.nav.close} className="max-w-md">
          <DialogTitle>{t.admin.createCoupon}</DialogTitle>
          <DialogDescription>{t.admin.couponNote}</DialogDescription>
          <div className="mt-4 grid gap-5">
            {error && <Alert>{error}</Alert>}
            <Field label={t.admin.code}>
              <Input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="SAVE10" pattern="[A-Z0-9-]{3,32}" required autoFocus />
            </Field>
            <Field label={t.admin.percentOff}>
              <Input type="number" min={1} max={100} value={percentOff} onChange={(event) => setPercentOff(Number(event.target.value))} required />
            </Field>
            <Field label={t.admin.expires}>
              <Input type="datetime-local" value={expires} onChange={(event) => setExpires(event.target.value)} />
            </Field>
            <Field label={t.admin.maxRedemptions}>
              <Input type="number" min={1} value={maxRedemptions} onChange={(event) => setMaxRedemptions(event.target.value)} placeholder="∞" />
            </Field>
            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <Button variant="outline" onClick={close}>{t.common.cancel}</Button>
              <Button onClick={create} disabled={busy || code.length < 3}>
                {busy ? t.common.saving : t.admin.createCoupon}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
