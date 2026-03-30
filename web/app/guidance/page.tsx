import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { PostCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { guidanceArticles } from "@/lib/content/guidance";
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
              href="/journeys"
              action="guidance_hub_journeys_click"
              category="navigation"
              label="guidance_hub_journeys"
              className={buttonLinkClass("gold")}
            >
              See journeys
            </TrackedLink>
            <TrackedLink
              href="/contact"
              action="guidance_hub_contact_click"
              category="conversion"
              label="guidance_hub_contact"
              className={buttonLinkClass("outline")}
            >
              Talk to Al Hilal
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
    </main>
  );
}
