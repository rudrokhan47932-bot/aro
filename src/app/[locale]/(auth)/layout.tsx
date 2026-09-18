import { Brand } from "@/components/brand";
import { Preferences } from "@/components/preferences";
import { dictionary, type Locale } from "@/lib/i18n";
import { ShieldCheck } from "lucide-react";

export default async function AuthLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await (params as Promise<{ locale: Locale }>);
  const t = dictionary(locale);
  return (
    <div className="auth-grid">
      <aside className="auth-aside relative">
        <div className="orbit" aria-hidden="true" />
        <div className="relative flex flex-col min-h-0">
          <Brand locale={locale} inverse small />
          <div className="my-auto py-10">
            <p className="max-w-sm text-2xl font-semibold leading-snug tracking-tight text-[#f4f8ef] whitespace-pre-line">
              {t.auth.sideTitle}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-[#bcd0c2]">
              {t.auth.sideDescription}
            </p>
            <blockquote className="mt-12 max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-sm italic leading-6 text-[#e6efe4]">
                &ldquo;{t.auth.testimonial}&rdquo;
              </p>
            </blockquote>
          </div>
          <p className="flex items-center gap-2 text-[11px] text-[#9dbca4]">
            <ShieldCheck className="size-3.5" />
            {t.auth.secure}
          </p>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Brand locale={locale} />
          <Preferences locale={locale} />
        </header>
        <main className="flex flex-1 items-start justify-center px-6 pb-16 sm:items-center sm:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
