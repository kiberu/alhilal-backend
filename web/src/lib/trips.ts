import { appEnv } from './env';

export const primaryJourneySlug = "january-umrah-2027";
export const featuredJourneySlug = "july-fenna-umrah-2026";
export const familyJourneySlug = "family-umrah-october-2026";

export type JourneyStatus =
  | "OPEN_FOR_SALES"
  | "PLANNING"
  | "SELLING"
  | "WAITLIST"
  | "ON_TRACK"
  | "SCHEDULED";

export type PublicJourneyListItem = {
  id: string;
  code: string;
  name: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  cities: string[];
  commercialMonthLabel: string | null;
  status: string;
  defaultNights: number | null;
  startingPriceMinorUnits: number | null;
  startingPriceCurrency: string | null;
  startDate: string;
  endDate: string;
  coverImage: string | null;
  featured: boolean;
  packagesCount: number;
};

export type PublicJourneyFlight = {
  id: string;
  leg: string;
  carrier: string;
  flightNo: string;
  depAirport: string;
  depDt: string;
  arrAirport: string;
  arrDt: string;
};

export type PublicJourneyHotel = {
  id: string;
  name: string;
  address: string | null;
  roomType: string | null;
  checkIn: string | null;
  checkOut: string | null;
};

export type PublicJourneyPackage = {
  id: string;
  packageCode: string | null;
  name: string;
  startDate: string;
  endDate: string;
  nights: number | null;
  priceMinorUnits: number | null;
  currency: string | null;
  capacity: number | null;
  salesTarget: number | null;
  hotelBookingMonth: string | null;
  airlineBookingMonth: string | null;
  status: string | null;
  flights: PublicJourneyFlight[];
  hotels: PublicJourneyHotel[];
};

export type PublicJourneyItineraryItem = {
  id: string;
  dayIndex: number;
  startTime: string | null;
  endTime: string | null;
  title: string;
  location: string | null;
  notes: string | null;
};

export type PublicJourneyMilestone = {
  id: string;
  milestoneType: string;
  title: string;
  status: string;
  targetDate: string | null;
  actualDate: string | null;
  notes: string | null;
  packageName: string | null;
};

export type PublicJourneyFaq = {
  id: string;
  question: string;
  answer: string;
  order?: number;
};

export type PublicJourneyGuideSection = {
  id: string;
  order: number;
  title: string;
  contentMd: string;
};

export type PublicJourneyEmergencyContact = {
  id: string;
  label: string;
  phone: string;
  hours: string | null;
  notes: string | null;
};

export type PublicJourneyDetail = PublicJourneyListItem & {
  packages: PublicJourneyPackage[];
  itinerary: PublicJourneyItineraryItem[];
  hasItinerary: boolean;
  milestones: PublicJourneyMilestone[];
  guideSections: PublicJourneyGuideSection[];
  emergencyContacts: PublicJourneyEmergencyContact[];
  faqs: PublicJourneyFaq[];
};

