import { ArrowRight, CalendarDays, MessageCircle, ShieldCheck, Users } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { FeaturedCard, InfoCard, JourneyCard, PostCard, StatCard } from "@/components/site/cards";
import { ConsultationForm, GuideRequestForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Eyebrow, Section, SectionIntro } from "@/components/site/primitives";
import { SiteLogo } from "@/components/site/site-logo";
import { TrackedLink } from "@/components/site/tracked-link";
import { FrontPageTemplate } from "@/components/site/templates";
import { guidanceArticles } from "@/lib/content/guidance";
import { fennaCampaign } from "@/lib/content/fenna";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { siteConfig } from "@/lib/site-config";
import { buildBreadcrumbSchema } from "@/lib/structured-data";
import { getPublicJourneys } from "@/lib/trips";

export const metadata: Metadata = generatePageMetadata({
  title: "Al Hilal Travels Uganda | Guided Umrah and Hajj from Kampala",
  description:
    "Guided Umrah and Hajj from Kampala. See July Fenna, compare journeys, and talk to Al Hilal on WhatsApp with worship kept first.",
  path: "/",
});

export default async function HomePage() {
  const journeys = await getPublicJourneys();
  const featuredJourney = journeys.find((journey) => journey.slug === fennaCampaign.slug) ?? journeys[0];
  const supportingJourneys = journeys.filter((journey) => journey.slug !== featuredJourney?.slug).slice(0, 2);
  const [leadArticle, ...secondaryArticles] = guidanceArticles;

  return (
    <main className="pb-20 md:pb-28">
      <JsonLd data={buildBreadcrumbSchema([{ name: "Home", path: "/" }])} />

      <FrontPageTemplate
        eyebrow="Umrah and Hajj from Kampala"
        supportLine={siteConfig.masterBrandLine}
        title="Plan your Umrah or Hajj with a Kampala team that keeps worship first."
        description="Al Hilal helps Ugandan Muslims move from first question to final booking with clear dates, family-aware care, and real human support on WhatsApp."
        imageSrc={fennaCampaign.heroImage}
        imageAlt="Pilgrims near the Kaaba under a bright sky"
        primaryAction={
          <TrackedLink
            href={siteConfig.social.whatsapp}
            newTab
            eventName={analyticsEventNames.ctaWhatsAppClick}
            ctaLabel="homepage_hero_whatsapp"
            contextLabel="homepage_hero"
            className={buttonLinkClass("gold")}
          >
            <MessageCircle className="h-4 w-4" />
            Ask on WhatsApp
          </TrackedLink>
        }
        secondaryAction={
          <TrackedLink
            href="/journeys"
            eventName={analyticsEventNames.ctaJourneysClick}
            ctaLabel="homepage_hero_journeys"
            contextLabel="homepage_hero"
            className={buttonLinkClass("default")}
          >
            Browse journeys
          </TrackedLink>
        }
        proofChips={[
          { icon: ShieldCheck, label: "Licensed and trusted" },
          { icon: Users, label: "Family-aware care" },
          { icon: CalendarDays, label: "Structured follow-up" },
        ]}
        supportRow={
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <h2 className="sr-only">Featured July departure</h2>
              <FeaturedCard
                eyebrow="Featured July departure"
                title={fennaCampaign.title}
                description={fennaCampaign.summary}
                media={
                  <div className="flex h-24 items-center justify-center rounded-[1.6rem] bg-[linear-gradient(145deg,_rgba(151,2,70,1),_rgba(108,5,53,0.96))] px-5 py-4 shadow-[0_18px_36px_rgba(151,2,70,0.16)]">
                    <SiteLogo variant="umrah" />
                  </div>
                }
                stats={fennaCampaign.heroStats}
                cta={
                  <TrackedLink
                    href={fennaCampaign.route}
                    eventName={analyticsEventNames.ctaJourneyDetailClick}
                    ctaLabel="homepage_featured_journey"
                    contextLabel="homepage_featured_panel"
                    journeySlug={fennaCampaign.slug}
                    className={buttonLinkClass("outline")}
                  >
                    Check dates and pricing
                  </TrackedLink>
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <InfoCard
                icon={ShieldCheck}
                title="Worship first"
                description="Flights, hotels, and practical guidance are handled with the goal of making worship easier, not more confusing."
              />
              <InfoCard
                icon={Users}
                title="Good for households"
                description="Helpful for first-timers, couples, families, and sponsor-assisted bookings that need clearer communication."
              />
            </div>
          </div>
        }
      />

      <Section className="deferred-section mt-16">
        <div className="grid gap-6 xl:items-start xl:grid-cols-[1.08fr_0.92fr]">
          <div className="rounded-[2.3rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.08)]">
            <Eyebrow>Why Al Hilal</Eyebrow>
            <h2 className="mt-4 max-w-3xl text-3xl font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--ink-strong)] md:text-5xl">
              Clear planning matters before you ever reach the airport.
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-[color:var(--ink-soft)]">
              <p>
                People trust Al Hilal when the communication is clear, the support feels human, and the journey is organised in
                a way that protects worship instead of crowding it out.
              </p>
              <p>
                The site is built to help pilgrims compare journeys, understand booking, and ask better questions before they
                commit.
              </p>
            </div>
            <TrackedLink
              href="/about"
              eventName={analyticsEventNames.ctaAboutClick}
              ctaLabel="homepage_about"
              contextLabel="homepage_why_al_hilal"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-maroon)]"
            >
              Why pilgrims in Uganda trust Al Hilal
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard
              value="8 nights"
              label="Fenna duration"
              description="A focused July route for pilgrims who want a mid-year Umrah option."
            />
            <StatCard
              value="UGX 4.65M"
              label="Starting from"
              description="Price direction is visible early, before anyone needs a long enquiry."
            />
            <InfoCard
              icon={MessageCircle}
              title="WhatsApp first"
              description="Ask a real question, get a real answer, and move into a more useful conversation with the team."
              className="sm:col-span-2"
            />
          </div>
        </div>
      </Section>

      <Section className="deferred-section mt-20">
        <SectionIntro
          eyebrow="Journeys"
          title="Choose the departure that fits your dates, household, and budget."
          description="Start with the featured journey, then compare the rest. Each card should make it easier to ask the right question before you book."
          action={
            <TrackedLink
              href="/journeys"
              eventName={analyticsEventNames.ctaJourneysClick}
              ctaLabel="homepage_journeys_section"
              contextLabel="homepage_journeys_intro"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-maroon)]"
            >
              See all journeys
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          }
        />

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
          {featuredJourney ? <JourneyCard journey={featuredJourney} featuredLabel="Current focus" variant="featured" /> : null}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1">
            {supportingJourneys.map((journey) => (
              <JourneyCard key={journey.slug} journey={journey} variant="secondary" />
            ))}
            <FeaturedCard
              eyebrow="Need help choosing?"
              title="If two departures look close, ask before you book."
              description="A short WhatsApp conversation can help you compare dates, rooming, pricing, and whether a journey suits your household before you commit."
              cta={
                <TrackedLink
                  href="/contact"
                  eventName={analyticsEventNames.ctaContactClick}
                  ctaLabel="homepage_journeys_help"
                  contextLabel="homepage_journeys_sidebar"
                  className={buttonLinkClass("default")}
                >
                  Get help choosing
                </TrackedLink>
              }
            />
          </div>
        </div>
      </Section>

      <Section className="deferred-section mt-20">
        <SectionIntro
          eyebrow="Service style"
          title="What pilgrims should feel before they book."
          description="Good sacred-travel service should sound clear, feel human, and answer practical questions without pushing people."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard
            icon={ShieldCheck}
            title="Licensed operator"
            description="A serious pilgrimage journey starts with a team people can trust to organise the basics well."
          />
          <InfoCard
            icon={Users}
            title="Family-aware care"
            description="Rooming, sponsor questions, first-timer worries, and household planning are treated as normal, not as exceptions."
          />
          <InfoCard
            icon={CalendarDays}
            title="Clear timing"
            description="Dates, package direction, and travel windows are shown early so pilgrims can plan with more honesty."
          />
          <InfoCard
            icon={MessageCircle}
            title="Real human support"
            description="When pilgrims ask on WhatsApp, they should reach a team that understands what they are trying to work out."
          />
        </div>
      </Section>

      <Section className="deferred-section mt-20">
        <SectionIntro
          eyebrow="Guidance"
          title="Start with the question you already have."
          description="These guides are written for Muslims planning Umrah from Uganda, especially first-timers, families, and people working with relatives abroad."
          action={
            <TrackedLink
              href="/guidance"
              eventName={analyticsEventNames.ctaGuidanceHubClick}
              ctaLabel="homepage_guidance_section"
              contextLabel="homepage_guidance_intro"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-maroon)]"
            >
              Visit the guidance hub
              <ArrowRight className="h-4 w-4" />
            </TrackedLink>
          }
        />

        <div className="mt-8 grid gap-6">
          <PostCard article={leadArticle} variant="featured" />
          <div className="grid gap-6 md:grid-cols-2">
            {secondaryArticles.map((article) => (
              <PostCard key={article.slug} article={article} variant="post" />
            ))}
          </div>
        </div>
      </Section>

      <Section className="deferred-section mt-20 grid gap-6 xl:grid-cols-2">
        <div id="structured-consultation" className="rounded-[2.35rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_28px_75px_rgba(39,28,33,0.08)]">
          <Eyebrow>Structured consultation</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--ink-strong)] md:text-5xl">
            Share the important details before the team follows up.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            This is the structured-enquiry path for first-timers, families, and anyone comparing dates or budget before choosing a departure.
          </p>
          <ConsultationForm source="homepage" contextLabel="homepage_structured_consultation" tripName={featuredJourney?.name} className="mt-6" />
        </div>

        <div id="planning-guide-form" className="rounded-[2.35rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_28px_75px_rgba(39,28,33,0.08)]">
          <Eyebrow>Planning guide</Eyebrow>
          <h2 className="mt-4 text-3xl font-bold leading-[0.96] tracking-[-0.05em] text-[color:var(--ink-strong)] md:text-5xl">
            Want a simple guide before you choose a journey?
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            Ask for the Al Hilal planning guide if you want a calmer start before dates, pricing, and household decisions come together.
          </p>
          <GuideRequestForm source="homepage" contextLabel="homepage_planning_guide" className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
