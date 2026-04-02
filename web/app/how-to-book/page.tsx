import { CalendarDays, ClipboardCheck, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { InfoCard } from "@/components/site/cards";
import { ConsultationForm, GuideRequestForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
import { analyticsEventNames } from "@/lib/gtag";
import { generatePageMetadata } from "@/lib/seo-config";
import { buildBreadcrumbSchema, buildFaqSchema } from "@/lib/structured-data";

const bookingFaqs = [
  {
    question: "Do I need to be ready to pay before I enquire?",
    answer:
      "No. You can start with a question, a date window, or a family situation you need help working through before you book.",
  },
  {
    question: "What should first-time pilgrims do first?",
    answer:
      "Start with dates, passport validity, budget honesty, and the kind of support you need before departure.",
  },
  {
    question: "Can Al Hilal help families or sponsor-assisted bookings?",
    answer:
      "Yes. The team can talk through rooming, timing, sponsor-from-abroad questions, and who needs to approve what.",
  },
];

export const metadata: Metadata = generatePageMetadata({
  title: "How to Book | What to do before you book",
  description:
    "Learn how to book Umrah or Hajj with Al Hilal, from first enquiry to documents, package approval, and departure.",
  path: "/how-to-book",
});

export default function HowToBookPage() {
  return (
    <main className="pb-20 md:pb-28">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "How to Book", path: "/how-to-book" },
        ])}
      />
      <JsonLd data={buildFaqSchema(bookingFaqs)} />

      <SinglePageTemplate
        eyebrow="How to book"
        title="What to do before you book your Umrah or Hajj."
        description="The booking path should remove uncertainty, not add to it. Start with a real question, then move into dates, documents, package approval, and final confirmation."
        actions={
          <>
            <TrackedLink
              href="#consultation-form"
              eventName={analyticsEventNames.ctaConsultationClick}
              ctaLabel="how_to_book_consultation"
              contextLabel="how_to_book_hero"
              className={buttonLinkClass("gold")}
            >
              Start a consultation
            </TrackedLink>
            <TrackedLink
              href="#planning-guide-form"
              eventName={analyticsEventNames.ctaPlanningGuideClick}
              ctaLabel="how_to_book_planning_guide"
              contextLabel="how_to_book_hero"
              className={buttonLinkClass("outline")}
            >
              Request the planning guide
            </TrackedLink>
          </>
        }
      />

      <Section className="mt-6">
        <SectionIntro
          eyebrow="Booking rhythm"
          title="Three simple stages."
          description="Pilgrims do better when they know what happens first, what happens next, and what Al Hilal needs from them at each point."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <InfoCard
            icon={MessageCircle}
            title="Ask and compare"
            description="Start with the departure you are considering, your travel window, and any family or sponsor questions that affect the booking."
          />
          <InfoCard
            icon={ClipboardCheck}
            title="Confirm fit and documents"
            description="Review the package path, rooming, payment expectations, passport status, and what still needs to be done before approval."
          />
          <InfoCard
            icon={CalendarDays}
            title="Book and prepare"
            description="Once the booking is approved, move into pre-departure guidance, active-trip updates, and the final travel briefings."
          />
        </div>
      </Section>

      <Section className="mt-20 grid gap-6 xl:grid-cols-[1fr_0.95fr]">
        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Documents and timing"
            title="Know the readiness expectations before money changes hands."
            description="The booking page should make the seriousness of preparation clear: documents, timing, and support expectations all matter before a place is confirmed."
          />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              "Passport validity should be checked early, not after a package conversation has already become urgent.",
              "Travel windows, sponsor approvals, and family decision-makers should be clear before package locking starts.",
              "Payment planning should be honest about what is included, what is still pending, and when deadlines become serious.",
              "Support works best when Al Hilal receives a clean summary of who is travelling, what help is needed, and which documents are already ready.",
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] bg-[color:var(--surface-tint)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
                {item}
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold tracking-[-0.04em] text-[color:var(--ink-strong)]">Support and seriousness expectations</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              "Consultations should lead to a real follow-up, not a mailbox-only dead end.",
              "WhatsApp is useful for live questions, but structured enquiry helps the team prepare a better response.",
              "First-timers and families should expect clearer guidance, not pressure to decide before the basics are understood.",
              "If a sponsor abroad is involved, Al Hilal should know who approves payment, package changes, and document collection.",
            ].map((item) => (
              <div key={item} className="rounded-[1.6rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-5 py-5 text-sm leading-7 text-[color:var(--ink-soft)]">
                {item}
              </div>
            ))}
          </div>

          <h2 className="mt-10 text-2xl font-bold tracking-[-0.04em] text-[color:var(--ink-strong)]">Questions people usually ask first</h2>
          <div className="mt-5 grid gap-4">
            {bookingFaqs.map((faq) => (
              <div key={faq.question} className="rounded-[1.6rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] px-5 py-5">
                <h3 className="text-base font-semibold text-[color:var(--ink-strong)]">{faq.question}</h3>
                <p className="mt-3 text-sm leading-7 text-[color:var(--ink-soft)]">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div id="consultation-form" className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
            <SectionIntro
              eyebrow="Need help before you choose?"
              title="Tell Al Hilal what you are trying to work out."
              description="A short summary from you makes the first follow-up more useful and easier to handle."
            />
            <ConsultationForm source="how_to_book" contextLabel="how_to_book_consultation" className="mt-6" />
          </div>

          <div id="planning-guide-form" className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
            <SectionIntro
              eyebrow="Still planning?"
              title="Use the slower path if you need a guide before you need a sales conversation."
              description="The planning guide is the right secondary CTA here for visitors who need readiness help, not immediate booking pressure."
            />
            <GuideRequestForm source="how_to_book" contextLabel="how_to_book_planning_guide" className="mt-6" />
            <TrackedLink
              href="/journeys"
              eventName={analyticsEventNames.ctaJourneysClick}
              ctaLabel="how_to_book_browse_journeys"
              contextLabel="how_to_book_planning_guide"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[color:var(--brand-maroon)]"
            >
              Or browse published journeys
            </TrackedLink>
          </div>
        </div>
      </Section>
    </main>
  );
}
