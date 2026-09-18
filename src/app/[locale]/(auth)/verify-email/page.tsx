import type { Metadata } from "next";
import { dictionary, type Locale } from "@/lib/i18n";
import { currentUser } from "@/lib/server/auth";
import { VerifyPanel } from "@/components/auth/verify-panel";

type SearchParams = Promise<{ token?: string | string[] }>;

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params;
  return { title: `${dictionary(locale).auth.verifyTitle} | Aro` };
}

export default async function VerifyEmailPage({ params, searchParams }: { params: Promise<{ locale: Locale }>; searchParams: SearchParams }) {
  const { locale } = await params;
  const query = await searchParams;
  const t = dictionary(locale);
  const token = typeof query.token === "string" ? query.token : Array.isArray(query.token) ? query.token[0] : null;
  const authed = Boolean(await currentUser());

  return (
    <div className="grid gap-8">
      <div>
        <h1 className="mb-2 text-[28px] font-semibold tracking-tight">{t.auth.verifyTitle}</h1>
        <p className="text-sm text-muted-foreground">{t.auth.verifyDescription}</p>
      </div>
      <VerifyPanel locale={locale} token={token} authed={authed} />
    </div>
  );
}
