import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { JourneyCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { fennaCampaign } from "@/lib/content/fenna";
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
              href={fennaCampaign.route}
              action="journeys_featured_trip_click"
              category="conversion"
              label="journeys_fenna"
              className={buttonLinkClass("gold")}
            >
              See July Fenna
            </TrackedLink>
            <TrackedLink
              href="/how-to-book"
              action="journeys_how_to_book_click"
              category="navigation"
              label="journeys_how_to_book"
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
          title="Featured first, then the rest."
          description="The featured journey gets the strongest emphasis, but every departure should still make it easy to compare dates, support, and the next step."
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