const fallbackTripListResponse = {
  count: 3,
  results: [
    {
      id: "trip-fenna-2026",
      code: "FENNA2026",
      name: "Fenna Umrah Season II, This July",
      slug: featuredJourneySlug,
      excerpt:
        "Fenna Umrah is Al Hilal’s seasonal group departure to Makkah and Madinah—Season II departs this July with structured support so worship stays first.",
      seo_title: "Fenna Umrah Season II, This July | Al Hilal",
      seo_description:
        "Season II Fenna Umrah this July: dates, packages, and Al Hilal support from Kampala to the Haram.",
      cities: ["Makkah", "Madinah"],
      commercial_month_label: "July Umrah 2026",
      status: "OPEN_FOR_SALES",
      default_nights: 8,
      starting_price_minor_units: 4650000,
      starting_price_currency: "UGX",
      start_date: "2026-07-12",
      end_date: "2026-07-20",
      cover_image: null,
      featured: true,
      packages_count: 1,
    },
    {
      id: "trip-jan-2027",
      code: "JAN27",
      name: "January Umrah 2027",
      slug: primaryJourneySlug,
      excerpt:
        "A January departure with published itinerary, support proof, and multiple packages.",
      seo_title: "January Umrah 2027 | Al Hilal",
      seo_description:
        "Published January departure with truthful package and support details.",
      cities: ["Makkah", "Madinah"],
      commercial_month_label: "January Umrah 2027",
      status: "OPEN_FOR_SALES",
      default_nights: 8,
      starting_price_minor_units: 4650000,
      starting_price_currency: "UGX",
      start_date: "2027-01-15",
      end_date: "2027-01-23",
      cover_image: null,
      featured: true,
      packages_count: 2,
    },
    {
      id: "trip-oct-2026",
      code: "OCT26",
      name: "Family Umrah October 2026",
      slug: familyJourneySlug,
      excerpt:
        "A calmer October departure with one package and family-support positioning.",
      seo_title: "Family Umrah October 2026 | Al Hilal",
      seo_description: "October family departure with published dates and price direction.",
      cities: ["Makkah", "Madinah"],
      commercial_month_label: "October Umrah 2026",
      status: "PLANNING",
      default_nights: 10,
      starting_price_minor_units: 5200000,
      starting_price_currency: "UGX",
      start_date: "2026-10-08",
      end_date: "2026-10-18",
      cover_image: null,
      featured: true,
      packages_count: 1,
    },
  ],
};

