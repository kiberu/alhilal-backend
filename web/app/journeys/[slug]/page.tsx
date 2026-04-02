import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { JourneyDetailView } from "@/components/site/journey-detail-view";
import { JsonLd } from "@/components/site/json-ld";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { fennaCampaign } from "@/lib/content/fenna";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";
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
              href={siteConfig.social.whatsapp}
              newTab
              eventName={analyticsEventNames.ctaWhatsAppClick}
              ctaLabel="journey_detail_whatsapp"
              contextLabel={journey.slug}
              journeySlug={journey.slug}
              className={buttonLinkClass("gold")}
            >
              Ask on WhatsApp
            </TrackedLink>
            <TrackedLink
              href="#consultation-form"
              eventName={analyticsEventNames.ctaConsultationClick}
              ctaLabel="journey_detail_consultation"
              contextLabel={journey.slug}
              journeySlug={journey.slug}
              className={buttonLinkClass("outline")}
            >
              Start a consultation
            </TrackedLink>
          </>
        }
      />

      <JourneyDetailView
        journey={journey}
        heroImage={heroImage}
        isFennaJourney={isFennaJourney}
        campaignRoute={fennaCampaign.route}
      />
    </main>
  );
}
