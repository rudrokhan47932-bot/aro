"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LayoutDashboard, Users, CreditCard, Blocks, ReceiptText, Tag, MessageSquareText, Settings, LogOut, Menu, ArrowLeftRight, ShieldCheck } from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard, users: Users, subscriptions: CreditCard, plans: Blocks,
  transactions: ReceiptText, coupons: Tag, support: MessageSquareText, settings: Settings,
};

export function AdminShell({ locale, email, items, workspaceLabel, memberLabel, adminLabel, logoutLabel, menuLabel, children }: {
  locale: "en" | "bn";
  email: string;
  items: { href: string; label: string; icon: string }[];
  workspaceLabel: string; memberLabel: string; adminLabel: string; logoutLabel: string; menuLabel: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const initial = (email[0] ?? "A").toUpperCase();

  const nav = (
    <nav className="grid gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link key={item.href} href={item.href} data-active={isActive} onClick={() => setOpen(false)} className="workspace-nav">
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="dashboard-grid">
      <div className="sidebar">
        <div className="flex items-center justify-between">
          <Brand locale={locale} small />
          <ShieldCheck className="size-4 text-[var(--accent)]" aria-hidden="true" />
        </div>
        <div className="mt-6 flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 px-3 py-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/12 text-sm font-bold text-[var(--accent)]">{initial}</span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{adminLabel}</p>
            <p className="truncate text-[10px] text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="mt-7 grid gap-6 overflow-y-auto pb-6">
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{adminLabel}</p>
            {nav}
          </div>
        </div>
        <div className="mt-auto border-t border-border pt-4">
          <Link href={`/${locale}/dashboard`} className="workspace-nav w-full">
            <ArrowLeftRight className="size-4" />
            <span>{memberLabel}</span>
          </Link>
          <button type="button" onClick={() => signOut({ callbackUrl: `/${locale}` })} className="workspace-nav w-full text-left">
            <LogOut className="size-4" />
            <span>{logoutLabel}</span>
          </button>
        </div>
      </div>

      <div className="min-w-0">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur lg:hidden">
          <Brand locale={locale} small />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button aria-label={menuLabel} size="icon" variant="ghost"><Menu /></Button>
            </DialogTrigger>
            <DialogContent closeLabel={workspaceLabel} className="max-w-sm">
              <DialogTitle className="sr-only">{menuLabel}</DialogTitle>
              <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-muted px-3 py-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--accent)]/12 text-sm font-bold text-[var(--accent)]">{initial}</span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{adminLabel}</p>
                  <p className="truncate text-xs text-muted-foreground">{email}</p>
                </div>
              </div>
              <div className="grid max-h-[60dvh] gap-4 overflow-y-auto pr-1">{nav}</div>
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
