"use client";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
export const Accordion = AccordionPrimitive.Root;
export function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) { return <AccordionPrimitive.Item className={cn("border-b border-border", className)} {...props} />; }
export function AccordionTrigger({ children, className, ...props }: ComponentProps<typeof AccordionPrimitive.Trigger>) { return <AccordionPrimitive.Header><AccordionPrimitive.Trigger className={cn("flex w-full items-center justify-between gap-5 py-6 text-left text-base font-semibold transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [&[data-state=open]>svg]:rotate-45", className)} {...props}>{children}<Plus className="size-5 shrink-0 text-muted-foreground transition-transform" /></AccordionPrimitive.Trigger></AccordionPrimitive.Header>; }
export function AccordionContent({ children, ...props }: ComponentProps<typeof AccordionPrimitive.Content>) { return <AccordionPrimitive.Content className="overflow-hidden text-sm leading-7 text-muted-foreground data-[state=open]:animate-accordion-down" {...props}><div className="pb-6 pr-8">{children}</div></AccordionPrimitive.Content>; }
