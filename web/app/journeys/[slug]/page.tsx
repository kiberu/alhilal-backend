import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { FeaturedCard, PriceChip } from "@/components/site/cards";
import { ConsultationForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { fennaCampaign } from "@/lib/content/fenna";
import { formatDateRange, formatMoney } from "@/lib/format";
import { generatePageMetadata } from "@/lib/seo-config";
import { buildBreadcrumbSchema, buildFaqSchema, buildTouristTripSchema } from "@/lib/structured-data";
import { getPublicJourneyBySlug } from "@/lib/trips";

type JourneyPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: JourneyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const journey = await getPublicJourneyBySlug(slug);

  if (!journey) {
    return generatePageMetadata({
      title: "Journey not found",
      description: "The requested journey could not be found.",
      path: `/journeys/${slug}`,
    });
  }

  return generatePageMetadata({
    title: journey.seoTitle || `${journey.name} | Al Hilal journeys`,
    description: journey.seoDescription || journey.excerpt || journey.name,
    path: `/journeys/${journey.slug}`,
  });
}

export default async function JourneyDetailPage({ params }: JourneyPageProps) {
  const { slug } = await params;
  const journey = await getPublicJourneyBySlug(slug);

  if (!journey) {
    notFound();
  }

  const isFennaJourney = journey.slug === fennaCampaign.slug;
  const journeyFaqs = journey.faqs.map((faq) => ({ question: faq.question, answer: faq.answer }));
  const heroImage = isFennaJourney ? fennaCampaign.coverImage : journey.coverImage || "/alhilal-assets/Kaaba-hero.png";

  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Journeys", path: "/journeys" },
          { name: journey.name, path: `/journeys/${journey.slug}` },
        ])}
      />
      {journeyFaqs.length ? <JsonLd data={buildFaqSchema(journeyFaqs)} /> : null}
      <JsonLd data={buildTouristTripSchema(journey)} />

      <SinglePageTemplate
        eyebrow={journey.featured ? "Featured journey" : "Journey detail"}
        title={journey.name}
        description={journey.excerpt || journey.seoDescription || "Dates, package details, and practical support for this Al Hilal departure."}
        actions={
          <>
            <TrackedLink
              href={isFennaJourney ? fennaCampaign.route : "/contact"}
              action="journey_detail_primary_cta"
              category="conversion"
              label={journey.slug}
              className={buttonLinkClass("gold")}
            >
              {isFennaJourney ? "See July Fenna" : "Talk to Al Hilal"}
            </TrackedLink>
            <TrackedLink
              href="https://wa.me/256700773535"
              newTab
              action="journey_detail_whatsapp_click"
              category="conversion"
              label={journey.slug}
              className={buttonLinkClass("outline")}
            >
              Ask on WhatsApp
            </TrackedLink>
          </>
        }
        supportPanel={
          <FeaturedCard
            eyebrow="At a glance"
            title={formatDateRange(journey.startDate, journey.endDate)}
            description={
              journey.packages[0]?.priceMinorUnits
                ? `Starting from ${formatMoney(journey.packages[0].priceMinorUnits, journey.packages[0].currency || "UGX")}. Use this as a starting point before you speak to the team.`
                : "Use the package details below to understand this departure before you enquire."
            }
            media={
              <div className="relative aspect-[1.08] overflow-hidden rounded-[1.6rem] bg-[color:var(--surface-muted)]">
                <Image
                  src={heroImage}
                  alt={journey.name}
                  fill
                  sizes="(min-width: 1024px) 20rem, 100vw"
                  className="object-cover"
                />
              </div>
            }
            cta={
              isFennaJourney ? (
                <TrackedLink
                  href={fennaCampaign.route}
                  action="journey_detail_primary_cta"
                  category="conversion"
                  label={`${journey.slug}_campaign`}
                  className={buttonLinkClass("outline")}
                >
                  See July Fenna
                </TrackedLink>
              ) : undefined
            }
          />
        }
      />

      <Section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro eyebrow="Quick facts" title="What to know first." />
          <div className="mt-6 grid gap-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            <div>
              <strong className="text-[color:var(--ink-strong)]">Dates:</strong> {formatDateRange(journey.startDate, journey.endDate)}
            </div>
            <div>
              <strong className="text-[color:var(--ink-strong)]">Cities:</strong> {journey.cities.join(", ")}
            </div>
            <div>
              <strong className="text-[color:var(--ink-strong)]">Package count:</strong> {journey.packagesCount}
            </div>
            {journey.packages[0]?.priceMinorUnits ? (
              <div>
                <strong className="text-[color:var(--ink-strong)]">Starting from:</strong>{" "}
                {formatMoney(journey.packages[0].priceMinorUnits, journey.packages[0].currency || "UGX")}
              </div>
            ) : null}
          </div>

          {isFennaJourney ? (
            <Link href={fennaCampaign.route} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-maroon)]">
              Go to the dedicated July Fenna page
            </Link>
          ) : null}
        </div>

        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Packages and pricing"
            title="See what is included before you decide if this departure fits."
            description="Start with the practical details here, then message Al Hilal if you want help comparing rooming, price, or timing."
          />

          <div className="mt-8 grid gap-4">
            {journey.packages.map((packageItem) => (
              <div key={packageItem.id} className="rounded-[1.8rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_16px_36px_rgba(39,28,33,0.05)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">{packageItem.name}</h3>
                  <PriceChip minorUnits={packageItem.priceMinorUnits} currency={packageItem.currency || "UGX"} />
                </div>
                {packageItem.hotels.length ? (
                  <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                    Hotels: {packageItem.hotels.map((hotel) => hotel.name).join(", ")}
                  </p>
                ) : (
                  <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                    Final package specifics are confirmed during consultation and final approval.
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {journey.guideSections.length ? (
        <Section className="mt-20">
          <SectionIntro
            eyebrow="Before you travel"
            title="What Al Hilal wants pilgrims to understand before departure."
            description="These notes keep the journey page focused on preparation, not just package display."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {journey.guideSections.map((section) => (
              <div key={section.id} className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(39,28,33,0.06)]">
                <h3 className="text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">{section.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{section.contentMd}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="mt-20 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro eyebrow="Frequently asked questions" title="Common questions before booking." />
          <div className="mt-6 grid gap-4">
            {journey.faqs.map((faq) => (
              <div key={faq.id} className="rounded-[1.6rem] bg-[color:var(--surface-tint)] px-5 py-5">
                <h3 className="text-base font-semibold text-[color:var(--ink-strong)]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Still comparing?"
            title="Ask about this departure before you book it."
            description="Use the form if you want the team to reply with more context around dates, pricing, rooming, or family needs."
          />
          <ConsultationForm source="journey_detail" contextLabel={journey.slug} tripName={journey.name} className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
