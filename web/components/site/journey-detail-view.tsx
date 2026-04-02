import Image from "next/image";

import { buttonLinkClass } from "@/components/site/button-classes";
import { FeaturedCard } from "@/components/site/cards";
import { ConsultationForm, GuideRequestForm } from "@/components/site/forms";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import {
  formatDate,
  formatDateRange,
  formatMoney,
  formatNightsLabel,
  formatPackageCountLabel,
  formatStatusLabel,
} from "@/lib/format";
import { siteConfig } from "@/lib/site-config";
import type { JourneyDetail, JourneyPackage } from "@/lib/trips";

type JourneyDetailViewProps = {
  journey: JourneyDetail;
  heroImage: string;
  isFennaJourney?: boolean;
  campaignRoute?: string;
};

function uniqueValues(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value?.trim()))));
}

function summarizeCarriers(packageItem: JourneyPackage) {
  const carriers = uniqueValues(packageItem.flights.map((flight) => flight.carrier));
  return carriers.length ? carriers.join(", ") : null;
}

function summarizeHotels(packageItem: JourneyPackage) {
  const hotels = uniqueValues(packageItem.hotels.map((hotel) => hotel.name));
  return hotels.length ? hotels.join(", ") : null;
}

function describeSupportEvidence(journey: JourneyDetail) {
  const parts = [
    journey.milestones.length ? `${journey.milestones.length} public milestone${journey.milestones.length === 1 ? "" : "s"}` : null,
    journey.guideSections.length ? `${journey.guideSections.length} guide section${journey.guideSections.length === 1 ? "" : "s"}` : null,
    journey.emergencyContacts.length ? `${journey.emergencyContacts.length} emergency contact${journey.emergencyContacts.length === 1 ? "" : "s"}` : null,
    journey.faqs.length ? `${journey.faqs.length} FAQ${journey.faqs.length === 1 ? "" : "s"}` : null,
  ].filter(Boolean);

  if (!parts.length) {
    return null;
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}`;
}

function TruthRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-1 rounded-[1.2rem] bg-[color:var(--surface-tint)] px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">{label}</span>
      <span className="text-sm leading-7 text-[color:var(--ink-strong)]">{value || "Not yet published"}</span>
    </div>
  );
}

export function JourneyDetailView({ journey, heroImage, isFennaJourney = false, campaignRoute }: JourneyDetailViewProps) {
  const supportEvidenceSummary = describeSupportEvidence(journey);
  const hasSupportProof = Boolean(journey.milestones.length || journey.guideSections.length || journey.emergencyContacts.length);
  const hasFaqs = Boolean(journey.faqs.length);
  const startingPrice = formatMoney(journey.startingPriceMinorUnits, journey.startingPriceCurrency || "UGX");
  const heroStats = [
    journey.commercialMonthLabel ? { label: "Month", value: journey.commercialMonthLabel } : null,
    { label: "Status", value: formatStatusLabel(journey.status) },
    formatNightsLabel(journey.defaultNights) ? { label: "Default stay", value: formatNightsLabel(journey.defaultNights) as string } : null,
    formatPackageCountLabel(journey.packagesCount) ? { label: "Packages", value: formatPackageCountLabel(journey.packagesCount) as string } : null,
  ].filter((item): item is { label: string; value: string } => Boolean(item));

  return (
    <>
      <Section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro eyebrow="Quick facts" title="What this departure is publishing right now." />
          <div className="mt-6 grid gap-4 text-sm leading-7 text-[color:var(--ink-soft)]">
            {journey.commercialMonthLabel ? (
              <div>
                <strong className="text-[color:var(--ink-strong)]">Commercial month:</strong> {journey.commercialMonthLabel}
              </div>
            ) : null}
            <div>
              <strong className="text-[color:var(--ink-strong)]">Journey status:</strong> {formatStatusLabel(journey.status)}
            </div>
            <div>
              <strong className="text-[color:var(--ink-strong)]">Dates:</strong> {formatDateRange(journey.startDate, journey.endDate)}
            </div>
            {journey.defaultNights || journey.defaultNights === 0 ? (
              <div>
                <strong className="text-[color:var(--ink-strong)]">Default stay:</strong> {formatNightsLabel(journey.defaultNights)}
              </div>
            ) : null}
            <div>
              <strong className="text-[color:var(--ink-strong)]">Cities:</strong> {journey.cities.join(", ")}
            </div>
            <div>
              <strong className="text-[color:var(--ink-strong)]">Package count:</strong> {journey.packagesCount}
            </div>
            {startingPrice ? (
              <div>
                <strong className="text-[color:var(--ink-strong)]">Starting from:</strong> {startingPrice}
              </div>
            ) : null}
          </div>

          {isFennaJourney && campaignRoute ? (
            <TrackedLink
              href={campaignRoute}
              eventName="cta_journey_detail_click"
              ctaLabel="journey_campaign_detail"
              contextLabel={journey.slug}
              journeySlug={journey.slug}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-maroon)]"
            >
              Go to the dedicated July Fenna page
            </TrackedLink>
          ) : null}
        </div>

        <FeaturedCard
          eyebrow={journey.featured ? "Featured journey" : "Journey detail"}
          title={formatDateRange(journey.startDate, journey.endDate)}
          description={
            startingPrice
              ? `Starting from ${startingPrice}. Use the package truth below to compare dates, hotels, airlines, and support before you decide.`
              : "Use the package truth below to compare dates, hotels, airlines, and support before you decide."
          }
          media={
            <div className="relative aspect-[1.08] overflow-hidden rounded-[1.6rem] bg-[color:var(--surface-muted)]">
              <Image
                src={heroImage}
                alt={journey.name}
                fill
                sizes="(min-width: 1024px) 32rem, 100vw"
                className="object-cover"
              />
            </div>
          }
          stats={heroStats}
        />
      </Section>

      <Section className="deferred-section mt-20">
        <SectionIntro
          eyebrow="Packages and timing"
          title="Package truth, not brochure shorthand."
          description="Each package below uses the public trip contract to show the dates, nights, hotels, airlines, price, and current package status published for this departure."
        />

        <div className="mt-8 grid gap-4">
          {journey.packages.map((packageItem) => (
            <article key={packageItem.id} className="rounded-[1.9rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_18px_40px_rgba(39,28,33,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">{packageItem.name}</h3>
                  {packageItem.packageCode ? (
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">{packageItem.packageCode}</p>
                  ) : null}
                </div>
                <span className="rounded-full bg-[color:var(--surface-tint)] px-4 py-2 text-sm font-semibold text-[color:var(--ink-strong)]">
                  {formatMoney(packageItem.priceMinorUnits, packageItem.currency || "UGX") || "Price not yet published"}
                </span>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <TruthRow label="Package status" value={formatStatusLabel(packageItem.status)} />
                <TruthRow label="Dates" value={formatDateRange(packageItem.startDate, packageItem.endDate)} />
                <TruthRow label="Nights" value={formatNightsLabel(packageItem.nights)} />
                <TruthRow label="Hotels" value={summarizeHotels(packageItem)} />
                <TruthRow label="Airlines" value={summarizeCarriers(packageItem)} />
                <TruthRow
                  label="Planning window"
                  value={
                    packageItem.hotelBookingMonth || packageItem.airlineBookingMonth
                      ? [packageItem.hotelBookingMonth ? `Hotels: ${packageItem.hotelBookingMonth}` : null, packageItem.airlineBookingMonth ? `Airlines: ${packageItem.airlineBookingMonth}` : null]
                          .filter(Boolean)
                          .join(" · ")
                      : null
                  }
                />
              </div>
            </article>
          ))}
        </div>
      </Section>

      {journey.hasItinerary && journey.itinerary.length ? (
        <Section className="deferred-section mt-20">
          <SectionIntro
            eyebrow="Itinerary preview"
            title="What the published journey rhythm looks like so far."
            description="This preview only shows itinerary items that are actually present in the public trip detail."
          />

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            {journey.itinerary.map((item) => (
              <article key={item.id} className="rounded-[1.8rem] border border-[color:var(--border-soft)] bg-white p-5 shadow-[0_18px_40px_rgba(39,28,33,0.05)]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[color:var(--surface-tint)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--brand-maroon)]">
                    Day {item.dayIndex}
                  </span>
                  {item.startTime ? (
                    <span className="rounded-full bg-[color:var(--surface-card)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--ink-muted)]">
                      {formatDate(item.startTime)}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-xl font-bold tracking-[-0.04em] text-[color:var(--ink-strong)]">{item.title}</h3>
                {item.location ? <p className="mt-2 text-sm font-medium text-[color:var(--brand-maroon)]">{item.location}</p> : null}
                {item.notes ? <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{item.notes}</p> : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {hasSupportProof ? (
        <Section className="deferred-section mt-20">
          <SectionIntro
            eyebrow="Readiness and support"
            title="Proof published from the real support journey."
            description={
              supportEvidenceSummary
                ? `This departure currently publishes ${supportEvidenceSummary}. That gives first-timers and families concrete support material to review before they book.`
                : "This departure publishes support evidence directly from the trip setup."
            }
          />

          <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
            {journey.milestones.length ? (
              <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(39,28,33,0.06)]">
                <h3 className="text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">Published milestones</h3>
                <div className="mt-5 grid gap-3">
                  {journey.milestones.map((milestone) => (
                    <div key={milestone.id} className="rounded-[1.4rem] bg-[color:var(--surface-tint)] px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--brand-maroon)]">
                          {formatStatusLabel(milestone.status)}
                        </span>
                        {milestone.targetDate ? (
                          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--ink-muted)]">
                            Target: {formatDate(milestone.targetDate)}
                          </span>
                        ) : null}
                      </div>
                      <h4 className="mt-3 text-base font-semibold text-[color:var(--ink-strong)]">{milestone.title}</h4>
                      {milestone.notes ? <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{milestone.notes}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="grid gap-6">
              {journey.guideSections.length ? (
                <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(39,28,33,0.06)]">
                  <h3 className="text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">Guide sections</h3>
                  <div className="mt-5 grid gap-4">
                    {journey.guideSections.map((section) => (
                      <div key={section.id} className="rounded-[1.4rem] bg-[color:var(--surface-tint)] px-4 py-4">
                        <h4 className="text-base font-semibold text-[color:var(--ink-strong)]">{section.title}</h4>
                        <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{section.contentMd}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {journey.emergencyContacts.length ? (
                <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-6 shadow-[0_20px_50px_rgba(39,28,33,0.06)]">
                  <h3 className="text-2xl font-bold leading-[1] tracking-[-0.04em] text-[color:var(--ink-strong)]">Emergency contacts</h3>
                  <div className="mt-5 grid gap-3">
                    {journey.emergencyContacts.map((contact) => (
                      <div key={contact.id} className="rounded-[1.4rem] bg-[color:var(--surface-tint)] px-4 py-4">
                        <h4 className="text-base font-semibold text-[color:var(--ink-strong)]">{contact.label}</h4>
                        <p className="mt-2 text-sm font-medium text-[color:var(--brand-maroon)]">{contact.phone}</p>
                        {contact.hours ? <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{contact.hours}</p> : null}
                        {contact.notes ? <p className="mt-2 text-sm leading-7 text-[color:var(--ink-soft)]">{contact.notes}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </Section>
      ) : null}

      {hasFaqs ? (
        <Section className="deferred-section mt-20">
          <SectionIntro
            eyebrow="Frequently asked questions"
            title="Questions already answered on this departure."
            description="These FAQs are only shown when real answers exist in the public trip detail."
          />
          <div className="mt-8 grid gap-4">
            {journey.faqs.map((faq) => (
              <div key={faq.id} className="rounded-[1.6rem] border border-[color:var(--border-soft)] bg-white px-5 py-5 shadow-[0_14px_30px_rgba(39,28,33,0.05)]">
                <h3 className="text-base font-semibold text-[color:var(--ink-strong)]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      <Section className="deferred-section mt-20 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div id="consultation-form" className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Structured consultation"
            title="Share your dates, household needs, or questions before the team follows up."
            description="This keeps the handoff organized when you want a serious reply about fit, price, rooming, or travel timing."
          />
          <ConsultationForm source="journey_detail" contextLabel={journey.slug} tripName={journey.name} tripId={journey.id} className="mt-6" />
        </div>

        <div className="grid gap-6">
          <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
            <SectionIntro
              eyebrow="Talk now"
              title="Need immediate reassurance before you compare more?"
              description="WhatsApp stays the fastest direct-response path on journey pages when you are ready to ask a live question now."
            />
            <TrackedLink
              href={siteConfig.social.whatsapp}
              newTab
              eventName="cta_whatsapp_click"
              ctaLabel="journey_detail_whatsapp"
              contextLabel={journey.slug}
              journeySlug={journey.slug}
              className={`${buttonLinkClass("gold")} mt-6`}
            >
              Ask on WhatsApp
            </TrackedLink>
          </div>

          <div id="planning-guide-form" className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
            <SectionIntro
              eyebrow="Still planning?"
              title="Request the planning guide if you are not ready to choose a departure yet."
              description="This is the smaller slow-nurture path for people who want a calmer checklist before dates, family decisions, or budget conversations settle."
            />
            <GuideRequestForm source="journey_detail" contextLabel={`${journey.slug}_planning_guide`} tripId={journey.id} className="mt-6" />
          </div>
        </div>
      </Section>
    </>
  );
}
