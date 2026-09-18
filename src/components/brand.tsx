import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";
export function Brand({ locale = "en", inverse = false, small = false }: { locale?: Locale; inverse?: boolean; small?: boolean }) { return <Link href={`/${locale}`} aria-label={locale === "bn" ? "আরও — হোম" : "Aro — home"} className={cn("inline-flex items-center gap-2.5", inverse && "text-white")}><span className={cn("brand-symbol", small && "scale-85")} aria-hidden="true"><span /><span /><span /></span><span className={cn("font-bold tracking-[-0.075em]", small ? "text-3xl" : "text-[35px]", locale === "bn" && "tracking-normal text-[29px]")}>{locale === "bn" ? "আরও" : "aro"}<span className="text-accent">.</span></span></Link>; }
