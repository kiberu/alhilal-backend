import { buildWebsiteLeadPayload } from "@/lib/leads";

describe("buildWebsiteLeadPayload", () => {
  it("builds the website lead payload with UTM and attribution fields", () => {
    const payload = buildWebsiteLeadPayload(
      {
        name: "Amina",
        phone: "+256700000000",
        email: "amina@example.com",
        interestType: "CONSULTATION",
        travelWindow: "January 2027",
        notes: "Looking for a family-friendly option.",
        tripId: "trip-123",
        source: "journey_detail",
        contextLabel: "january-umrah-2027",
        ctaLabel: "consultation_form_submit",
      },
      {
        pathname: "/journeys/january-umrah-2027",
        search: "?utm_source=google&utm_medium=cpc&utm_campaign=january_launch&utm_content=hero&utm_term=uganda+umrah&campaign=override-me",
      } as Location,
      "https://google.com/search?q=uganda+umrah",
    );

    expect(payload).toEqual({
      name: "Amina",
      phone: "+256700000000",
      email: "amina@example.com",
      interest_type: "CONSULTATION",
      travel_window: "January 2027",
      notes: "Looking for a family-friendly option.",
      trip: "trip-123",
      source: "journey_detail",
      page_path: "/journeys/january-umrah-2027",
      context_label: "january-umrah-2027",
      cta_label: "consultation_form_submit",
      campaign: "override-me",
      referrer: "https://google.com/search?q=uganda+umrah",
      utm_source: "google",
      utm_medium: "cpc",
      utm_campaign: "january_launch",
      utm_content: "hero",
      utm_term: "uganda umrah",
    });
  });

  it("prefers an explicit submission campaign over location params", () => {
    const payload = buildWebsiteLeadPayload(
      {
        name: "Mariam",
        phone: "",
        email: "mariam@example.com",
        interestType: "GUIDE_REQUEST",
        source: "homepage",
        contextLabel: "homepage_planning_guide",
        ctaLabel: "guide_request_form_submit",
        campaign: "manual-campaign",
      },
      {
        pathname: "/",
        search: "?utm_campaign=from-query",
      } as Location,
      "",
    );

    expect(payload.campaign).toBe("manual-campaign");
    expect(payload.page_path).toBe("/");
    expect(payload.interest_type).toBe("GUIDE_REQUEST");
  });
});
