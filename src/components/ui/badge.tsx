import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground",
      accent: "bg-accent text-accent-foreground",
      outline: "border border-border text-foreground",
      muted: "bg-muted text-muted-foreground",
      success: "bg-[rgb(22_163_74/0.12)] text-[var(--success)]",
      warning: "bg-[rgb(202_138_4/0.12)] text-[var(--warning)]",
      error: "bg-[rgb(220_38_38/0.12)] text-[var(--error)]",
      light: "bg-white text-[#142a29]",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}
