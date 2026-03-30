import type { MetadataRoute } from "next";

import { guidanceArticles } from "@/lib/content/guidance";
import { fennaCampaign } from "@/lib/content/fenna";
import { siteConfig } from "@/lib/site-config";
import { getPublicJourneys } from "@/lib/trips";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const journeys = await getPublicJourneys();
  const now = new Date();

  const staticRoutes = [
    "/",
    "/journeys",
    "/how-to-book",
    "/guidance",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    fennaCampaign.route,
  ];

  return [
    ...staticRoutes.map((path) => ({
      url: `${siteConfig.siteUrl}${path}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: path === "/" ? 1 : path === fennaCampaign.route ? 0.95 : 0.8,
    })),
    ...journeys.map((journey) => ({
      url: `${siteConfig.siteUrl}/journeys/${journey.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: journey.slug === fennaCampaign.slug ? 0.92 : 0.78,
    })),
    ...guidanceArticles.map((article) => ({
      url: `${siteConfig.siteUrl}/guidance/${article.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.68,
    })),
  ];
}
