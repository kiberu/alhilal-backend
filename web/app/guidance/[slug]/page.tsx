import { Clock3, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { FeaturedCard, InfoCard } from "@/components/site/cards";
import { GuideRequestForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Eyebrow } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { PostTemplate } from "@/components/site/templates";
import { getGuidanceArticle } from "@/lib/content/guidance";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { buildArticleSchema, buildBreadcrumbSchema } from "@/lib/structured-data";

type GuidancePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: GuidancePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getGuidanceArticle(slug);

  if (!article) {
    return generatePageMetadata({
      title: "Guidance not found",
      description: "The requested article could not be found.",
      path: `/guidance/${slug}`,
    });
  }

  return generatePageMetadata({
    title: `${article.title} | Al Hilal Guidance`,
    description: article.description,
    path: `/guidance/${article.slug}`,
    type: "article",
  });
}

export default async function GuidanceArticlePage({ params }: GuidancePageProps) {
  const { slug } = await params;
  const article = getGuidanceArticle(slug);

  if (!article) {
    notFound();
  }

  const primaryEventName =
    article.ctaHref === "/contact"
      ? analyticsEventNames.ctaContactClick
      : article.ctaHref === "/how-to-book"
        ? analyticsEventNames.ctaHowToBookClick
        : analyticsEventNames.ctaJourneyDetailClick;
  const secondaryEventName =
    article.secondaryCtaHref === "/journeys"
      ? analyticsEventNames.ctaJourneysClick
      : article.secondaryCtaHref === "/contact"
        ? analyticsEventNames.ctaContactClick
        : analyticsEventNames.ctaHowToBookClick;

  return (
    <main>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Guidance", path: "/guidance" },
          { name: article.title, path: `/guidance/${article.slug}` },
        ])}
      />
      <JsonLd
        data={buildArticleSchema({
          title: article.title,
          description: article.description,
          path: `/guidance/${article.slug}`,
        })}
      />

      <PostTemplate
        eyebrow={article.category}
        title={article.title}
        description={article.intro}
        meta={
          <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--surface-tint)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
            <Clock3 className="h-3.5 w-3.5 text-[color:var(--brand-maroon)]" />
            {article.readingTime}
          </span>
        }
        stickyRail={
          <>
            <FeaturedCard
              eyebrow="Related journey"
              title={article.ctaTitle}
              description={article.ctaDescription}
              cta={
                <TrackedLink
                  href={article.ctaHref}
                  eventName={primaryEventName}
                  ctaLabel="guidance_article_primary"
                  contextLabel={article.slug}
                  articleSlug={article.slug}
                  className={buttonLinkClass("gold")}
                >
                  {article.ctaTitle}
                </TrackedLink>
              }
            />
            <InfoCard
              icon={MessageCircle}
              title="Need the slower path?"
              description="Use the planning guide request if this article helped but you are still in the learning and timing stage."
            />
            <GuideRequestForm source="guidance_article" contextLabel={`guidance_article_${article.slug}_planning_guide`} className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_20px_50px_rgba(39,28,33,0.06)]" />
            <TrackedLink
              href={article.secondaryCtaHref}
              eventName={secondaryEventName}
              ctaLabel="guidance_article_secondary"
              contextLabel={article.slug}
              articleSlug={article.slug}
              className={buttonLinkClass("outline")}
            >
              {article.secondaryCtaTitle}
            </TrackedLink>
          </>
        }
      >
        <div className="space-y-10">
          {article.sections.map((section) => (
            <section key={section.title}>
              <Eyebrow>{section.title}</Eyebrow>
              <div className="mt-5 space-y-4 text-sm leading-8 text-[color:var(--ink-soft)] md:text-base">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-5 grid gap-3 text-sm leading-7 text-[color:var(--ink-soft)]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet} className="rounded-[1.4rem] bg-[color:var(--surface-tint)] px-4 py-4">
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="rounded-[1.9rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-5">
            <Eyebrow>Next step</Eyebrow>
            <h2 className="mt-4 text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">{article.ctaTitle}</h2>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{article.ctaDescription}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TrackedLink
                href={article.ctaHref}
                eventName={primaryEventName}
                ctaLabel="guidance_article_end_primary"
                contextLabel={article.slug}
                articleSlug={article.slug}
                className={buttonLinkClass("gold")}
              >
                {article.ctaTitle}
              </TrackedLink>
              <TrackedLink
                href={article.secondaryCtaHref}
                eventName={secondaryEventName}
                ctaLabel="guidance_article_end_secondary"
                contextLabel={article.slug}
                articleSlug={article.slug}
                className={buttonLinkClass("outline")}
              >
                {article.secondaryCtaTitle}
              </TrackedLink>
            </div>
            <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">{article.secondaryCtaDescription}</p>
          </section>
        </div>
      </PostTemplate>
    </main>
  );
}
