import type { Metadata } from "next";

import { generatePageMetadata } from "@/lib/seo-config";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy | Al Hilal Travels Uganda",
  description: "Read the Al Hilal privacy policy covering enquiries, bookings, travel data, and communication records.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <main className="pb-20 md:pb-28">
      <section className="mx-auto max-w-4xl px-5 pt-16 md:px-8 md:pt-24">
        <div className="rounded-[2rem] border border-[color:var(--border-soft)] bg-white p-7 shadow-[0_18px_48px_rgba(33,21,26,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[color:var(--gold-deep)]">Privacy</p>
          <h1 className="mt-4 text-5xl font-bold tracking-[-0.05em] text-[color:var(--ink-strong)]">Privacy Policy</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--ink-soft)]">Last updated: March 2026</p>

          <div className="mt-8 space-y-8 text-sm leading-8 text-[color:var(--ink-soft)]">
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">What we collect</h2>
              <p className="mt-3">
                Al Hilal may collect the contact, document, travel, and communication information required to handle
                pilgrimage consultation, booking preparation, and customer support.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">How the information is used</h2>
              <p className="mt-3">
                The information is used to answer enquiries, prepare pilgrim records, manage bookings, coordinate service
                delivery, and communicate important travel updates.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">Third parties and service partners</h2>
              <p className="mt-3">
                Some information may be shared with airlines, accommodation providers, visa or transport partners, and
                authorised service providers when necessary to fulfil a pilgrimage booking.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-[color:var(--ink-strong)]">Contact</h2>
              <p className="mt-3">
                Questions about privacy can be sent to <strong>info@alhilaltravels.com</strong> or raised directly with the team
                on <strong>+256 700 773535</strong>.
              </p>
            </section>
          </div>
        </div>
      </section>
    </main>
  );
}
