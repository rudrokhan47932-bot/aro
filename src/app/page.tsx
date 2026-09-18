import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isLocale } from "@/lib/i18n";

export default async function RootRedirect() {
  const store = await cookies();
  const preferred = store.get("aro-locale")?.value;
  redirect(`/${isLocale(preferred ?? "") ? preferred : "en"}`);
}
