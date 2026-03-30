export const FENNA_JOURNEY_SLUG = "july-fenna-umrah-2026";

export const fennaCampaign = {
  journeyCode: "FENNA2026",
  slug: FENNA_JOURNEY_SLUG,
  title: "July Fenna Umrah 2026",
  eyebrow: "Featured July Departure",
  campaignLine: "Answer Allah's Call with Al Hilal.",
  heroImage: "/alhilal-assets/Kaaba-hero.png",
  coverImage: "/alhilal-assets/campaign/fenna-cover.png",
  proposalImage: "/alhilal-assets/campaign/fenna-media-plan.png",
  summary:
    "A guided July Umrah from Kampala for pilgrims who want clear planning, calm support, and a journey that keeps worship first.",
  description:
    "Fenna is Al Hilal's featured July Umrah journey: strong for first-timers, helpful for families, and built for pilgrims who want real guidance before they commit.",
  startDate: "2026-07-12",
  endDate: "2026-07-20",
  durationLabel: "8 nights",
  startingPriceLabel: "UGX 4,650,000",
  startingPriceMinorUnits: 4650000,
  currency: "UGX",
  destinationLabel: "Makkah and Madinah",
  primaryCtaLabel: "Start on WhatsApp",
  secondaryCtaLabel: "Request a consultation",
  route: "/fenna-umrah-july-2026",
  journeyRoute: `/journeys/${FENNA_JOURNEY_SLUG}`,
  highlights: [
    "A July departure for pilgrims who want a focused mid-year Umrah.",
    "Quick WhatsApp support with human follow-up from the Al Hilal team.",
    "A good fit for first-timers, couples, families, and small groups.",
    "Helpful for sponsor-assisted bookings and pilgrims who need clearer planning.",
  ],
  inclusions: [
    "Return air travel from Uganda",
    "Visa processing support",
    "Accommodation in Makkah and Madinah",
    "Ground transport and airport transfers",
    "Guided ziyarah and practical travel briefings",
    "On-ground coordination and responsive support",
  ],
  exclusions: [
    "Passport issuance or renewal fees",
    "Personal shopping and incidental expenses",
    "Optional upgrades not confirmed at booking",
    "Anything not explicitly listed on the final package confirmation",
  ],
  variants: [
    {
      title: "Family and group option",
      body:
        "Built for households and group planners who want to talk through rooming, care, and coordination before departure.",
    },
    {
      title: "Sponsor-from-abroad friendly",
      body:
        "A better fit for families whose funding support comes from relatives abroad and who need a clean consultation and document path.",
    },
    {
      title: "First-timer ready",
      body:
        "A strong fit for pilgrims who want practical briefing, calm support, and a clearer booking journey.",
    },
  ],
  trustPoints: [
    "Licensed pilgrimage operator based in Kampala",
    "Clear pre-departure guidance, not just sales copy",
    "Responsive WhatsApp support when pilgrims are ready to ask questions",
    "Practical care before departure and during the journey",
  ],
  faqs: [
    {
      question: "Who is Fenna best suited for?",
      answer:
        "July Fenna works well for first-time pilgrims, younger adults planning seriously, and families or small groups who want a clearer Umrah path from Kampala.",
    },
    {
      question: "Is the published price final?",
      answer:
        "The featured price is a starting point. Final confirmation depends on the approved package, rooming, and traveller-specific requirements discussed during consultation.",
    },
    {
      question: "Can someone abroad sponsor the booking?",
      answer:
        "Yes. Al Hilal can help families organise a sponsor-from-abroad booking so the payment plan, documents, and traveller preparation stay coordinated.",
    },
    {
      question: "What happens after I enquire?",
      answer:
        "The next step is a WhatsApp or consultation conversation where the team confirms fit, explains the package path, and outlines dates, documents, and payment expectations.",
    },
  ],
  heroStats: [
    { label: "Departure", value: "12 Jul 2026" },
    { label: "Return", value: "20 Jul 2026" },
    { label: "Starting from", value: "UGX 4.65M" },
  ],
};

export const fennaJourneyFallback = {
  id: "fenna-local",
  code: fennaCampaign.journeyCode,
  name: fennaCampaign.title,
  slug: fennaCampaign.slug,
  excerpt: fennaCampaign.summary,
  seoTitle: "July Fenna Umrah 2026 | Al Hilal Travels Uganda",
  seoDescription:
    "See Al Hilal's featured July Fenna Umrah journey with dates, pricing, guided support, and a direct WhatsApp path.",
  cities: ["Makkah", "Madinah"],
  startDate: fennaCampaign.startDate,
  endDate: fennaCampaign.endDate,
  coverImage: "/alhilal-assets/Kaaba-hero1.jpg",
  featured: true,
  packagesCount: 1,
  packages: [
    {
      id: "fenna-family-group",
      name: "Fenna Family and Group Package",
      priceMinorUnits: fennaCampaign.startingPriceMinorUnits,
      currency: fennaCampaign.currency,
      capacity: 200,
      flights: [],
      hotels: [],
    },
  ],
  itinerary: [],
  hasItinerary: false,
  faqs: fennaCampaign.faqs.map((item, index) => ({
    id: `fenna-faq-${index + 1}`,
    question: item.question,
    answer: item.answer,
    order: index + 1,
  })),
  guideSections: [
    {
      id: "fenna-guide-1",
      order: 1,
      title: "What makes this departure distinct",
      contentMd:
        "This departure gives pilgrims a clearer July pathway, family-aware support, and better preparation before they travel.",
    },
  ],
  emergencyContacts: [],
};
