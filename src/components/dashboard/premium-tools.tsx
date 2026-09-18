"use client";

import { useState } from "react";
import { Clock3, PenLine, Palette, Library, LockKeyhole, Copy, Check } from "lucide-react";
import { dictionary, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FocusTimer, WritingPad } from "@/components/dashboard/tools";

const TOOL_ICONS = [Clock3, PenLine, Palette, Library];

export function PremiumTools({ locale }: { locale: Locale }) {
  const t = dictionary(locale);
  const [copied, setCopied] = useState<number | null>(null);

  function copyResource(index: number, body: string) {
    navigator.clipboard?.writeText(body).catch(() => undefined);
    setCopied(index);
    window.setTimeout(() => setCopied(null), 1600);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {t.dashboard.tools.map((tool, index) => {
        const Icon = TOOL_ICONS[index] ?? Clock3;
        const description = t.dashboard.toolDescriptions[index];
        const isTimer = index === 0;
        const isWriting = index === 1;
        const isLibrary = index === 3;
        return (
          <Dialog key={tool}>
            <DialogTrigger asChild>
              <button type="button" className="surface group flex h-full flex-col items-start p-6 text-left transition-colors hover:border-[var(--accent)]/50">
                <span className="feature-icon mb-4"><Icon className="size-5" /></span>
                <span className="mb-1.5 text-base font-semibold">{tool}</span>
                <span className="text-sm leading-6 text-muted-foreground">{description}</span>
                <span className="mt-5 text-xs font-semibold text-[var(--accent)]">{t.dashboard.toolOpen} →</span>
              </button>
            </DialogTrigger>
            <DialogContent closeLabel={t.nav.close} className="max-w-xl">
              <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                <span className="feature-icon"><Icon className="size-5" /></span>
                {tool}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">{description}</DialogDescription>
              <div className="mt-4">
                {isTimer && <FocusTimer locale={locale} />}
                {isWriting && <WritingPad locale={locale} />}
                {isLibrary && (
                  <div className="grid gap-4">
                    {t.dashboard.resources.map((resource, resourceIndex) => (
                      <div key={resource.title} className="rounded-xl border border-border bg-muted/40 p-5">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h3 className="text-sm font-semibold">{resource.title}</h3>
                          <Button variant="ghost" size="sm" onClick={() => copyResource(resourceIndex, resource.body)}>
                            {copied === resourceIndex ? <Check className="size-3.5 text-[var(--accent)]" /> : <Copy className="size-3.5" />}
                            {copied === resourceIndex ? t.common.copied : t.common.copy}
                          </Button>
                        </div>
                        <pre className="whitespace-pre-line font-sans text-xs leading-6 text-muted-foreground">{resource.body}</pre>
                      </div>
                    ))}
                  </div>
                )}
                {!isTimer && !isWriting && !isLibrary && (
                  <p className="flex items-center gap-2 rounded-xl bg-[var(--muted)] px-4 py-3 text-sm text-muted-foreground">
                    <Palette className="size-4 text-[var(--accent)]" />
                    {tool} — {description}
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        );
      })}
    </div>
  );
}

export function LockedTools({ locale, cta }: { locale: Locale; cta: string }) {
  const t = dictionary(locale);
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {t.dashboard.tools.map((tool, index) => {
        const Icon = TOOL_ICONS[index] ?? Clock3;
        return (
          <div key={tool} className="surface relative flex h-full flex-col items-start p-6 opacity-80">
            <span className="feature-icon mb-4"><Icon className="size-5" /></span>
            <span className="mb-1.5 text-base font-semibold">{tool}</span>
            <span className="text-sm leading-6 text-muted-foreground">{t.dashboard.toolDescriptions[index]}</span>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <LockKeyhole className="size-3.5" />
              {cta}
            </span>
          </div>
        );
      })}
    </div>
  );
}
