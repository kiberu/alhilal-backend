import type { Metadata } from "next";

import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms and Conditions | Al Hilal Travels Uganda",
  description: "Read the booking terms and conditions for Al Hilal journeys, payments, and traveller responsibilities.",
  path: "/terms",
});

export default function TermsConditionsPage() {
  return (
    <main className="pb-20 md:pb-28">
      <section className="mx-auto max-w-4xl px-5 pt-16 md:px-8 md:pt-24">
        <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_18px_48px_rgba(33,21,26,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[color:var(--gold-deep)]">Terms</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-0.05em] text-[color:var(--ink-strong)]">Terms and Conditions</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">Last updated: March 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-8 text-[color:var(--ink-soft)]">
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">Booking and confirmation</h2>
              <p className="mt-3">
                A pilgrimage booking is confirmed only after Al Hilal receives the required payment and issues a written
                confirmation. Package availability, service partners, and final documentation requirements remain subject to
                operational reality.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">Pricing and changes</h2>
              <p className="mt-3">
                Published prices are directional until final package confirmation. Al Hilal may need to adjust pricing if flights,
                partner costs, exchange movement, or government requirements materially change.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">Traveller responsibilities</h2>
              <p className="mt-3">
                Travellers remain responsible for accurate personal information, valid documents, timely payment, and respectful
                conduct throughout the journey.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">Questions</h2>
              <p className="mt-3">
                Questions about these terms can be directed to <strong>info@alhilaltravels.com</strong> or discussed directly with
                the Al Hilal team during consultation.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
