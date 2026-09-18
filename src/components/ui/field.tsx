import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: ComponentProps<"input">) { return <input className={cn("flex h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/65 focus:border-accent focus:ring-2 focus:ring-accent/15 disabled:opacity-50", className)} {...props} />; }
export function Textarea({ className, ...props }: ComponentProps<"textarea">) { return <textarea className={cn("min-h-32 w-full rounded-xl border border-input bg-background p-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/15", className)} {...props} />; }
export function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="grid gap-2 text-sm font-medium">{label}{children}</label>; }
