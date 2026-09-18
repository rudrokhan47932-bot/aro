"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Languages } from "lucide-react";
import { Button } from "./ui/button";
import { dictionary, type Locale } from "@/lib/i18n";
export function Preferences({ locale }: { locale: Locale }) { const text = dictionary(locale); const path = usePathname(); const query = useSearchParams(); const { resolvedTheme, setTheme } = useTheme(); const other = locale === "en" ? "bn" : "en"; const href = path.replace(/^\/(en|bn)(?=\/|$)/, `/${other}`); return <div className="flex items-center gap-1"><Button variant="ghost" size="sm" asChild><Link href={`${href}${query.size ? `?${query.toString()}` : ""}`} hrefLang={other} onClick={() => { document.cookie = `aro-locale=${other};path=/;max-age=31536000;SameSite=Lax`; }}><Languages className="size-3.5" /><span>{text.nav.language}</span></Link></Button><Button variant="ghost" size="icon" aria-label={text.nav.theme} onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}><Sun className="hidden dark:block" /><Moon className="dark:hidden" /></Button></div>; }
