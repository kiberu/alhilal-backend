"use client";

import { usePathname } from "next/navigation";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { cn } from "@/lib/utils";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen bg-[color:var(--surface-page)] text-[color:var(--ink-strong)]">
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0",
          isHome
            ? "h-[40rem] bg-[radial-gradient(circle_at_top_left,_rgba(151,2,70,0.16),_transparent_28%),radial-gradient(circle_at_82%_14%,_rgba(249,160,40,0.22),_transparent_20%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(255,255,255,0)_100%)]"
            : "h-[22rem] bg-[radial-gradient(circle_at_top_left,_rgba(151,2,70,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(249,160,40,0.16),_transparent_20%),linear-gradient(180deg,_rgba(255,255,255,0.9),_rgba(255,255,255,0)_100%)]",
        )}
      />
      <div className="relative isolate overflow-x-hidden">
        <SiteHeader variant={isHome ? "home" : "inner"} />
        {children}
      </div>
      <SiteFooter />
    </div>
  );
}

