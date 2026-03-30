import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebookF, faInstagram, faTiktok, faWhatsapp, faXTwitter } from "@fortawesome/free-brands-svg-icons";
import { Clock3, MapPin, MessageCircle, Phone } from "lucide-react";

import { SiteLogo } from "@/components/site/site-logo";
import { siteConfig } from "@/lib/site-config";

const footerLinks = [
  { href: "/journeys", label: "Journeys" },
  { href: "/how-to-book", label: "How to Book" },
  { href: "/guidance", label: "Guidance" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

const socialItems = [
  { key: "instagram", label: "Instagram", href: siteConfig.social.instagram, icon: faInstagram },
  { key: "tiktok", label: "TikTok", href: siteConfig.social.tiktok, icon: faTiktok },
  { key: "facebook", label: "Facebook", href: siteConfig.social.facebook, icon: faFacebookF },
  { key: "x", label: "X", href: siteConfig.social.x, icon: faXTwitter },
  { key: "whatsapp", label: "WhatsApp", href: siteConfig.social.whatsapp, icon: faWhatsapp },
] as const;

export function SiteFooter() {
  return (
    <footer className="px-5 pb-8 pt-8 md:px-8 md:pb-10">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.8rem] bg-[linear-gradient(145deg,_rgba(31,20,25,1),_rgba(80,10,40,0.96))] text-white shadow-[0_28px_90px_rgba(39,28,33,0.22)]">
        <div className="grid gap-8 border-b border-white/10 px-6 py-8 md:grid-cols-[1.12fr_0.88fr] md:px-8 md:py-10">
          <div className="space-y-5">
            <div className="inline-flex rounded-[1.5rem] border border-white/10 bg-white/7 px-4 py-4">
              <SiteLogo variant="landscape" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/58">Keep worship first</p>
              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-[0.94] tracking-[-0.05em] text-white md:text-5xl">
                Guided Umrah and Hajj from Kampala, with planning that feels clear from the first question.
              </h2>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/6 p-5 text-sm leading-7 text-white/76">
            <p>
              Al Hilal helps Muslims travel for Umrah and Hajj with clearer preparation, family-aware care, and a team that
              stays close before departure, during travel, and after return.
            </p>
            <a
              href={siteConfig.social.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 font-semibold text-white transition hover:bg-white/14"
            >
              <MessageCircle className="h-4 w-4" />
              Ask on WhatsApp
            </a>
          </div>
        </div>

        <div className="grid gap-12 px-6 py-10 md:grid-cols-[1.15fr_0.8fr_0.95fr] md:px-8">
          <div className="space-y-5">
            <p className="max-w-xl text-sm leading-7 text-white/72">
              Dates, pricing, family support, sponsor-led bookings, and guidance articles are all here to help pilgrims move
              forward with more certainty.
            </p>
            <div className="space-y-3 text-sm leading-7 text-white/68">
              <p className="inline-flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {siteConfig.phoneDisplay}
              </p>
              <p>{siteConfig.email}</p>
              <p className="inline-flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 shrink-0" />
                <span>{siteConfig.addressLines.join(", ")}</span>
              </p>
              <p className="inline-flex items-start gap-2">
                <Clock3 className="mt-1 h-4 w-4 shrink-0" />
                <span>{siteConfig.officeHours.join(" · ")}</span>
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">Explore</p>
            <div className="mt-5 flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm text-white/76 transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/52">Follow Al Hilal</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {socialItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-white/74 transition hover:bg-white/10 hover:text-white"
                >
                  <FontAwesomeIcon icon={item.icon} className="h-3.5 w-3.5" />
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
