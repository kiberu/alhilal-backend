import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { PostCard } from "@/components/site/cards";
import { GuideRequestForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { guidanceArticles } from "@/lib/content/guidance";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { buildBreadcrumbSchema } from "@/lib/structured-data";

export const metadata: Metadata = generatePageMetadata({
  title: "Guidance | Questions Muslims ask before Umrah",
  description:
    "Read Al Hilal guidance on first-time Umrah, family planning, sponsor-assisted bookings, and what to sort out before you travel.",
  path: "/guidance",
});

export default function GuidanceHubPage() {
  const [leadArticle, ...otherArticles] = guidanceArticles;

  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guidance", path: "/guidance" },
        ])}
      />

      <SinglePageTemplate
        eyebrow="Guidance"
        title="Questions Muslims ask before Umrah."
        description="Start here if you are preparing for your first Umrah, travelling with family, or working out a sponsor-assisted booking from abroad."
        actions={
          <>
            <TrackedLink
              href="/how-to-book"
              eventName={analyticsEventNames.ctaHowToBookClick}
              ctaLabel="guidance_hub_how_to_book"
              contextLabel="guidance_hub_hero"
              className={buttonLinkClass("gold")}
            >
              How to book
            </TrackedLink>
            <TrackedLink
              href="/journeys"
              eventName={analyticsEventNames.ctaJourneysClick}
              ctaLabel="guidance_hub_journeys"
              contextLabel="guidance_hub_hero"
              className={buttonLinkClass("outline")}
            >
              See journeys
            </TrackedLink>
          </>
        }
      />

      <Section className="mt-6">
        <SectionIntro
          eyebrow="Start here"
          title="Read the guide that matches the question already on your mind."
          description="Start with the question you already have, then move into the right journey or a direct conversation with Al Hilal."
        />

        <div className="mt-8 grid gap-6">
          <PostCard article={leadArticle} variant="featured" />
          <div className="grid gap-6 md:grid-cols-2">
            {otherArticles.map((article) => (
              <PostCard key={article.slug} article={article} variant="post" />
            ))}
          </div>
        </div>
      </Section>

      <Section className="mt-20 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Planning resource"
            title="Not ready to choose a journey yet?"
            description="Use the slower nurture path here if you are still learning, comparing months, or trying to understand the process before you ask for live help."
          />
          <GuideRequestForm source="guidance_hub" contextLabel="guidance_hub_planning_guide" className="mt-6" />
        </div>

        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Next step"
            title="Move from reading into the right pilgrimage path."
            description="Read the booking pathway if you need process clarity, or move into the journey calendar if you are ready to compare departures."
          />
          <div className="mt-6 flex flex-wrap gap-3">
            <TrackedLink
              href="/how-to-book"
              eventName={analyticsEventNames.ctaHowToBookClick}
              ctaLabel="guidance_hub_next_how_to_book"
              contextLabel="guidance_hub_next_step"
              className={buttonLinkClass("gold")}
            >
              Read how booking works
            </TrackedLink>
            <TrackedLink
              href="/journeys"
              eventName={analyticsEventNames.ctaJourneysClick}
              ctaLabel="guidance_hub_next_journeys"
              contextLabel="guidance_hub_next_step"
              className={buttonLinkClass("outline")}
            >
              Browse journeys
            </TrackedLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
