import { Clock3, MessageCircle } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { FeaturedCard, InfoCard } from "@/components/site/cards";
import { JsonLd } from "@/components/site/json-ld";
import { Eyebrow } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { PostTemplate } from "@/components/site/templates";
import { getGuidanceArticle } from "@/lib/content/guidance";
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
                  action="guidance_article_cta_click"
                  category="conversion"
                  label={article.slug}
                  className={buttonLinkClass("gold")}
                >
                  See the related journey
                </TrackedLink>
              }
            />
            <InfoCard
              icon={MessageCircle}
              title="Need help deciding?"
              description="If the guide answers part of your question, talk to Al Hilal directly for dates, fit, and booking help."
            />
            <TrackedLink
              href="/contact"
              action="guidance_article_contact_click"
              category="conversion"
              label={article.slug}
              className={buttonLinkClass("outline")}
            >
              Talk to Al Hilal
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
        </div>
      </PostTemplate>
    </main>
  );
}
