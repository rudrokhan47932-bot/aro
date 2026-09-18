import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 shrink-0", { variants: { variant: { default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:-translate-y-0.5", outline: "border border-border bg-background hover:bg-muted", ghost: "hover:bg-muted", accent: "bg-accent text-accent-foreground hover:bg-accent/90", light: "bg-white text-[#142a29] hover:bg-white/90" }, size: { default: "h-11 px-5", sm: "h-9 px-3.5 text-xs", lg: "h-13 px-6", icon: "size-10" } }, defaultVariants: { variant: "default", size: "default" } });
export function Button({ className, variant, size, asChild = false, ...props }: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) { const Component = asChild ? Slot : "button"; return <Component data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />; }
