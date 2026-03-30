"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";

import { SiteLogo } from "@/components/site/site-logo";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type HeaderVariant = "home" | "inner";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/journeys", label: "Journeys" },
  { href: "/how-to-book", label: "How to Book" },
  { href: "/guidance", label: "Guidance" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader({ variant }: { variant: HeaderVariant }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const activeLabel = useMemo(() => {
    const activeItem = navItems.find((item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
    if (activeItem) {
      return activeItem.label;
    }

    if (pathname.startsWith("/fenna-umrah-july-2026")) {
      return "July Fenna";
    }

    if (pathname.startsWith("/journeys/")) {
      return "Journeys";
    }

    if (pathname.startsWith("/guidance/")) {
      return "Guidance";
    }

    return "Al Hilal";
  }, [pathname]);

  const isHome = variant === "home";

  return (
    <header
      className={cn(
        "z-50 px-5 md:px-8",
        "sticky top-4 pt-4",
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-7xl overflow-hidden border shadow-[0_24px_55px_rgba(39,28,33,0.08)]",
          isHome
            ? "rounded-[2.2rem] border-[rgba(125,31,71,0.9)] bg-[linear-gradient(145deg,_rgba(125,31,71,1),_rgba(106,19,58,0.98))] text-white"
            : "rounded-[1.9rem] border-[color:var(--border-soft)] bg-[color:var(--surface-glass)] text-[color:var(--ink-strong)]",
        )}
      >
        <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div
              className={cn(
                "rounded-[1.4rem] border px-4 py-3 shadow-[0_18px_36px_rgba(39,28,33,0.14)]",
                isHome
                  ? "border-white/10 bg-[rgba(255,255,255,0.08)]"
                  : "border-[color:var(--border-soft)] bg-[linear-gradient(145deg,_rgba(151,2,70,1),_rgba(108,5,53,0.96))]",
              )}
            >
              <SiteLogo variant="landscape" priority={isHome} />
            </div>
            {!isHome ? (
              <div className="hidden min-w-[8.25rem] sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[color:var(--ink-muted)]">Current section</p>
                <p className="mt-1 text-sm font-semibold leading-[1.15] tracking-[-0.03em] text-[color:var(--ink-strong)]">{activeLabel}</p>
              </div>
            ) : null}
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition",
                    isHome
                      ? "text-white/78 hover:bg-white/10 hover:text-white"
                      : "text-[color:var(--ink-soft)] hover:bg-[color:var(--surface-tint)] hover:text-[color:var(--ink-strong)]",
                    isActive &&
                      (isHome
                        ? "bg-white/12 text-white"
                        : "bg-[color:var(--surface-tint)] text-[color:var(--brand-maroon)]"),
                  )}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href={isHome ? "/fenna-umrah-july-2026" : siteConfig.social.whatsapp}
              target={isHome ? undefined : "_blank"}
              rel={isHome ? undefined : "noreferrer"}
              className={cn(
                "ml-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5",
                isHome
                  ? "bg-[color:var(--gold-solid)] text-[color:var(--ink-strong)] shadow-[0_18px_40px_rgba(249,160,40,0.2)]"
                  : "bg-[color:var(--brand-maroon)] text-white shadow-[0_18px_40px_rgba(151,2,70,0.18)]",
              )}
            >
              {!isHome ? <MessageCircle className="h-4 w-4" /> : null}
              {isHome ? "See July Fenna" : "Ask on WhatsApp"}
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            className={cn(
              "inline-flex h-11 w-11 items-center justify-center rounded-full border lg:hidden",
              isHome
                ? "border-white/12 bg-white/8 text-white"
                : "border-[color:var(--border-soft)] bg-white text-[color:var(--ink-strong)]",
            )}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {isOpen ? (
          <div
            className={cn(
              "border-t px-4 py-4 lg:hidden",
              isHome
                ? "border-white/10 bg-[rgba(255,255,255,0.06)]"
                : "border-[color:var(--border-soft)] bg-[color:var(--surface-glass-strong)]",
            )}
          >
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "rounded-[1.4rem] px-4 py-3 text-sm font-medium transition",
                      isHome
                        ? "text-white/82 hover:bg-white/10 hover:text-white"
                        : "text-[color:var(--ink-soft)] hover:bg-[color:var(--surface-tint)] hover:text-[color:var(--ink-strong)]",
                      isActive &&
                        (isHome
                          ? "bg-white/10 text-white"
                          : "bg-[color:var(--surface-tint)] text-[color:var(--brand-maroon)]"),
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={isHome ? "/fenna-umrah-july-2026" : siteConfig.social.whatsapp}
                target={isHome ? undefined : "_blank"}
                rel={isHome ? undefined : "noreferrer"}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "mt-2 rounded-[1.4rem] px-4 py-3 text-sm font-semibold",
                  isHome ? "bg-[color:var(--gold-solid)] text-[color:var(--ink-strong)]" : "bg-[color:var(--brand-maroon)] text-white",
                )}
              >
                {isHome ? "See July Fenna" : "Ask on WhatsApp"}
              </Link>
            </nav>
          </div>
        ) : null}
      </div>
    </header>
  );
}
