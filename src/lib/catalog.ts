import type { Locale } from "./i18n";

export type CatalogPlan = { id: string; months: number; price: number };
export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  accent: string;
  popular?: boolean;
  bestValue?: boolean;
  description: Record<Locale, string>;
  plans: CatalogPlan[];
  accountType: string | null;
  accessRules: string | null;
  deliveryTime: string | null;
  stock: string | null;
  supportTerms: string | null;
};

const unset = { accountType: null, accessRules: null, deliveryTime: null, stock: null, supportTerms: null };

export const catalog: CatalogProduct[] = [
  { ...unset, id: "netflix", name: "Netflix", category: "Entertainment", accent: "#e50914", popular: true, description: { en: "Stream your next favorite story.", bn: "আপনার পরের প্রিয় গল্প উপভোগ করুন।" }, plans: [{ id: "netflix-1m", months: 1, price: 300 }, { id: "netflix-3m", months: 3, price: 850 }, { id: "netflix-6m", months: 6, price: 1550 }, { id: "netflix-1y", months: 12, price: 2850 }] },
  { ...unset, id: "prime-video", name: "Prime Video", category: "Entertainment", accent: "#38bdf8", bestValue: true, description: { en: "More films, series, and quiet evenings.", bn: "আরও সিনেমা, সিরিজ আর সুন্দর সন্ধ্যা।" }, plans: [{ id: "prime-video-1m", months: 1, price: 120 }, { id: "prime-video-6m", months: 6, price: 350 }, { id: "prime-video-1y", months: 12, price: 600 }] },
  { ...unset, id: "hoichoi", name: "Hoichoi", category: "Entertainment", accent: "#f59e0b", description: { en: "Bengali stories, made to stay with you.", bn: "বাংলা গল্প, আপনার সঙ্গে থাকার জন্য।" }, plans: [{ id: "hoichoi-6m", months: 6, price: 350 }, { id: "hoichoi-1y", months: 12, price: 490 }] },
  { ...unset, id: "chorki", name: "Chorki", category: "Entertainment", accent: "#ef4444", description: { en: "A considered watchlist for every mood.", bn: "প্রতিটি মুডের জন্য বেছে নেওয়া ওয়াচলিস্ট।" }, plans: [{ id: "chorki-6m", months: 6, price: 350 }, { id: "chorki-1y", months: 12, price: 450 }] },
  { ...unset, id: "youtube-premium", name: "YouTube Premium", category: "Entertainment", accent: "#ff0033", popular: true, description: { en: "More focus, fewer interruptions.", bn: "আরও মনোযোগ, কম বিরতি।" }, plans: [{ id: "youtube-premium-1m", months: 1, price: 250 }, { id: "youtube-premium-6m", months: 6, price: 1350 }, { id: "youtube-premium-1y", months: 12, price: 2450 }] },
  { ...unset, id: "chatgpt-plus", name: "ChatGPT Plus", category: "Productivity", accent: "#10a37f", bestValue: true, description: { en: "A little more room for ideas and answers.", bn: "ভাবনা ও উত্তরের জন্য আরও একটু জায়গা।" }, plans: [{ id: "chatgpt-plus-1m", months: 1, price: 400 }, { id: "chatgpt-plus-3m", months: 3, price: 1090 }, { id: "chatgpt-plus-6m", months: 6, price: 1990 }] },
];

export function formatCatalogPrice(price: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0, currencyDisplay: "narrowSymbol" }).format(price);
}
