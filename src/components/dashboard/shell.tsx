"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LayoutDashboard, CreditCard, ReceiptText, Gauge, Sparkles, User, ShieldCheck, Bell, MessageSquareText, LogOut, Menu, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layout: LayoutDashboard, credit: CreditCard, receipt: ReceiptText, gauge: Gauge, sparkles: Sparkles,
  user: User, shield: ShieldCheck, bell: Bell, chat: MessageSquareText,
};

export type ShellNavItem = { href: string; label: string; icon: string; count?: number };

function NavList({ items, base, onNavigate }: { items: ShellNavItem[]; base: string; onNavigate?: () => void }) {
  return (
    <nav className="grid gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        // The workspace root (…/dashboard) only highlights on the exact path;
        // sub-views highlight when the path falls under their own segment.
        const isRoot = item.href === `${base.split("/").slice(0, 3).join("/")}/dashboard`;
        const isActive = isRoot ? base === item.href : base === item.href || base.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} data-active={isActive} onClick={onNavigate} className="workspace-nav">
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
            {typeof item.count === "number" && item.count > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {item.count > 9 ? "9+" : item.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({ locale, name, email, planName, status, planStatusCopy, nav, settings, member, workspaceLabel, settingsLabel, adminLabel, logoutLabel, menuLabel, closeLabel, children }: {
  locale: "en" | "bn";
  name: string; email: string; planName: string | null;
  status: string; planStatusCopy: Record<string, string>;
  nav: ShellNavItem[]; settings: ShellNavItem[]; member: boolean;
  workspaceLabel: string; settingsLabel: string; adminLabel: string; logoutLabel: string; menuLabel: string; closeLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = (name.trim()[0] ?? email[0] ?? "A").toUpperCase();
  const planCopy = planStatusCopy[status] ?? status;
  const statusTone = status === "active" || status === "trial" ? "text-[var(--success)]" : "text-[var(--muted-foreground)]";

  const sidebar = (
    <div className="sidebar">
      <div className="flex items-center justify-between">
        <Brand locale={locale} small />
      </div>
      <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/12 text-sm font-bold text-[var(--accent)]">{initial}</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold">{name || email}</p>
          <p className="truncate text-[10px] text-muted-foreground">{planName ?? planCopy}</p>
        </div>
      </div>
      <div className="mt-7 grid gap-6 overflow-y-auto pb-6">
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{workspaceLabel}</p>
          <NavList items={nav} base={pathname} />
        </div>
        <div>
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{settingsLabel}</p>
          <NavList items={settings} base={pathname} />
        </div>
        {member && (
          <Link href={`/${locale}/admin`} className="workspace-nav text-[var(--accent)]" data-active={pathname.startsWith(`/${locale}/admin`)}>
            <ArrowUpRight className="size-4" />
            <span>{adminLabel}</span>
          </Link>
        )}
      </div>
      <div className="mt-auto border-t border-border pt-4">
        <div className="mb-3 px-3">
          <p className={cn("text-[11px] font-semibold", statusTone)}>{planName ?? planStatusCopy.free}</p>
          <p className="truncate text-[10px] text-muted-foreground">{email}</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="workspace-nav w-full text-left"
        >
          <LogOut className="size-4" />
          <span>{logoutLabel}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-grid">
      {sidebar}
      <div className="min-w-0">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Brand locale={locale} small />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button aria-label={menuLabel} size="icon" variant="ghost"><Menu /></Button>
            </DialogTrigger>
            <DialogContent closeLabel={closeLabel} className="max-w-sm">
              <DialogTitle className="sr-only">{menuLabel}</DialogTitle>
              <DialogDescription className="sr-only">{workspaceLabel}</DialogDescription>
              <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/12 text-sm font-bold text-[var(--accent)]">{initial}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{name || email}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
              <div className="grid max-h-[60dvh] gap-4 overflow-y-auto pr-1">
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{workspaceLabel}</p>
                  <NavList items={nav} base={pathname} onNavigate={() => setOpen(false)} />
                </div>
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{settingsLabel}</p>
                  <NavList items={settings} base={pathname} onNavigate={() => setOpen(false)} />
                </div>
                {member && (
                  <Link href={`/${locale}/admin`} onClick={() => setOpen(false)} data-active={pathname.startsWith(`/${locale}/admin`)} className="workspace-nav text-[var(--accent)]">
                    <ArrowUpRight className="size-4" />
                    <span>{adminLabel}</span>
                  </Link>
                )}
              </div>
              <div className="mt-5 border-t border-border pt-4">
                <button type="button" onClick={() => signOut({ callbackUrl: `/${locale}` })} className="workspace-nav w-full text-left">
                  <LogOut className="size-4" />
                  <span>{logoutLabel}</span>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        {children}
      </div>
    </div>
  );
}
