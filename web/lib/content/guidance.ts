import { FENNA_JOURNEY_SLUG, fennaCampaign } from "@/lib/content/fenna";

export type GuidanceSection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export type GuidanceArticle = {
  slug: string;
  title: string;
  description: string;
  readingTime: string;
  category: string;
  eyebrow: string;
  intro: string;
  imageSrc: string;
  imageAlt: string;
  sections: GuidanceSection[];
  ctaTitle: string;
  ctaDescription: string;
  ctaHref: string;
  secondaryCtaTitle: string;
  secondaryCtaDescription: string;
  secondaryCtaHref: string;
  relatedJourneySlug?: string;
};

export const guidanceArticles: GuidanceArticle[] = [
  {
    slug: "first-time-umrah-checklist",
    title: "First-Time Umrah Checklist From Uganda",
    description:
      "What to sort out first if you are preparing for your first Umrah from Uganda.",
    readingTime: "6 min read",
    category: "Pilgrimage readiness",
    eyebrow: "Guidance",
    imageSrc: "/alhilal-assets/Kaaba-hero.png",
    imageAlt: "The Kaaba against a bright sky",
    intro:
      "If this is your first Umrah, start here. You do not need hype. You need a clear checklist, honest timelines, and a team that explains what matters before you travel.",
    sections: [
      {
        title: "Start with your dates and documents",
        paragraphs: [
          "Give yourself enough time for consultation, passport checks, payment planning, and any family conversations that need to happen before booking.",
          "Rushed Umrah plans usually create avoidable stress. Calm planning leads to better decisions.",
        ],
        bullets: [
          "Choose the month or window you want to travel.",
          "Check passport validity early.",
          "Be clear about who is travelling and who is paying.",
        ],
      },
      {
        title: "Know what is included in the journey",
        paragraphs: [
          "A serious Umrah package is more than a ticket and visa. It should also show how the team helps you prepare, travel, and stay supported during the journey.",
        ],
        bullets: [
          "Ask what is included and what is not.",
          "Ask how pre-departure guidance works.",
          "Ask who helps if plans change during travel.",
        ],
      },
      {
        title: "Prepare your worship and your travel together",
        paragraphs: [
          "Your niyyah, your learning, and your travel preparation should move together. One should not be used to excuse weakness in the other.",
        ],
        bullets: [
          "Set aside time to learn the rites and adab of Umrah.",
          "Plan your money honestly and avoid last-minute confusion.",
          "Discuss expectations with anyone travelling with you.",
        ],
      },
    ],
    ctaTitle: "Planning for July already?",
    ctaDescription:
      "See July Fenna if you want a guided departure that works well for first-timers and pilgrims who want clearer support before booking.",
    ctaHref: fennaCampaign.route,
    secondaryCtaTitle: "See how booking works",
    secondaryCtaDescription:
      "Use the readiness page if you want the calmer documents, timing, and support expectations explained before you choose a departure.",
    secondaryCtaHref: "/how-to-book",
    relatedJourneySlug: FENNA_JOURNEY_SLUG,
  },
  {
    slug: "family-travel-planning-umrah",
    title: "How to Plan Umrah for Your Family",
    description:
      "What families should clarify before booking Umrah together.",
    readingTime: "7 min read",
    category: "Family and household",
    eyebrow: "Guidance",
    imageSrc: "/alhilal-assets/about-image.jpg",
    imageAlt: "Pilgrims moving together through a sacred space",
    intro:
      "Family Umrah planning needs more than a brochure. It needs clarity on rooming, care, timing, budget, and who is responsible for each decision.",
    sections: [
      {
        title: "Choose a journey that fits the household",
        paragraphs: [
          "Families do better when they choose a journey that matches their real needs instead of chasing the cheapest or loudest option.",
        ],
        bullets: [
          "Clarify rooming expectations early.",
          "Discuss how children, elders, or first-timers will be supported.",
          "Ask how the team handles in-country coordination and welfare.",
        ],
      },
      {
        title: "Agree the money conversation early",
        paragraphs: [
          "Family bookings often involve shared decision-making. That can help, but only if the money conversation is handled clearly from the beginning.",
        ],
        bullets: [
          "Agree on who is paying for what.",
          "Confirm deadlines, deposits, and document expectations.",
          "Avoid vague assumptions about what relatives will cover later.",
        ],
      },
      {
        title: "Reduce stress before the airport",
        paragraphs: [
          "The calmest family journeys are the ones where the practical questions were handled before departure, not at the airport.",
        ],
        bullets: [
          "Share essential documents in one household folder.",
          "Make a simple family packing plan.",
          "Choose a provider that communicates clearly during active travel.",
        ],
      },
    ],
    ctaTitle: "Need a family-friendly July option?",
    ctaDescription:
      "July Fenna includes a family and group pathway for households that want to talk through rooming, care, and budget before booking.",
    ctaHref: fennaCampaign.route,
    secondaryCtaTitle: "Compare all departures",
    secondaryCtaDescription:
      "Browse the published departures if you want to compare dates, package count, and price direction before you ask about family fit.",
    secondaryCtaHref: "/journeys",
    relatedJourneySlug: FENNA_JOURNEY_SLUG,
  },
  {
    slug: "sponsor-from-abroad-umrah",
    title: "How to Book Umrah When a Relative Abroad Is Paying",
    description:
      "A simple process for sponsor-assisted Umrah bookings when a relative abroad is helping to pay.",
    readingTime: "5 min read",
    category: "Planning and stewardship",
    eyebrow: "Guidance",
    imageSrc: "/alhilal-assets/campaign/fenna-media-plan.png",
    imageAlt: "Fenna campaign media plan layouts shown on a proposal page",
    intro:
      "Sponsor-assisted bookings are common. Problems start when nobody is clear about who is paying, who is deciding, and who is responsible for documents and timing.",
    sections: [
      {
        title: "Separate payment from decision-making",
        paragraphs: [
          "A sponsor can pay for the journey without taking over the traveller's preparation, communication, and document responsibilities.",
        ],
        bullets: [
          "Agree who Al Hilal should speak to first.",
          "Confirm who approves package changes or upgrades.",
          "Make payment expectations explicit early.",
        ],
      },
      {
        title: "Keep the traveller close to the process",
        paragraphs: [
          "The traveller still needs to stay involved because documents, availability, and readiness cannot be outsourced completely.",
        ],
        bullets: [
          "Confirm passport status early.",
          "Keep the traveller reachable on WhatsApp.",
          "Avoid sponsor-led assumptions the traveller has not approved.",
        ],
      },
      {
        title: "Use one clear consultation thread",
        paragraphs: [
          "One clear conversation saves time and reduces misunderstandings. It also helps the team protect trust and service quality.",
        ],
      },
    ],
    ctaTitle: "Need help with a sponsor-backed booking?",
    ctaDescription:
      "Talk to Al Hilal first so the funding plan, traveller details, and booking path stay aligned from the beginning.",
    ctaHref: "/contact",
    secondaryCtaTitle: "Read the booking pathway",
    secondaryCtaDescription:
      "See the process page if you need documents, timing, and readiness expectations clarified before the sponsor conversation starts.",
    secondaryCtaHref: "/how-to-book",
    relatedJourneySlug: FENNA_JOURNEY_SLUG,
  },
];

export function getGuidanceArticle(slug: string) {
  return guidanceArticles.find((article) => article.slug === slug);
}
