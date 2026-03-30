import { buildCanonicalUrl } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";
import type { JourneyDetail } from "@/lib/trips";

export function buildBreadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export function buildFaqSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function buildArticleSchema(article: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    mainEntityOfPage: buildCanonicalUrl(article.path),
    publisher: {
      "@type": "Organization",
      name: siteConfig.businessName,
      url: siteConfig.siteUrl,
    },
  };
}

export function buildTouristTripSchema(journey: JourneyDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: journey.name,
    description: journey.seoDescription || journey.excerpt || journey.name,
    touristType: "Muslim pilgrims",
    itinerary: journey.itinerary.map((item) => ({
      "@type": "Place",
      name: item.title,
      description: item.notes || item.location || item.title,
    })),
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.businessName,
      url: siteConfig.siteUrl,
      telephone: siteConfig.phoneDisplay,
    },
    offers: journey.packages.map((packageItem) => ({
      "@type": "Offer",
      name: packageItem.name,
      priceCurrency: packageItem.currency || "UGX",
      price: packageItem.priceMinorUnits || undefined,
      availability: "https://schema.org/InStock",
      url: buildCanonicalUrl(`/journeys/${journey.slug}`),
    })),
  };
}
