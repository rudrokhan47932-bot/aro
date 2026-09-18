import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeading({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-8">
      {eyebrow && <div className="eyebrow mb-3">{eyebrow}</div>}
      <h1 className="mb-2 text-[28px] font-semibold tracking-tight">{title}</h1>
      {description && <p className="body-copy text-sm max-w-2xl">{description}</p>}
    </div>
  );
}

export function Stat({ label, value, hint, icon: Icon }: { label: string; value: string; hint?: string; icon?: LucideIcon }) {
  return (
    <div className="surface p-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && <span className="feature-icon size-9"><Icon className="size-4" /></span>}
      </div>
      <p className="mt-3 text-[26px] font-bold tracking-tight">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="surface grid place-items-center px-6 py-16 text-center">
      <span className="mb-5 grid size-12 place-items-center rounded-2xl bg-[var(--muted)] text-[var(--accent)]">
        <Icon className="size-5" />
      </span>
      <p className="mb-1 text-base font-semibold">{title}</p>
      {description && <p className="mb-5 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action}
    </div>
  );
}

export function Progress({ value, max, display, className }: { value: number; max: number; display?: string; className?: string }) {
  const safeMax = Math.max(1, max);
  const percent = Math.min(100, Math.round((value / safeMax) * 100));
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <div className="h-full rounded-full bg-[var(--accent)] transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{display ?? `${value} / ${max}`}</span>
        <span>{percent}%</span>
      </div>
    </div>
  );
}

const STATUS_TONE: Record<string, "default" | "accent" | "outline" | "muted" | "success" | "warning" | "error"> = {
  free: "muted", trial: "accent", active: "success", past_due: "warning", cancelled: "error", expired: "muted",
};

export function PlanStatusBadge({ status, label }: { status: string; label: string }) {
  return <Badge variant={STATUS_TONE[status] ?? "muted"}>{label}</Badge>;
}

export function SectionCard({ title, description, action, children, className }: {
  title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string;
}) {
  return (
    <section className={cn("surface", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border p-6">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className="p-6">{children}</div>
    </section>
  );
}