const fallbackTripDetailsBySlug: Record<string, Record<string, unknown>> = {
  [featuredJourneySlug]: {
    id: "trip-fenna-2026",
    code: "FENNA2026",
    commercial_month_label: "July Umrah 2026",
    name: "Fenna Umrah Season II, This July",
    slug: featuredJourneySlug,
    excerpt:
      "Fenna Umrah is Al Hilal’s seasonal group departure to Makkah and Madinah—Season II departs this July with structured support so worship stays first.",
    seo_title: "Fenna Umrah Season II, This July | Al Hilal",
    seo_description:
      "Season II Fenna Umrah this July: dates, packages, and Al Hilal support from Kampala to the Haram.",
    cities: ["Makkah", "Madinah"],
    status: "OPEN_FOR_SALES",
    default_nights: 8,
    start_date: "2026-07-12",
    end_date: "2026-07-20",
    featured: true,
    packages: [
      {
        id: "pkg-fenna-family",
        package_code: "FENNA-FAMILY",
        name: "Family and Group Package",
        start_date: "2026-07-12",
        end_date: "2026-07-20",
        nights: 8,
        price_minor_units: 4650000,
        currency: "UGX",
        capacity: 200,
        sales_target: 200,
        hotel_booking_month: "APRIL",
        airline_booking_month: "MARCH",
        status: "SELLING",
        flights: [],
        hotels: [
          {
            id: "fenna-hotel-makkah",
            name: "Makkah partner hotel",
            address: "Makkah",
            room_type: "Quad",
            check_in: "2026-07-12",
            check_out: "2026-07-16",
          },
          {
            id: "fenna-hotel-madinah",
            name: "Madinah partner hotel",
            address: "Madinah",
            room_type: "Quad",
            check_in: "2026-07-16",
            check_out: "2026-07-20",
          },
        ],
      },
    ],
    itinerary: [
      {
        id: "fenna-day-1",
        day_index: 1,
        title: "Departure from Kampala",
        location: "Kampala to Jeddah",
        notes: "Final coordination and travel briefing before the outbound journey.",
      },
      {
        id: "fenna-day-3",
        day_index: 3,
        title: "Guided ziyarah and worship schedule",
        location: "Madinah",
        notes:
          "Practical support for first-timers and families during the active trip window.",
      },
    ],
    has_itinerary: true,
    milestones: [
      {
        id: "fenna-milestone-1",
        milestone_type: "DARASA_ONE",
        title: "Pre-departure guidance open",
        status: "ON_TRACK",
        target_date: "2026-06-20",
        actual_date: null,
        notes:
          "Guidance covers documents, adab, and expectations for first-timers and sponsor-assisted travellers.",
        package_name: null,
      },
    ],
    guide_sections: [
      {
        id: "fenna-guide-1",
        order: 1,
        title: "What is included",
        content_md:
          "Return travel, accommodation, visa support, ground transport, guided ziyarah, and active-trip coordination are included in this departure path.",
      },
      {
        id: "fenna-guide-2",
        order: 2,
        title: "Who this journey suits",
        content_md:
          "This is a strong July option for first-timers, couples, families, small groups, and sponsor-assisted bookings that need a cleaner planning path.",
      },
    ],
    emergency_contacts: [
      {
        id: "fenna-contact-1",
        label: "Trip operations line",
        phone: "+256700773535",
        hours: "24/7 during active travel",
        notes: "For urgent travel issues once the departure is active.",
      },
    ],
    faqs: [
      {
        id: "fenna-faq-1",
        question: "Who is this July departure best suited for?",
        answer:
          "It works well for first-time pilgrims, family planners, and sponsor-assisted bookings that need clearer support before commitment.",
        order: 1,
      },
      {
        id: "fenna-faq-2",
        question: "Is the published price final?",
        answer:
          "The visible figure is the starting point. Final confirmation depends on package fit, rooming, and traveller-specific requirements discussed during consultation.",
        order: 2,
      },
    ],
  },
  [primaryJourneySlug]: {
    id: "trip-jan-2027",
    code: "JAN27",
    commercial_month_label: "January Umrah 2027",
    name: "January Umrah 2027",
    slug: primaryJourneySlug,
    excerpt: "A January departure with published itinerary, support proof, and multiple packages.",
    seo_title: "January Umrah 2027 | Al Hilal",
    seo_description: "Published January departure with truthful package and support details.",
    cities: ["Makkah", "Madinah"],
    status: "OPEN_FOR_SALES",
    default_nights: 8,
    start_date: "2027-01-15",
    end_date: "2027-01-23",
    featured: true,
    packages: [
      {
        id: "pkg-jan-premium",
        package_code: "JAN27-PREMIUM",
        name: "Premium",
        start_date: "2027-01-15",
        end_date: "2027-01-23",
        nights: 8,
        price_minor_units: 4650000,
        currency: "UGX",
        capacity: 24,
        sales_target: 20,
        hotel_booking_month: "JUNE",
        airline_booking_month: "APRIL",
        status: "SELLING",
        flights: [
          {
            id: "flt-out-1",
            leg: "OUTBOUND",
            carrier: "Qatar Airways",
            flight_no: "QR1380",
            dep_airport: "EBB",
            dep_dt: "2027-01-15T08:00:00Z",
            arr_airport: "JED",
            arr_dt: "2027-01-15T16:00:00Z",
          },
        ],
        hotels: [
          {
            id: "hotel-1",
            name: "Hilton Suites Makkah",
            address: "Makkah",
            room_type: "Quad",
            check_in: "2027-01-15",
            check_out: "2027-01-20",
          },
        ],
      },
      {
        id: "pkg-jan-family",
        package_code: "JAN27-FAMILY",
        name: "Family Saver",
        start_date: "2027-01-15",
        end_date: "2027-01-24",
        nights: 9,
        price_minor_units: 5200000,
        currency: "UGX",
        capacity: 18,
        sales_target: 18,
        hotel_booking_month: "JUNE",
        airline_booking_month: "APRIL",
        status: "WAITLIST",
        flights: [],
        hotels: [],
      },
    ],
    itinerary: [
      {
        id: "iti-1",
        day_index: 1,
        title: "Arrival in Madinah",
        location: "Madinah",
        notes: "Meet the Al Hilal lead and settle into the hotel.",
      },
      {
        id: "iti-2",
        day_index: 3,
        title: "Transfer to Makkah",
        location: "Makkah",
        notes: "Coach transfer after the Madinah program.",
      },
    ],
    has_itinerary: true,
    milestones: [
      {
        id: "milestone-1",
        milestone_type: "DARASA_ONE",
        title: "First darasa published",
        status: "SCHEDULED",
        target_date: "2027-01-03",
        actual_date: null,
        notes: "Pre-departure preparation for first-timers and family coordinators.",
        package_name: null,
      },
    ],
    guide_sections: [
      {
        id: "guide-1",
        order: 1,
        title: "Documents and names",
        content_md:
          "Prepare passports, traveller names, and sponsor approvals early so the booking path stays calm.",
      },
      {
        id: "guide-2",
        order: 2,
        title: "Family planning",
        content_md:
          "Families should clarify rooming, elders, and who needs to approve decisions before package lock-in.",
      },
    ],
    emergency_contacts: [
      {
        id: "contact-1",
        label: "Trip operations line",
        phone: "+256700773535",
        hours: "24/7 during active travel",
        notes: "For active-trip emergencies and urgent travel issues.",
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "Do I need to be ready to pay before I ask questions?",
        answer:
          "No. You can start with dates, support needs, or family concerns before payment decisions are made.",
        order: 1,
      },
    ],
  },
  [familyJourneySlug]: {
    id: "trip-oct-2026",
    code: "OCT26",
    commercial_month_label: "October Umrah 2026",
    name: "Family Umrah October 2026",
    slug: familyJourneySlug,
    excerpt: "A calmer October departure with one package and family-support positioning.",
    seo_title: "Family Umrah October 2026 | Al Hilal",
    seo_description: "October family departure with published dates and price direction.",
    cities: ["Makkah", "Madinah"],
    status: "PLANNING",
    default_nights: 10,
    start_date: "2026-10-08",
    end_date: "2026-10-18",
    featured: true,
    packages: [
      {
        id: "pkg-oct-family",
        package_code: "OCT26-FAMILY",
        name: "Family Group",
        start_date: "2026-10-08",
        end_date: "2026-10-18",
        nights: 10,
        price_minor_units: 5200000,
        currency: "UGX",
        status: "SELLING",
        flights: [],
        hotels: [],
      },
    ],
    itinerary: [],
    has_itinerary: false,
    milestones: [],
    guide_sections: [],
    emergency_contacts: [],
    faqs: [],
  },
};

