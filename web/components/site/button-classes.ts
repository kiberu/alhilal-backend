export function buttonLinkClass(variant: "default" | "gold" | "outline" = "default") {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-semibold transition duration-200";

  if (variant === "gold") {
    return `${base} bg-[color:var(--gold-solid)] text-[color:var(--ink-strong)] shadow-[0_18px_40px_rgba(249,160,40,0.2)] hover:-translate-y-0.5 hover:opacity-95`;
  }

  if (variant === "outline") {
    return `${base} border border-[color:var(--border-soft)] bg-white text-[color:var(--brand-maroon)] shadow-[0_12px_28px_rgba(39,28,33,0.05)] hover:-translate-y-0.5 hover:border-[color:var(--brand-maroon)]`;
  }

  return `${base} bg-[color:var(--brand-maroon)] text-white shadow-[0_18px_40px_rgba(151,2,70,0.22)] hover:-translate-y-0.5 hover:bg-[color:var(--brand-maroon-deep)]`;
}
