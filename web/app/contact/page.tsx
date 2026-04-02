import { Clock3, Mail, MapPin, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { InfoCard } from "@/components/site/cards";
import { ConsultationForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { analyticsEventNames } from "@/lib/gtag";
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
        description="Use this page if you want a proper consultation about dates, pricing, family travel, or what journey may fit you best. The form is the primary handoff, with WhatsApp and call available when you need a faster direct route."
        actions={
          <>
            <TrackedLink
              href="#consultation-form"
              eventName={analyticsEventNames.ctaConsultationClick}
              ctaLabel="contact_consultation"
              contextLabel="contact_hero"
              className={buttonLinkClass("gold")}
            >
              Start a consultation
            </TrackedLink>
            <TrackedLink
              href={siteConfig.social.whatsapp}
              newTab
              eventName={analyticsEventNames.ctaWhatsAppClick}
              ctaLabel="contact_whatsapp"
              contextLabel="contact_hero"
              className={buttonLinkClass("outline")}
            >
              Ask on WhatsApp
            </TrackedLink>
            <TrackedLink
              href={`tel:${siteConfig.phoneIntl}`}
              eventName={analyticsEventNames.ctaCallClick}
              ctaLabel="contact_phone"
              contextLabel="contact_hero"
              className={buttonLinkClass("outline")}
            >
              Call the office
            </TrackedLink>
          </>
        }
      />

      <Section className="mt-6 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div id="consultation-form" className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Tell us what you need"
            title="Give the team the context they need for a proper follow-up."
            description="Share the basics here and Al Hilal can respond with a clearer next step instead of starting from an improvised chat handoff."
          />
          <ConsultationForm source="contact" contextLabel="contact_consultation" className="mt-6" />
        </div>

        <div className="grid gap-4">
          <InfoCard icon={MessageCircle} title="Phone / WhatsApp" description={siteConfig.phoneDisplay} />
          <InfoCard icon={Mail} title="Email" description={`${siteConfig.email} for supporting details and scheduled follow-up`} />
          <InfoCard icon={MapPin} title="Office" description={siteConfig.addressLines.join(", ")} />
          <InfoCard icon={Clock3} title="Hours" description={`${siteConfig.officeHours.join(" · ")}. Consultation follow-up is handled by the team, not by an unattended mailbox.`} />
        </div>
      </Section>
    </main>
  );
}
