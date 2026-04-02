import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { JourneyCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { fennaCampaign } from "@/lib/content/fenna";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { buildBreadcrumbSchema } from "@/lib/structured-data";
import { getPublicJourneys } from "@/lib/trips";

export const metadata: Metadata = generatePageMetadata({
  title: "Journeys | Umrah and Hajj departures from Kampala",
  description:
    "Browse Al Hilal journeys, compare dates and support, and see the featured July Fenna Umrah departure.",
  path: "/journeys",
});

export default async function JourneysPage() {
  const journeys = await getPublicJourneys();
  const featuredJourney = journeys.find((journey) => journey.slug === fennaCampaign.slug) ?? journeys[0];
  const remainingJourneys = journeys.filter((journey) => journey.slug !== featuredJourney?.slug);

  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Journeys", path: "/journeys" },
        ])}
      />

      <SinglePageTemplate
        eyebrow="Journeys"
        title="Compare Umrah and Hajj departures before you message the team."
        description="Start with dates, city mix, and price direction. Then speak to Al Hilal when you want help choosing the best fit for your household."
        actions={
          <>
            <TrackedLink
              href="/contact"
              eventName={analyticsEventNames.ctaContactClick}
              ctaLabel="journeys_help_choose"
              contextLabel="journeys_hero"
              className={buttonLinkClass("gold")}
            >
              Need help choosing?
            </TrackedLink>
            <TrackedLink
              href="/how-to-book"
              eventName={analyticsEventNames.ctaHowToBookClick}
              ctaLabel="journeys_how_to_book"
              contextLabel="journeys_hero"
              className={buttonLinkClass("outline")}
            >
              How to book
            </TrackedLink>
          </>
        }
      />

      <Section className="mt-6">
        <SectionIntro
          eyebrow="Current departures"
          title="A truthful journey calendar, featured first and then the rest."
          description="Each card now carries the month label, journey status, dates, default nights, package count, and published starting price before you open the detail page."
        />

        <div className="mt-8 grid gap-6">
          {featuredJourney ? <JourneyCard journey={featuredJourney} featuredLabel="Featured departure" variant="featured" /> : null}
          {remainingJourneys.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {remainingJourneys.map((journey) => (
                <JourneyCard key={journey.slug} journey={journey} variant="secondary" />
              ))}
            </div>
          ) : null}
        </div>
      </Section>
    </main>
  );
}
