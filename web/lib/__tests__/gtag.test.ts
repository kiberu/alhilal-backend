import {
  analyticsEventNames,
  pageview,
  setAnalyticsAdapter,
  trackCtaClick,
  trackLeadState,
} from "@/lib/gtag";

describe("gtag wrappers", () => {
  afterEach(() => {
    setAnalyticsAdapter(null);
  });

  it("dispatches canonical CTA click events through the adapter", () => {
    const adapter = jest.fn();
    setAnalyticsAdapter(adapter);

    trackCtaClick(analyticsEventNames.ctaWhatsAppClick, {
      pagePath: "/journeys/january-umrah-2027",
      contextLabel: "journey_detail",
      ctaLabel: "journey_detail_whatsapp",
      destination: "https://wa.me/256700773535",
      journeySlug: "january-umrah-2027",
    });

    expect(adapter).toHaveBeenCalledWith(
      "event",
      "cta_whatsapp_click",
      expect.objectContaining({
        page_path: "/journeys/january-umrah-2027",
        context_label: "journey_detail",
        cta_label: "journey_detail_whatsapp",
        journey_slug: "january-umrah-2027",
      }),
    );
  });

  it("dispatches pageviews and lead state events without a live GA dependency", () => {
    const adapter = jest.fn();
    setAnalyticsAdapter(adapter);

    expect(pageview("/contact")).toBe(true);
    trackLeadState(analyticsEventNames.leadSubmitSucceeded, {
      pagePath: "/contact",
      source: "contact",
      contextLabel: "contact_consultation",
      ctaLabel: "consultation_form_submit",
      interestType: "CONSULTATION",
      tripId: "trip-123",
    });

    expect(adapter).toHaveBeenNthCalledWith(
      1,
      "config",
      expect.any(String),
      expect.objectContaining({ page_path: "/contact" }),
    );
    expect(adapter).toHaveBeenNthCalledWith(
      2,
      "event",
      "lead_submit_succeeded",
      expect.objectContaining({
        source: "contact",
        context_label: "contact_consultation",
        interest_type: "CONSULTATION",
        trip_id: "trip-123",
      }),
    );
  });
});
