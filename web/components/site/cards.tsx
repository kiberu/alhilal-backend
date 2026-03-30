import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, CalendarDays, Clock3, MapPin, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Eyebrow } from "@/components/site/primitives";
import type { GuidanceArticle } from "@/lib/content/guidance";
import { formatCityList, formatDateRange, formatMoney } from "@/lib/format";
import type { JourneyListItem } from "@/lib/trips";
import { cn } from "@/lib/utils";

const FALLBACK_MEDIA = "/alhilal-assets/Kaaba-hero.png";

export type CardVariant = "featured" | "secondary" | "info" | "stat" | "post";

function truncateText(text: string, limit: number) {
  if (text.length <= limit) {
    return text;
  }

  return `${text.slice(0, limit).trimEnd()}...`;
}

export function FeaturedCard({
  eyebrow,
  title,
  description,
  cta,
  media,
  stats,
  className,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  cta?: React.ReactNode;
  media?: React.ReactNode;
  stats?: Array<{ label: string; value: string }>;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_22px_55px_rgba(39,28,33,0.07)]",
        className,
      )}
    >
      {media ? <div className="overflow-hidden rounded-[1.6rem]">{media}</div> : null}
      <div className={cn("space-y-4", media ? "mt-5" : "")}>
        {eyebrow ? <Eyebrow className="bg-[color:var(--surface-tint)]">{eyebrow}</Eyebrow> : null}
        <div className="min-w-0">
          <h3 className="text-[1.45rem] font-bold leading-[1] tracking-[-0.05em] text-[color:var(--ink-strong)] md:text-[1.7rem]">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{description}</p>
          {cta ? <div className="mt-4">{cta}</div> : null}
        </div>
        {stats?.length ? (
          <div className="flex flex-wrap gap-2">
            {stats.map((stat) => (
              <span
                key={stat.label}
                className="rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-tint)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--ink-strong)]"
              >
                {stat.label}: {stat.value}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function InfoCard({
  icon: Icon,
  title,
  description,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-[1.8rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_18px_40px_rgba(39,28,33,0.05)]",
        className,
      )}
    >
      <div className="inline-flex rounded-full bg-[color:var(--surface-tint)] p-3 text-[color:var(--brand-maroon)]">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="mt-4 text-xl font-bold leading-[1.02] tracking-[-0.04em] text-[color:var(--ink-strong)]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{description}</p>
    </article>
  );
}

export function StatCard({
  value,
  label,
  description,
  className,
}: {
  value: string;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-[1.8rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-5 shadow-[0_18px_40px_rgba(39,28,33,0.05)]",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--ink-muted)]">{label}</p>
      <p className="mt-4 text-4xl font-bold leading-none tracking-[-0.06em] text-[color:var(--ink-strong)]">{value}</p>
      {description ? <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{description}</p> : null}
    </article>
  );
}

export function JourneyCard({
  journey,
  featuredLabel,
  variant = "secondary",
  className,
}: {
  journey: JourneyListItem;
  featuredLabel?: string;
  variant?: Extract<CardVariant, "featured" | "secondary">;
  className?: string;
}) {
  const imageSrc = journey.coverImage || FALLBACK_MEDIA;
  const summary = truncateText(journey.excerpt || "Dates, hotels, and support details for pilgrims leaving from Uganda.", variant === "featured" ? 180 : 100);
  const priceMatch = journey.seoDescription.match(/UGX[\s0-9.,A-Za-z]*/i)?.[0];

  if (variant === "featured") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-[2.3rem] border border-[color:var(--border-soft)] bg-white p-4 shadow-[0_24px_60px_rgba(39,28,33,0.08)]",
          className,
        )}
      >
        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="relative min-h-[19rem] overflow-hidden rounded-[1.9rem] bg-[color:var(--surface-muted)]">
            <Image
              src={imageSrc}
              alt={journey.name}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex h-full flex-col rounded-[1.9rem] bg-[color:var(--surface-card)] p-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[color:var(--surface-tint)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-maroon)]">
                {featuredLabel || "Featured departure"}
              </span>
              {journey.packagesCount ? (
                <span className="rounded-full bg-[color:var(--ink-strong)]/82 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
                  {journey.packagesCount} package{journey.packagesCount === 1 ? "" : "s"}
                </span>
              ) : null}
            </div>
            <h3 className="mt-5 text-[2rem] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--ink-strong)] md:text-[2.25rem]">
              {journey.name}
            </h3>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-[color:var(--ink-soft)]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                <CalendarDays className="h-4 w-4 text-[color:var(--brand-maroon)]" />
                {formatDateRange(journey.startDate, journey.endDate)}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                <MapPin className="h-4 w-4 text-[color:var(--brand-maroon)]" />
                {formatCityList(journey.cities)}
              </span>
              {priceMatch ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2">
                  <Wallet className="h-4 w-4 text-[color:var(--brand-maroon)]" />
                  {priceMatch}
                </span>
              ) : null}
            </div>
            <p className="mt-5 text-sm leading-7 text-[color:var(--ink-soft)]">{summary}</p>
            <Link
              href={`/journeys/${journey.slug}`}
              className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[color:var(--brand-maroon)]"
            >
              See dates and pricing
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-4 shadow-[0_22px_55px_rgba(39,28,33,0.07)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.7rem]">
        <div className="relative aspect-[1.06] bg-[color:var(--surface-muted)]">
          <Image
            src={imageSrc}
            alt={journey.name}
            fill
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/92 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-maroon)]">
            {journey.featured ? featuredLabel || "Featured" : "Journey"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <div className="flex flex-wrap gap-2 text-sm text-[color:var(--ink-soft)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-tint)] px-3 py-2">
            <CalendarDays className="h-4 w-4 text-[color:var(--brand-maroon)]" />
            {formatDateRange(journey.startDate, journey.endDate)}
          </span>
        </div>
        <h3 className="mt-4 text-[1.55rem] font-bold leading-[1.02] tracking-[-0.05em] text-[color:var(--ink-strong)]">{journey.name}</h3>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{summary}</p>
        <Link href={`/journeys/${journey.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[color:var(--brand-maroon)]">
          See dates and pricing
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function PostCard({
  article,
  variant = "post",
  className,
}: {
  article: GuidanceArticle;
  variant?: Extract<CardVariant, "featured" | "post">;
  className?: string;
}) {
  const summary = truncateText(article.description, variant === "featured" ? 160 : 92);

  if (variant === "featured") {
    return (
      <article
        className={cn(
          "overflow-hidden rounded-[2.3rem] border border-[color:var(--border-soft)] bg-white p-4 shadow-[0_24px_60px_rgba(39,28,33,0.08)]",
          className,
        )}
      >
        <div className="grid gap-5 lg:grid-cols-[1.04fr_0.96fr]">
          <div className="relative min-h-[18rem] overflow-hidden rounded-[1.9rem] bg-[color:var(--surface-muted)]">
            <Image
              src={article.imageSrc}
              alt={article.imageAlt}
              fill
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
            />
          </div>
          <div className="flex h-full flex-col rounded-[1.9rem] bg-[color:var(--surface-card)] p-5">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[color:var(--surface-tint)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--brand-maroon)]">
                {article.category}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
                <Clock3 className="h-3.5 w-3.5 text-[color:var(--brand-maroon)]" />
                {article.readingTime}
              </span>
            </div>
            <h3 className="mt-5 text-[1.9rem] font-bold leading-[0.98] tracking-[-0.05em] text-[color:var(--ink-strong)]">{article.title}</h3>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{summary}</p>
            <Link href={`/guidance/${article.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[color:var(--brand-maroon)]">
              Read this guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-4 shadow-[0_22px_55px_rgba(39,28,33,0.07)]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.7rem]">
        <div className="relative aspect-[1.02] bg-[color:var(--surface-muted)]">
          <Image
            src={article.imageSrc}
            alt={article.imageAlt}
            fill
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 46vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <div className="flex flex-wrap gap-2 text-sm text-[color:var(--ink-muted)]">
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-tint)] px-3 py-2">
            <Clock3 className="h-4 w-4 text-[color:var(--brand-maroon)]" />
            {article.readingTime}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-tint)] px-3 py-2">
            <BookOpenText className="h-4 w-4 text-[color:var(--brand-maroon)]" />
            {article.category}
          </span>
        </div>
        <h3 className="mt-4 text-[1.45rem] font-bold leading-[1.04] tracking-[-0.05em] text-[color:var(--ink-strong)]">{article.title}</h3>
        <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{summary}</p>
        <Link href={`/guidance/${article.slug}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[color:var(--brand-maroon)]">
          Read this guide
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export function PriceChip({
  minorUnits,
  currency,
}: {
  minorUnits?: number | null;
  currency?: string | null;
}) {
  const price = formatMoney(minorUnits, currency || "UGX");

  if (!price) {
    return null;
  }

  return (
    <span className="inline-flex rounded-full bg-[color:var(--surface-tint)] px-4 py-2 text-sm font-semibold text-[color:var(--ink-strong)]">
      From {price}
    </span>
  );
}