export function getFallbackPublicJourneys(): PublicJourneyListItem[] {
  return fallbackTripListResponse.results.map((item) => normalizeJourneyListItem(item));
}

/** Home journey grid: next `limit` journeys, featured first, then by departure date. */
export function selectHomeJourneyPreview(
  journeys: PublicJourneyListItem[],
  limit = 3,
): PublicJourneyListItem[] {
  const byStart = (a: PublicJourneyListItem, b: PublicJourneyListItem) =>
    a.startDate.localeCompare(b.startDate);
  return [...journeys]
    .sort((a, b) => {
      if (a.featured !== b.featured) {
        return a.featured ? -1 : 1;
      }
      return byStart(a, b);
    })
    .slice(0, limit);
}

export function getFallbackPublicJourneyBySlug(slug: string): PublicJourneyDetail | null {
  const fallback = fallbackTripDetailsBySlug[slug];
  if (fallback) {
    return normalizeJourneyDetail(fallback);
  }
  return null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function nullableStringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && !Number.isNaN(value) ? value : null;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function computeNights(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return Math.max(Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)), 0);
}

export function normalizeJourneyListItem(rawValue: unknown): PublicJourneyListItem {
  const raw = recordValue(rawValue);
  return {
    id: String(raw.id ?? ""),
    code: stringValue(raw.code),
    name: stringValue(raw.name),
    slug: stringValue(raw.slug),
    excerpt: stringValue(raw.excerpt),
    seoTitle: stringValue(raw.seo_title) || stringValue(raw.seoTitle),
    seoDescription: stringValue(raw.seo_description) || stringValue(raw.seoDescription),
    cities: stringArrayValue(raw.cities),
    commercialMonthLabel:
      nullableStringValue(raw.commercial_month_label) ||
      nullableStringValue(raw.commercialMonthLabel),
    status: stringValue(raw.status),
    defaultNights: numberValue(raw.default_nights) ?? numberValue(raw.defaultNights),
    startingPriceMinorUnits:
      numberValue(raw.starting_price_minor_units) ?? numberValue(raw.startingPriceMinorUnits),
    startingPriceCurrency:
      nullableStringValue(raw.starting_price_currency) ||
      nullableStringValue(raw.startingPriceCurrency),
    startDate: stringValue(raw.start_date) || stringValue(raw.startDate),
    endDate: stringValue(raw.end_date) || stringValue(raw.endDate),
    coverImage: nullableStringValue(raw.cover_image) || nullableStringValue(raw.coverImage),
    featured: Boolean(raw.featured),
    packagesCount: Number(raw.packages_count ?? raw.packagesCount ?? 0),
  };
}

