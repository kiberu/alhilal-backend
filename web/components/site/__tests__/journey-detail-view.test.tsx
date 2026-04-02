import { render, screen } from "@testing-library/react";

import { JourneyDetailView } from "@/components/site/journey-detail-view";
import type { JourneyDetail } from "@/lib/trips";

function buildJourney(overrides: Partial<JourneyDetail> = {}): JourneyDetail {
  return {
    id: "trip-1",
    code: "JAN27",
    name: "January Umrah 2027",
    slug: "january-umrah-2027",
    excerpt: "January group departure.",
    seoTitle: "January Umrah 2027",
    seoDescription: "Truthful January departure.",
    cities: ["Makkah", "Madinah"],
    commercialMonthLabel: "January Umrah 2027",
    status: "OPEN_FOR_SALES",
    defaultNights: 8,
    startingPriceMinorUnits: 4650000,
    startingPriceCurrency: "UGX",
    startDate: "2027-01-15",
    endDate: "2027-01-23",
    coverImage: null,
    featured: true,
    packagesCount: 1,
    packages: [
      {
        id: "pkg-1",
        name: "Premium",
        startDate: "2027-01-15",
        endDate: "2027-01-23",
        nights: 8,
        priceMinorUnits: 4650000,
        currency: "UGX",
        status: "SELLING",
        flights: [{ id: "flt-1", leg: "OUTBOUND", carrier: "Qatar Airways", flightNo: "QR1380", depAirport: "EBB", depDt: "2027-01-15T08:00:00Z", arrAirport: "JED", arrDt: "2027-01-15T16:00:00Z" }],
        hotels: [{ id: "hotel-1", name: "Hilton Suites", address: "Makkah", roomType: "Quad", checkIn: "2027-01-15", checkOut: "2027-01-23" }],
      },
    ],
    itinerary: [{ id: "iti-1", dayIndex: 1, startTime: "2027-01-15T08:00:00Z", title: "Arrival in Madinah", location: "Madinah", notes: "Meet the group lead." }],
    hasItinerary: true,
    milestones: [{ id: "milestone-1", milestoneType: "DARASA_ONE", title: "First Darasa", status: "SCHEDULED", targetDate: "2027-01-03", actualDate: null, notes: "Pre-departure preparation session.", packageName: null }],
    faqs: [{ id: "faq-1", question: "Do I need a valid passport?", answer: "Yes, passport validity should be checked early.", order: 1 }],
    guideSections: [{ id: "guide-1", order: 1, title: "Documents", contentMd: "Prepare passports and traveller names early." }],
    emergencyContacts: [{ id: "contact-1", label: "Trip operations line", phone: "+256700773535", hours: "24/7 during travel", notes: "Use for active-trip emergencies." }],
    ...overrides,
  };
}

describe("JourneyDetailView", () => {
  it("renders itinerary and proof sections when real backing data exists", () => {
    render(<JourneyDetailView journey={buildJourney()} heroImage="/alhilal-assets/Kaaba-hero.png" />);

    expect(screen.getByText(/packages and timing/i)).toBeInTheDocument();
    expect(screen.getByText(/itinerary preview/i)).toBeInTheDocument();
    expect(screen.getByText(/readiness and support/i)).toBeInTheDocument();
    expect(screen.getByText(/frequently asked questions/i)).toBeInTheDocument();
    expect(screen.getByText(/emergency contacts/i)).toBeInTheDocument();
  });

  it("omits unsupported proof sections when the backing data is missing", () => {
    render(
      <JourneyDetailView
        journey={buildJourney({
          itinerary: [],
          hasItinerary: false,
          milestones: [],
          faqs: [],
          guideSections: [],
          emergencyContacts: [],
        })}
        heroImage="/alhilal-assets/Kaaba-hero.png"
      />,
    );

    expect(screen.getByText(/packages and timing/i)).toBeInTheDocument();
    expect(screen.queryByText(/itinerary preview/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/readiness and support/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/frequently asked questions/i)).not.toBeInTheDocument();
  });
});
