import Image from "next/image";
import type { LucideIcon } from "lucide-react";

import { Eyebrow, Section } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

export type PageTemplate = "front-page" | "single-page" | "post";

type HeroChip = {
  icon?: LucideIcon;
  label: string;
};

export function FrontPageTemplate({
  eyebrow,
  supportLine,
  title,
  description,
  primaryAction,
  secondaryAction,
  imageSrc,
  imageAlt,
  proofChips = [],
  supportRow,
}: {
  eyebrow: string;
  supportLine?: string;
  title: string;
  description: string;
  primaryAction: React.ReactNode;
  secondaryAction?: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  proofChips?: HeroChip[];
  supportRow?: React.ReactNode;
}) {
  return (
    <Section className="pt-6 pb-12 md:pt-8 md:pb-14">
      <div className="overflow-hidden rounded-[2.8rem] border border-[color:var(--border-soft)] bg-white p-3 shadow-[0_32px_90px_rgba(39,28,33,0.09)]">
        <div className="relative min-h-[34rem] overflow-hidden rounded-[2.2rem] bg-[color:var(--surface-muted)] md:min-h-[37rem]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,18,0.14),rgba(18,14,18,0.28)_48%,rgba(18,14,18,0.56)_100%)]" />
          <div className="absolute inset-4 flex flex-col justify-between md:inset-8">
            <div className="w-full max-w-full rounded-[1.8rem] bg-[rgba(255,253,250,0.92)] p-5 shadow-[0_24px_55px_rgba(39,28,33,0.14)] backdrop-blur-md sm:max-w-[25rem] md:mt-4 md:max-w-[39rem] md:p-8">
              <Eyebrow>{eyebrow}</Eyebrow>
              {supportLine ? (
                <p className="mt-4 hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-muted)] sm:block">{supportLine}</p>
              ) : null}
              <h1 className="mt-4 max-w-3xl text-[1.95rem] font-extrabold leading-[0.92] tracking-[-0.06em] text-[color:var(--ink-strong)] sm:text-[2.6rem] md:text-[3.45rem] xl:text-[3.8rem]">
                {title}
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-6 text-[color:var(--ink-soft)] sm:text-sm sm:leading-7 md:text-base">{description}</p>
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
                {primaryAction}
                {secondaryAction}
              </div>
            </div>

            {proofChips.length ? (
              <div className="hidden flex-wrap gap-2 md:flex">
                {proofChips.map((chip) => {
                  const Icon = chip.icon;

                  return (
                    <span
                      key={chip.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/16 bg-[rgba(255,253,250,0.18)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-md"
                    >
                      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                      {chip.label}
                    </span>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {supportRow ? <div className="mt-5">{supportRow}</div> : null}
    </Section>
  );
}

export function SinglePageTemplate({
  eyebrow,
  title,
  description,
  actions,
  supportPanel,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  supportPanel?: React.ReactNode;
  className?: string;
}) {
  return (
    <Section className={cn("pt-10 pb-8 md:pt-14 md:pb-10", className)}>
      <div className="space-y-5">
        <div className="rounded-[2.35rem] border border-[color:var(--border-soft)] bg-white px-6 py-7 shadow-[0_28px_75px_rgba(39,28,33,0.08)] md:px-8 md:py-8">
          <div className="max-w-4xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[0.94] tracking-[-0.06em] text-[color:var(--ink-strong)] md:text-6xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)] md:text-base">{description}</p>
            {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </div>

        {supportPanel ? <div className="max-w-[32rem]">{supportPanel}</div> : null}
      </div>
    </Section>
  );
}

export function PostTemplate({
  eyebrow,
  title,
  description,
  meta,
  stickyRail,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: React.ReactNode;
  stickyRail?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <Section className={cn("pt-10 pb-8 md:pt-14 md:pb-10", className)}>
        <div className="rounded-[2.35rem] border border-[color:var(--border-soft)] bg-white px-6 py-7 shadow-[0_28px_75px_rgba(39,28,33,0.08)] md:px-8 md:py-8">
          <div className="flex flex-wrap items-center gap-2">
            <Eyebrow>{eyebrow}</Eyebrow>
            {meta}
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-extrabold leading-[0.94] tracking-[-0.06em] text-[color:var(--ink-strong)] md:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[color:var(--ink-soft)] md:text-base">{description}</p>
        </div>
      </Section>

      <Section className="pb-20 md:pb-28">
        <div className={cn("grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_23rem] xl:items-start", !stickyRail && "xl:grid-cols-1")}>
          <article className="rounded-[2.35rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_28px_75px_rgba(39,28,33,0.08)] md:p-9">
            {children}
          </article>
          {stickyRail ? <aside className="space-y-5 xl:sticky xl:top-28">{stickyRail}</aside> : null}
        </div>
      </Section>
    </>
  );
}
