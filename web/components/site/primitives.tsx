import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-[color:var(--border-soft)] bg-white/92 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-maroon)]",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Section({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`mx-auto w-full max-w-7xl px-5 md:px-8 ${className}`}>{children}</section>;
}

export function SectionIntro({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-3xl">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-4 max-w-4xl text-3xl font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--ink-strong)] md:text-5xl">
          {title}
        </h2>
        {description ? <p className="mt-4 max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)] md:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