function normalizeJourneyPackage(rawValue: unknown): PublicJourneyPackage {
  const raw = recordValue(rawValue);
  const startDate = stringValue(raw.start_date) || stringValue(raw.startDate);
  const endDate = stringValue(raw.end_date) || stringValue(raw.endDate);
  return {
    id: String(raw.id ?? ""),
    packageCode: nullableStringValue(raw.package_code) || nullableStringValue(raw.packageCode),
    name: stringValue(raw.name),
    startDate,
    endDate,
    nights: numberValue(raw.nights) ?? computeNights(startDate, endDate),
    priceMinorUnits: numberValue(raw.price_minor_units) ?? numberValue(raw.priceMinorUnits),
    currency: nullableStringValue(raw.currency),
    capacity: numberValue(raw.capacity),
    salesTarget: numberValue(raw.sales_target) ?? numberValue(raw.salesTarget),
    hotelBookingMonth:
      nullableStringValue(raw.hotel_booking_month) || nullableStringValue(raw.hotelBookingMonth),
    airlineBookingMonth:
      nullableStringValue(raw.airline_booking_month) ||
      nullableStringValue(raw.airlineBookingMonth),
    status: nullableStringValue(raw.status),
    flights: arrayValue(raw.flights).map((flight) => {
      const item = recordValue(flight);
      return {
        id: String(item.id ?? ""),
        leg: stringValue(item.leg),
        carrier: stringValue(item.carrier),
        flightNo: stringValue(item.flight_no) || stringValue(item.flightNo),
        depAirport: stringValue(item.dep_airport) || stringValue(item.depAirport),
        depDt: stringValue(item.dep_dt) || stringValue(item.depDt),
        arrAirport: stringValue(item.arr_airport) || stringValue(item.arrAirport),
        arrDt: stringValue(item.arr_dt) || stringValue(item.arrDt),
      };
    }),
    hotels: arrayValue(raw.hotels).map((hotel) => {
      const item = recordValue(hotel);
      return {
        id: String(item.id ?? ""),
        name: stringValue(item.name),
        address: nullableStringValue(item.address),
        roomType: nullableStringValue(item.room_type) || nullableStringValue(item.roomType),
        checkIn: nullableStringValue(item.check_in) || nullableStringValue(item.checkIn),
        checkOut: nullableStringValue(item.check_out) || nullableStringValue(item.checkOut),
      };
    }),
  };
}

