import { dictionary, type Locale } from "@/lib/i18n";
import { PageHeading, SectionCard } from "@/components/dashboard/ui";
import { CouponsManager } from "@/components/admin/coupons-manager";
import type { AdminData } from "@/components/dashboard/types";

export function AdminCouponsView({ locale, data }: { locale: Locale; data: AdminData }) {
  const t = dictionary(locale);
  const coupons = data.coupons.map((coupon) => ({
    id: coupon.id, code: coupon.code, percentOff: coupon.percentOff, active: coupon.active,
    expiresAt: coupon.expiresAt, maxRedemptions: coupon.maxRedemptions, redemptions: coupon.redemptions,
  }));

  return (
    <>
      <PageHeading eyebrow={t.dashboard.admin} title={t.admin.coupons} description={t.admin.couponNote} />
      <SectionCard title={t.admin.coupons}>
        <CouponsManager locale={locale} coupons={coupons} />
      </SectionCard>
    </>
  );
}
