import { normalizeJourneyDetail, normalizeJourneyListItem } from "@/lib/trips";

describe("trip normalization", () => {
  it("normalizes list fields from mixed casing", () => {
    const normalized = normalizeJourneyListItem({
      id: "trip-1",
      code: "JAN27",
      name: "January Umrah 2027",
      seoTitle: "January Umrah 2027",
      seo_description: "Truthful departure details.",
      cities: ["Makkah", "Madinah"],
      commercialMonthLabel: "January Umrah 2027",
      status: "OPEN_FOR_SALES",
      defaultNights: 8,
      starting_price_minor_units: 4650000,
      startingPriceCurrency: "UGX",
      startDate: "2027-01-15",
      end_date: "2027-01-23",
      coverImage: "https://example.com/cover.jpg",
      featured: true,
      packagesCount: 2,
    });

    expect(normalized).toMatchObject({
      id: "trip-1",
      code: "JAN27",
      slug: "january-umrah-2027",
      commercialMonthLabel: "January Umrah 2027",
      status: "OPEN_FOR_SALES",
      defaultNights: 8,
      startingPriceMinorUnits: 4650000,
      startingPriceCurrency: "UGX",
      packagesCount: 2,
    });
  });

  it("derives package count, nights, itinerary, and starting price from detail payloads", () => {
    const normalized = normalizeJourneyDetail({
      id: "trip-1",
      code: "JAN27",
      name: "January Umrah 2027",
      slug: "january-umrah-2027",
      excerpt: "January group departure.",
      cities: ["Makkah", "Madinah"],
      status: "OPEN_FOR_SALES",
      start_date: "2027-01-15",
      end_date: "2027-01-23",
      packages: [
        {
          id: "pkg-2",
          name: "Family Saver",
          start_date: "2027-01-15",
          end_date: "2027-01-23",
          price_minor_units: 4650000,
          currency: "UGX",
          status: "SELLING",
          flights: [],
          hotels: [],
        },
        {
          id: "pkg-1",
          name: "Premium",
          start_date: "2027-01-15",
          end_date: "2027-01-24",
          nights: 9,
          price_minor_units: 5300000,
          currency: "UGX",
          status: "SELLING",
          flights: [],
          hotels: [],
        },
      ],
      itinerary: [
        { id: "iti-2", day_index: 2, title: "Transfer to Makkah" },
        { id: "iti-1", day_index: 1, title: "Arrival in Madinah" },
      ],
      guide_sections: [
        { id: "guide-2", order: 2, title: "Packing", content_md: "Bring essentials." },
        { id: "guide-1", order: 1, title: "Documents", content_md: "Prepare passports." },
      ],
      faqs: [],
      emergency_contacts: [],
      milestones: [],
    });

    expect(normalized.packagesCount).toBe(2);
    expect(normalized.startingPriceMinorUnits).toBe(4650000);
    expect(normalized.startingPriceCurrency).toBe("UGX");
    expect(normalized.defaultNights).toBe(8);
    expect(normalized.hasItinerary).toBe(true);
    expect(normalized.itinerary[0].title).toBe("Arrival in Madinah");
    expect(normalized.guideSections[0].title).toBe("Documents");
  });
});