export function normalizeJourneyDetail(rawValue: unknown): PublicJourneyDetail {
  const raw = recordValue(rawValue);
  const listItem = normalizeJourneyListItem(raw);
  const packages = arrayValue(raw.packages).map(normalizeJourneyPackage);
  const itinerary = arrayValue(raw.itinerary)
    .map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ""),
        dayIndex: Number(record.day_index ?? record.dayIndex ?? 0),
        startTime: nullableStringValue(record.start_time) || nullableStringValue(record.startTime),
        endTime: nullableStringValue(record.end_time) || nullableStringValue(record.endTime),
        title: stringValue(record.title),
        location: nullableStringValue(record.location),
        notes: nullableStringValue(record.notes),
      };
    })
    .sort((left, right) => left.dayIndex - right.dayIndex);
  const guideSections = arrayValue(raw.guide_sections ?? raw.guideSections)
    .map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ""),
        order: Number(record.order ?? 0),
        title: stringValue(record.title),
        contentMd: stringValue(record.content_md) || stringValue(record.contentMd),
      };
    })
    .sort((left, right) => left.order - right.order);

  const pricedPackages = packages.filter((item) => typeof item.priceMinorUnits === "number");
  const startingPackage = pricedPackages.sort(
    (left, right) => (left.priceMinorUnits || 0) - (right.priceMinorUnits || 0),
  )[0];

  return {
    ...listItem,
    defaultNights:
      listItem.defaultNights ??
      packages.find((item) => typeof item.nights === "number")?.nights ??
      computeNights(listItem.startDate, listItem.endDate),
    startingPriceMinorUnits: listItem.startingPriceMinorUnits ?? startingPackage?.priceMinorUnits ?? null,
    startingPriceCurrency: listItem.startingPriceCurrency ?? startingPackage?.currency ?? null,
    packagesCount: listItem.packagesCount || packages.length,
    packages,
    itinerary,
    hasItinerary: Boolean(raw.has_itinerary ?? raw.hasItinerary ?? itinerary.length),
    milestones: arrayValue(raw.milestones).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ""),
        milestoneType: stringValue(record.milestone_type) || stringValue(record.milestoneType),
        title: stringValue(record.title),
        status: stringValue(record.status),
        targetDate: nullableStringValue(record.target_date) || nullableStringValue(record.targetDate),
        actualDate: nullableStringValue(record.actual_date) || nullableStringValue(record.actualDate),
        notes: nullableStringValue(record.notes),
        packageName: nullableStringValue(record.package_name) || nullableStringValue(record.packageName),
      };
    }),
    faqs: arrayValue(raw.faqs).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ""),
        question: stringValue(record.question),
        answer: stringValue(record.answer),
        order: numberValue(record.order) ?? undefined,
      };
    }),
    guideSections,
    emergencyContacts: arrayValue(raw.emergency_contacts ?? raw.emergencyContacts).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ""),
        label: stringValue(record.label),
        phone: stringValue(record.phone),
        hours: nullableStringValue(record.hours),
        notes: nullableStringValue(record.notes),
      };
    }),
  };
}

function getApiBaseUrl(): string {
  return appEnv.apiBaseUrl;
}

async function fetchPublicApi(path: string): Promise<unknown | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}${path.replace(/^\//, "")}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch {
    return null;
  }
}

export async function getPublicJourneys(): Promise<PublicJourneyListItem[]> {
  const payload = await fetchPublicApi("public/trips/");
  const payloadRecord = recordValue(payload);
  const results = Array.isArray(payload) ? payload : payloadRecord.results;
  if (!Array.isArray(results) || !results.length) {
    return [];
  }
  return results.map((item) => normalizeJourneyListItem(item)).filter((journey) => journey.slug);
}

export async function getPublicJourneyBySlug(slug: string): Promise<PublicJourneyDetail | null> {
  const payload = await fetchPublicApi(`public/trips/slug/${slug}/`);
  if (payload) {
    return normalizeJourneyDetail(payload);
  }

  const journeys = await getPublicJourneys();
  const matchingJourney = journeys.find((journey) => journey.slug === slug);
  if (!matchingJourney) {
    return null;
  }

  const legacyPayload = await fetchPublicApi(`public/trips/${matchingJourney.id}/`);
  if (!legacyPayload) {
    return null;
  }

  const legacy = recordValue(legacyPayload);
  return normalizeJourneyDetail({
    ...legacy,
    slug: matchingJourney.slug,
    excerpt: matchingJourney.excerpt,
    seo_title: matchingJourney.seoTitle,
    seo_description: matchingJourney.seoDescription,
  });
}
