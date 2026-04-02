import { BookOpenText, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { InfoCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { fennaCampaign } from "@/lib/content/fenna";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";
import { buildBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = generatePageMetadata({
  title: "About Al Hilal | A Kampala team for Umrah and Hajj",
  description:
    "Meet the Kampala-based Al Hilal team and see why pilgrims trust us for guided Umrah and Hajj from Uganda.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <SinglePageTemplate
        eyebrow="About Al Hilal"
        title="A Kampala team Muslims trust for Umrah and Hajj."
        description="Al Hilal helps pilgrims book, prepare, and travel with clearer communication, reachable support, and practical care before departure, during travel, and after return."
        actions={
          <>
            <TrackedLink
              href={fennaCampaign.route}
              eventName={analyticsEventNames.ctaJourneyDetailClick}
              ctaLabel="about_fenna"
              contextLabel="about_hero"
              className={buttonLinkClass("gold")}
            >
              See July Fenna
            </TrackedLink>
            <TrackedLink
              href="/contact"
              eventName={analyticsEventNames.ctaContactClick}
              ctaLabel="about_contact"
              contextLabel="about_hero"
              className={buttonLinkClass("outline")}
            >
              Talk to Al Hilal
            </TrackedLink>
          </>
        }
      />

      <Section className="mt-6">
        <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2.2rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
            <SectionIntro
              eyebrow="Why people come to us"
              title="Most pilgrims do not need hype. They need answers."
              description="People usually contact Al Hilal when they are trying to work out dates, budget, documents, rooming, or whether a journey suits their family. They want someone reachable in Kampala who can explain the process plainly."
            />
            <div className="mt-6 space-y-4 text-sm leading-7 text-[color:var(--ink-soft)]">
              <p>
                That is the job. We help pilgrims compare departures, understand what is included, prepare documents, and know
                what to expect before they pay. When a family member abroad is sponsoring the trip, we help make that process
                easier to understand too.
              </p>
              <p>
                Pilgrims can visit the office on {siteConfig.addressLines[1]}, call {siteConfig.phoneDisplay}, or start on
                WhatsApp. The aim is not to push people into a booking. The aim is to help them prepare properly and travel with
                less confusion.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
            <InfoCard
              icon={ShieldCheck}
              title="A reachable Kampala team"
              description={`Office: ${siteConfig.addressLines.join(", ")}. Phone and WhatsApp: ${siteConfig.phoneDisplay}.`}
            />
            <InfoCard
              icon={Users}
              title="Useful for first-timers and families"
              description="We plan for couples, family groups, elders, and sponsor-assisted bookings instead of treating them like unusual cases."
            />
            <InfoCard
              icon={BookOpenText}
              title="Clear guidance before payment"
              description="Pilgrims should know what is included, what is not, and what still needs to be prepared before they commit money."
            />
          </div>
        </div>
      </Section>

      <Section className="mt-20">
        <SectionIntro
          eyebrow="What shapes the service"
          title="Worship, safety, understanding, family, and honest money handling."
          description="The Maqasid are not just theory for us. They are a practical standard for how a pilgrimage service should speak, plan, and care for people."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            {
              title: "Din",
              body: "Keep worship central. Do not let the package, the sales language, or the schedule distract from why the pilgrim is travelling.",
            },
            {
              title: "Nafs",
              body: "Protect pilgrims through calmer planning, better communication, and practical care when travel becomes stressful or tiring.",
            },
            {
              title: "Aql",
              body: "Reduce confusion. Explain documents, timing, rooming, and next steps clearly so people can make better decisions.",
            },
            {
              title: "Nasl",
              body: "Make room for families, couples, elders, and group travel in the service itself, not only in the marketing language.",
            },
            {
              title: "Mal",
              body: "Handle money honestly. Be disciplined about pricing, what is included, and what a pilgrim still needs to budget for.",
            },
          ].map((item) => (
            <InfoCard key={item.title} icon={ShieldCheck} title={item.title} description={item.body} />
          ))}
        </div>
      </Section>
    </main>
  );
}
