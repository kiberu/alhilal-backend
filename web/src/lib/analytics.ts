export const analyticsEventNames = {
  ctaClick: "cta_click",
  leadSubmitStarted: "lead_submit_started",
  leadSubmitSucceeded: "lead_submit_succeeded",
  leadSubmitFailed: "lead_submit_failed",
} as const;

export type AnalyticsEventName =
  (typeof analyticsEventNames)[keyof typeof analyticsEventNames];

export type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

export function trackEvent(eventName: AnalyticsEventName, payload: AnalyticsPayload = {}): void {
  window.dispatchEvent(
    new CustomEvent("alhilal:analytics", {
      detail: {
        eventName,
        ...payload,
      },
    }),
  );

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...payload,
    });
  }
}
