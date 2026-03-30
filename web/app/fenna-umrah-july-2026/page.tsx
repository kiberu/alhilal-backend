import Image from "next/image";
import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { FeaturedCard, InfoCard } from "@/components/site/cards";
import { ConsultationForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Eyebrow, Section, SectionIntro } from "@/components/site/primitives";
import { SiteLogo } from "@/components/site/site-logo";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { fennaCampaign } from "@/lib/content/fenna";
import { generatePageMetadata } from "@/lib/seo-config";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structured-data";

export const metadata: Metadata = generatePageMetadata({
  title: "July Fenna Umrah 2026 | Answer Allah's Call with Al Hilal",
  description:
    "See July Fenna Umrah 2026 from Kampala with dates, price direction, inclusions, FAQs, and a direct WhatsApp path.",
  path: fennaCampaign.route,
});

export default function FennaLandingPage() {
  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "July Fenna Umrah 2026", path: fennaCampaign.route },
        ])}
      />
      <JsonLd data={buildFaqSchema(fennaCampaign.faqs)} />

      <SinglePageTemplate
        eyebrow={fennaCampaign.eyebrow}
        title={fennaCampaign.campaignLine}
        description="July Fenna is the featured departure for pilgrims who want a calmer booking path, stronger guidance before travel, and a team that keeps worship first."
        actions={
          <>
            <TrackedLink
              href="https://wa.me/256700773535"
              newTab
              action="fenna_landing_cta_click"
              category="conversion"
              label="fenna_whatsapp"
              className={buttonLinkClass("gold")}
            >
              Ask on WhatsApp
            </TrackedLink>
            <TrackedLink
              href="/contact"
              action="fenna_landing_cta_click"
              category="conversion"
              label="fenna_consultation"
              className={buttonLinkClass("default")}
            >
              Talk to Al Hilal
            </TrackedLink>
          </>
        }
        supportPanel={
          <FeaturedCard
            eyebrow="Featured from Kampala"
            title={fennaCampaign.title}
            description={fennaCampaign.summary}
            media={
              <div className="relative aspect-[1.08] overflow-hidden rounded-[1.6rem] bg-[color:var(--surface-muted)]">
                <Image
                  src={fennaCampaign.coverImage}
                  alt={`${fennaCampaign.title} campaign cover`}
                  fill
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="object-cover"
                />
              </div>
            }
            stats={fennaCampaign.heroStats}
            cta={
              <TrackedLink
                href={fennaCampaign.journeyRoute}
                action="fenna_landing_cta_click"
                category="conversion"
                label="fenna_detail_panel"
                className={buttonLinkClass("outline")}
              >
                See journey details
              </TrackedLink>
            }
          />
        }
      />

      <Section className="mt-6">
        <SectionIntro
          eyebrow="July Fenna"
          title="The key questions answered early."
          description="This page should make the basics easy to understand before anyone needs a long back-and-forth on WhatsApp."
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
          <FeaturedCard
            eyebrow="What pilgrims want to know first"
            title="Dates, support, family fit, and what the journey actually includes."
            description="Fenna should feel premium, but the page still has to answer the practical questions that help someone decide whether to enquire today or keep looking."
            media={
              <div className="relative aspect-[0.94] overflow-hidden rounded-[1.6rem] bg-[color:var(--surface-muted)]">
                <Image
                  src={fennaCampaign.proposalImage}
                  alt="Fenna marketing proposal media plan"
                  fill
                  sizes="(min-width: 1024px) 32vw, 100vw"
                  className="object-cover"
                />
              </div>
            }
          />
          <div className="grid gap-4">
            {fennaCampaign.highlights.map((highlight) => (
              <InfoCard key={highlight} icon={CheckCircle2} title="Included in the decision" description={highlight} />
            ))}
          </div>
        </div>
      </Section>

      <Section className="mt-20 grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro eyebrow="What is included" title="What comes with this departure." />
          <div className="mt-6 grid gap-3">
            {fennaCampaign.inclusions.map((item) => (
              <div key={item} className="flex gap-3 rounded-[1.5rem] bg-[color:var(--surface-tint)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[color:var(--brand-maroon)]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro eyebrow="What is not included" title="What pilgrims should budget for separately." />
          <div className="mt-6 grid gap-3">
            {fennaCampaign.exclusions.map((item) => (
              <div key={item} className="rounded-[1.5rem] bg-white px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)] shadow-[0_14px_30px_rgba(39,28,33,0.05)]">
                {item}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section className="mt-20">
        <SectionIntro
          eyebrow="Who this suits"
          title="A good option for pilgrims who want better preparation before they travel."
          description="July Fenna should feel relevant to real life, not like a generic package dropped onto a campaign page."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {fennaCampaign.variants.map((variant) => (
            <FeaturedCard key={variant.title} eyebrow="Pilgrim fit" title={variant.title} description={variant.body} />
          ))}
        </div>
      </Section>

      <Section className="mt-20 grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro eyebrow="Why pilgrims trust this departure" title="Trust built through practical care." />
          <div className="mt-6 grid gap-4">
            {fennaCampaign.trustPoints.map((point) => (
              <div key={point} className="rounded-[1.5rem] bg-[color:var(--surface-tint)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                {point}
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold tracking-[-0.04em] text-[color:var(--ink-strong)]">Frequently asked questions</h2>
          <div className="mt-5 grid gap-4">
            {fennaCampaign.faqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.6rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-5 py-5">
                <h3 className="text-base font-semibold text-[color:var(--ink-strong)]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.35rem] bg-[linear-gradient(145deg,_rgba(151,2,70,0.96),_rgba(109,5,53,0.94))] p-7 text-white shadow-[0_28px_75px_rgba(151,2,70,0.18)]">
          <div className="inline-flex rounded-[1.4rem] border border-white/16 bg-white/10 px-4 py-4">
            <SiteLogo variant="umrah" />
          </div>
          <div className="mt-5">
            <Eyebrow className="border-white/18 bg-white/10 text-white">Talk to Al Hilal</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-[0.96] tracking-[-0.05em] text-white md:text-5xl">
              Ask about July Fenna before places fill.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/80">
              If you already know your preferred month, your family situation, or your budget range, say that here and the team
              can pick up the conversation faster on WhatsApp.
            </p>
          </div>
          <ConsultationForm source="fenna_landing" contextLabel="fenna_campaign" tripName={fennaCampaign.title} className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
