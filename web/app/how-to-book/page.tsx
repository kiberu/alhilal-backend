import { CalendarDays, ClipboardCheck, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { buttonLinkClass } from "@/components/site/button-classes";
import { InfoCard } from "@/components/site/cards";
import { ConsultationForm } from "@/components/site/forms";
import { JsonLd } from "@/components/site/json-ld";
import { Section, SectionIntro } from "@/components/site/primitives";
import { TrackedLink } from "@/components/site/tracked-link";
import { SinglePageTemplate } from "@/components/site/templates";
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
              href="/contact"
              action="how_to_book_contact_click"
              category="conversion"
              label="how_to_book_contact"
              className={buttonLinkClass("gold")}
            >
              Talk to Al Hilal
            </TrackedLink>
            <TrackedLink
              href="/journeys"
              action="how_to_book_journeys_click"
              category="navigation"
              label="how_to_book_journeys"
              className={buttonLinkClass("outline")}
            >
              See journeys
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
            eyebrow="What should be clear before you pay"
            title="Know the practical details first."
            description="Good booking conversations are easier when the important questions are already on the table."
          />

          <div className="mt-6 grid gap-4">
            {[
              "Which journey fits your dates and household best.",
              "What is included, what is not, and what may still change.",
              "Which documents you need and when they are needed.",
              "Who Al Hilal should speak to if a sponsor or family member is involved.",
            ].map((item) => (
              <div key={item} className="rounded-[1.5rem] bg-[color:var(--surface-tint)] px-4 py-4 text-sm leading-7 text-[color:var(--ink-soft)]">
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

        <div className="rounded-[2.25rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-card)] p-7 shadow-[0_24px_60px_rgba(39,28,33,0.07)]">
          <SectionIntro
            eyebrow="Need help before you choose?"
            title="Tell Al Hilal what you are trying to work out."
            description="A short summary from you makes the first WhatsApp conversation more useful and easier to handle."
          />
          <ConsultationForm source="how_to_book" contextLabel="how_to_book" className="mt-6" />
        </div>
      </Section>
    </main>
  );
}
