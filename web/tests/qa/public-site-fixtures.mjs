export const primaryJourneySlug = "january-umrah-2027";
export const featuredJourneySlug = "july-fenna-umrah-2026";
export const firstGuidanceSlug = "first-time-umrah-checklist";

export const publicRoutes = [
  "/",
  "/journeys",
  `/journeys/${featuredJourneySlug}`,
  `/journeys/${primaryJourneySlug}`,
  "/how-to-book",
  "/guidance",
  `/guidance/${firstGuidanceSlug}`,
  "/about",
  "/contact",
  "/privacy",
  "/terms",
];

export const styleAuditSections = [
  {
    name: "hero",
    route: "/",
    selectors: [".hero__content--reference", ".display-title--hero", ".hero__features--reference"],
  },
  {
    name: "journeys",
    route: "/",
    selectors: [".project-grid--feature", ".project-card__facts", ".journey-card__meta--summary"],
  },
  {
    name: "faq",
    route: "/",
    selectors: [".surface-card--faq-intro", "[data-faq-list]", "[data-faq-trigger]"],
  },
  {
    name: "drawer",
    route: "/",
    selectors: ["[data-menu-toggle]", "[data-menu-drawer]", ".site-mobile-nav__panel"],
  },
  {
    name: "capture",
    route: "/",
    selectors: [".reassurance-card", ".cta-banner", ".trip-stats"],
  },
];
