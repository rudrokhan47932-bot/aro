import { en } from "./en";
import { bn } from "./bn";
export const locales = ["en", "bn"] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = typeof en;
export function isLocale(value: string): value is Locale { return locales.includes(value as Locale); }
export function dictionary(locale: Locale): Dictionary { return locale === "bn" ? bn : en; }
export function number(value: number, locale: Locale) { return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US").format(value); }
export function money(value: number, locale: Locale, currency = "BDT") { return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-US", { style: "currency", currency, maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" }).format(value / 100); }
export function date(value: string | Date, locale: Locale) { return new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)); }
