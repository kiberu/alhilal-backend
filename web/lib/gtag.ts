export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export const analyticsEventNames = {
  ctaConsultationClick: "cta_consultation_click",
  ctaPlanningGuideClick: "cta_planning_guide_click",
  ctaJourneysClick: "cta_journeys_click",
  ctaJourneyDetailClick: "cta_journey_detail_click",
  ctaGuidanceHubClick: "cta_guidance_hub_click",
  ctaGuidanceArticleClick: "cta_guidance_article_click",
  ctaHowToBookClick: "cta_how_to_book_click",
  ctaContactClick: "cta_contact_click",
  ctaAboutClick: "cta_about_click",
  ctaWhatsAppClick: "cta_whatsapp_click",
  ctaCallClick: "cta_call_click",
  leadSubmitStarted: "lead_submit_started",
  leadSubmitSucceeded: "lead_submit_succeeded",
  leadSubmitFailed: "lead_submit_failed",
} as const;

export type AnalyticsEventName = (typeof analyticsEventNames)[keyof typeof analyticsEventNames];

type AnalyticsCommand = "config" | "event";
type AnalyticsParams = Record<string, unknown>;
type AnalyticsAdapter = (command: AnalyticsCommand, target: string, params?: AnalyticsParams) => void;

let analyticsAdapterOverride: AnalyticsAdapter | null = null;

function getAnalyticsAdapter(): AnalyticsAdapter | null {
  if (analyticsAdapterOverride) {
    return analyticsAdapterOverride;
  }

  if (typeof window !== "undefined" && window.gtag) {
    return (command, target, params) => {
      window.gtag?.(command, target, params);
    };
  }

  return null;
}

export function setAnalyticsAdapter(adapter: AnalyticsAdapter | null) {
  analyticsAdapterOverride = adapter;
}

export function pageview(url: string) {
  const adapter = getAnalyticsAdapter();
  if (!adapter) {
    return false;
  }

  adapter("config", GA_MEASUREMENT_ID, {
    page_path: url,
  });
  return true;
}

export function dispatchAnalyticsEvent(eventName: string, params: AnalyticsParams = {}) {
  const adapter = getAnalyticsAdapter();
  if (!adapter) {
    return false;
  }

  adapter("event", eventName, params);
  return true;
}

type TrackedCtaEvent = {
  pagePath?: string;
  contextLabel?: string;
  ctaLabel: string;
  destination?: string;
  source?: string;
  journeySlug?: string;
  articleSlug?: string;
};

export function trackCtaClick(eventName: AnalyticsEventName, details: TrackedCtaEvent) {
  return dispatchAnalyticsEvent(eventName, {
    page_path: details.pagePath,
    context_label: details.contextLabel,
    cta_label: details.ctaLabel,
    destination: details.destination,
    source: details.source,
    journey_slug: details.journeySlug,
    article_slug: details.articleSlug,
  });
}

type TrackedLeadEvent = {
  pagePath?: string;
  source: string;
  contextLabel: string;
  ctaLabel: string;
  interestType: "CONSULTATION" | "GUIDE_REQUEST";
  tripId?: string;
};

export function trackLeadState(eventName: AnalyticsEventName, details: TrackedLeadEvent) {
  return dispatchAnalyticsEvent(eventName, {
    page_path: details.pagePath,
    source: details.source,
    context_label: details.contextLabel,
    cta_label: details.ctaLabel,
    interest_type: details.interestType,
    trip_id: details.tripId,
  });
}
