"use client";

import { useEffect, useState } from "react";
import { Download, Pause, Play, RotateCcw } from "lucide-react";
import { dictionary, type Locale } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FocusTimer({ locale }: { locale: Locale }) {
  const t = dictionary(locale);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const done = secondsLeft === 0;

  useEffect(() => {
    if (!running || done) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          setRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, done]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progress = (1 - secondsLeft / (25 * 60)) * 100;

  return (
    <div className="grid place-items-center gap-6 py-4 text-center">
      <div className="relative grid size-44 place-items-center">
        <div className="absolute inset-0 rounded-full bg-[var(--muted)]" />
        <div
          className="absolute inset-0 rounded-full"
          style={{ background: `conic-gradient(var(--accent) ${progress}%, transparent ${progress}%)`, mask: "radial-gradient(closest-side, transparent 78%, black 79%)", WebkitMask: "radial-gradient(closest-side, transparent 78%, black 79%)" }}
        />
        <span className="relative font-mono text-4xl font-bold tabular-nums">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      </div>
      {done && <p className="text-sm font-medium text-[var(--accent)]">{t.dashboard.timerComplete}</p>}
      <div className="flex gap-3">
        <Button onClick={() => setRunning((value) => !value)} disabled={done}>
          {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          {running ? t.dashboard.pauseTimer : t.dashboard.startTimer}
        </Button>
        <Button variant="outline" onClick={() => { setRunning(false); setSecondsLeft(25 * 60); }}>
          <RotateCcw className="size-4" />
          {t.dashboard.resetTimer}
        </Button>
      </div>
    </div>
  );
}

export function WritingPad({ locale }: { locale: Locale }) {
  const t = dictionary(locale);
  const KEY = "aro-writing-draft";
  const [draft, setDraft] = useState(() => {
    if (typeof window === "undefined") return "";
    try { return window.localStorage.getItem(KEY) ?? ""; } catch { return ""; }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try { window.localStorage.setItem(KEY, draft); } catch { /* storage unavailable */ }
  }, [draft]);

  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  function download() {
    const blob = new Blob([draft], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "aro-draft.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-3">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={t.dashboard.writingPlaceholder}
        className="min-h-56 w-full resize-y rounded-xl border border-input bg-background p-4 text-sm leading-7 outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className={cn("text-xs text-muted-foreground", !draft && "opacity-0")}>
          {words} {t.dashboard.wordCount}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground">{t.dashboard.savedLocally}</span>
          <Button variant="outline" size="sm" onClick={download} disabled={!draft}>
            <Download className="size-3.5" />
            {t.dashboard.downloadDraft}
          </Button>
        </div>
      </div>
    </div>
  );
}
