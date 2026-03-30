"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { event } from "@/lib/gtag";
import { cn } from "@/lib/utils";

type TrackedLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  category: string;
  action: string;
  label: string;
  newTab?: boolean;
};

export function TrackedLink({
  href,
  children,
  className,
  category,
  action,
  label,
  newTab,
}: TrackedLinkProps) {
  const handleClick = () => {
    event({ action, category, label });
  };

  const sharedClassName = cn(className);

  if (href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
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
    <Link href={href} onClick={handleClick} className={sharedClassName}>
      {children}
    </Link>
  );
}
