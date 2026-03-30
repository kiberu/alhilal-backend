import Image from "next/image";

import { cn } from "@/lib/utils";

export type SiteLogoVariant = "landscape" | "portrait" | "umrah";

const logoMap: Record<
  SiteLogoVariant,
  { src: string; alt: string; width: number; height: number; className: string }
> = {
  landscape: {
    src: "/alhilal-assets/LOGO-landscape.svg",
    alt: "Al Hilal Travels Uganda",
    width: 200,
    height: 36,
    className: "w-[132px] sm:w-[156px] lg:w-[172px]",
  },
  portrait: {
    src: "/alhilal-assets/LOGO-POTRAIT.svg",
    alt: "Al Hilal Travels Uganda portrait logo",
    width: 150,
    height: 105,
    className: "w-[86px] sm:w-[96px]",
  },
  umrah: {
    src: "/alhilal-assets/umrah-logo.svg",
    alt: "Al Hilal Umrah campaign logo",
    width: 230,
    height: 125,
    className: "w-[118px] sm:w-[136px]",
  },
};

export function SiteLogo({
  variant = "landscape",
  className,
  priority = false,
}: {
  variant?: SiteLogoVariant;
  className?: string;
  priority?: boolean;
}) {
  const logo = logoMap[variant];

  return (
    <Image
      src={logo.src}
      alt={logo.alt}
      width={logo.width}
      height={logo.height}
      priority={priority}
      className={cn("h-auto", logo.className, className)}
    />
  );
}

