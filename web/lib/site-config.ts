import { FENNA_JOURNEY_SLUG } from "@/lib/content/fenna";

export const siteConfig = {
  siteName: "Al Hilal Travels Uganda",
  businessName: "Al Hilal Travels Uganda",
  siteUrl: "https://alhilaltravels.com",
  masterBrandLine: "Grounded in faith. Built for life.",
  pilgrimageCampaignLine: "Answer Allah's Call with Al Hilal.",
  masterDescriptor:
    "Guided Umrah and Hajj from Kampala, with clear planning, family-aware care, and a team that keeps worship first.",
  defaultDescription:
    "Guided Umrah and Hajj from Kampala. Compare journeys, check dates and pricing, and speak to Al Hilal on WhatsApp with worship kept first.",
  defaultOgImage: "/opengraph-image",
  phoneDisplay: "+256 700 773535",
  phoneIntl: "+256700773535",
  whatsappNumber: "256700773535",
  email: "info@alhilaltravels.com",
  addressLines: ["Kyato Complex, Suite B5-18", "Bombo Road, Kampala, Uganda"],
  officeHours: [
    "Monday to Friday: 9:00 AM to 6:00 PM",
    "Saturday: 10:00 AM to 4:00 PM",
  ],
  social: {
    instagram: "https://www.instagram.com/al_hilal_travels/",
    tiktok: "https://www.tiktok.com/@alhilaltravels",
    facebook: "https://www.facebook.com/61554545522475",
    x: "https://x.com/alhilal_travels",
    whatsapp: "https://wa.me/256700773535",
  },
  featuredJourneySlug: FENNA_JOURNEY_SLUG,
  logo: {
    landscape: "/alhilal-assets/LOGO-landscape.svg",
    portrait: "/alhilal-assets/LOGO-POTRAIT.svg",
    umrah: "/alhilal-assets/umrah-logo.svg",
  },
} as const;
