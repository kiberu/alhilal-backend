import { Clock3, Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { InfoCard } from "@/components/site/cards";
import { ConsultationForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { generatePageMetadata } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";
import { buildBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = generatePageMetadata({
  title: "Contact Al Hilal | Talk to a real advisor",
  description:
    "Talk to Al Hilal about Umrah and Hajj journeys, July Fenna, dates, pricing, and family planning from Kampala.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <SinglePageTemplate
        eyebrow="Contact"
        title="Talk to a real Al Hilal advisor."
        description="Use this page if you want a proper conversation about dates, pricing, family travel, or what journey may fit you best. WhatsApp is still the fastest route."
        actions={
          <>
            <TrackedLink
              href={siteConfig.social.whatsapp}
              newTab
              action="contact_whatsapp_click"
              category="conversion"
              label="contact_whatsapp"
              className={buttonLinkClass("gold")}
            >
              Ask on WhatsApp
            </TrackedLink>
            <TrackedLink
              href={`tel:${siteConfig.phoneIntl}`}
              action="contact_phone_click"
              category="conversion"
              label="contact_phone"
              className={buttonLinkClass("outline")}
            >
              Call the office
            </TrackedLink>
          </>
        }
      />

      <Section className="mt-6 grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="grid gap-4">
          <InfoCard icon={MessageCircle} title="Phone / WhatsApp" description={siteConfig.phoneDisplay} />
          <InfoCard icon={Mail} title="Email" description={siteConfig.email} />
          <InfoCard icon={MapPin} title="Office" description={siteConfig.addressLines.join(", ")} />
          <InfoCard icon={Clock3} title="Hours" description={siteConfig.officeHours.join(" · ")} />
        </div>

        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Tell us what you need"
            title="Give the team a better starting point."
            description="Share the basics and the conversation can move faster on WhatsApp with less back-and-forth."
          />
          <ConsultationForm source="contact" contextLabel="contact_page" className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
