"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { type AnalyticsEventName, trackCtaClick } from "@/lib/gtag";
import { cn } from "@/lib/utils";

type TrackedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  eventName: AnalyticsEventName;
  ctaLabel: string;
  contextLabel?: string;
  pagePath?: string;
  source?: string;
  journeySlug?: string;
  articleSlug?: string;
  newTab?: boolean;
};

export function TrackedLink({
  href,
  children,
  className,
  eventName,
  ctaLabel,
  contextLabel,
  pagePath,
  source,
  journeySlug,
  articleSlug,
  newTab,
}: TrackedLinkProps) {
  const pathname = usePathname();

  const handleClick = () => {
    trackCtaClick(eventName, {
      pagePath: pagePath || pathname,
      contextLabel,
      ctaLabel,
      destination: href,
      source,
      journeySlug,
      articleSlug,
    });
  };

  const sharedClassName = cn(className);

  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("#")) {
    return (
      <a
        href={href}
        onClick={handleClick}
        target={newTab ? "_blank" : undefined}
        rel={newTab ? "noreferrer" : undefined}
        className={sharedClassName}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} onClick={handleClick} className={sharedClassName} prefetch={false}>
      {children}
    </Link>
  );
}
