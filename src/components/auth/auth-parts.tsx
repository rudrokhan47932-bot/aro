import { Field, Input, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

export function Alert({ children, tone = "error" }: { children: React.ReactNode; tone?: "error" | "success" }) {
  const styles = tone === "success"
    ? "border-[rgb(22_163_74/0.25)] bg-[rgb(22_163_74/0.07)] text-[var(--success)]"
    : "border-[rgb(220_38_38/0.25)] bg-[rgb(220_38_38/0.07)] text-[var(--error)]";
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("rounded-xl border px-4 py-3 text-sm leading-6", styles)}>
      {children}
    </p>
  );
}

export { Field, Input, Textarea };
