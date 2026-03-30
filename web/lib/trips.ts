import { fennaJourneyFallback } from "@/lib/content/fenna";

export type JourneyListItem = {
  id: string;
  code: string;
  name: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  cities: string[];
  startDate: string;
  endDate: string;
  coverImage?: string | null;
  featured: boolean;
  packagesCount: number;
};

export type JourneyPackage = {
  id: string;
  name: string;
  priceMinorUnits?: number | null;
  currency?: string | null;
  capacity?: number | null;
  flights: Array<{
    id: string;
    leg: string;
    carrier: string;
    flightNo: string;
    depAirport: string;
    depDt: string;
    arrAirport: string;
    arrDt: string;
  }>;
  hotels: Array<{
    id: string;
    name: string;
    address?: string | null;
    roomType?: string | null;
    checkIn?: string | null;
    checkOut?: string | null;
  }>;
};

export type JourneyDetail = JourneyListItem & {
  packages: JourneyPackage[];
  itinerary: Array<{
    id: string;
    dayIndex: number;
    startTime?: string | null;
    endTime?: string | null;
    title: string;
    location?: string | null;
    notes?: string | null;
  }>;
  hasItinerary: boolean;
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    order?: number;
  }>;
  guideSections: Array<{
    id: string;
    order: number;
    title: string;
    contentMd: string;
  }>;
  emergencyContacts: Array<{
    id: string;
    label: string;
    phone: string;
    hours?: string | null;
    notes?: string | null;
  }>;
};

type ApiRecord = Record<string, unknown>;

const RAW_API_BASE_URL =
  process.env.API_URL_INTERNAL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1/";
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/") ? RAW_API_BASE_URL : `${RAW_API_BASE_URL}/`;

async function fetchPublicApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path.replace(/^\//, "")}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function toLocalSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : "";
}

function nullableStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

function arrayValue(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): ApiRecord {
  return typeof value === "object" && value !== null ? (value as ApiRecord) : {};
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function normalizeJourneyListItem(raw: ApiRecord): JourneyListItem {
  const derivedSlug = stringValue(raw.slug) || stringValue(raw.seo_slug) || toLocalSlug(stringValue(raw.name) || stringValue(raw.code));

  return {
    id: String(raw.id),
    code: stringValue(raw.code),
    name: stringValue(raw.name),
    slug: derivedSlug,
    excerpt: stringValue(raw.excerpt),
    seoTitle: stringValue(raw.seo_title) || stringValue(raw.seoTitle),
    seoDescription: stringValue(raw.seo_description) || stringValue(raw.seoDescription),
    cities: stringArrayValue(raw.cities),
    startDate: stringValue(raw.start_date) || stringValue(raw.startDate),
    endDate: stringValue(raw.end_date) || stringValue(raw.endDate),
    coverImage: nullableStringValue(raw.cover_image) || nullableStringValue(raw.coverImage),
    featured: Boolean(raw.featured),
    packagesCount: Number(raw.packages_count ?? raw.packagesCount ?? 0),
  };
}

function normalizeJourneyPackage(raw: ApiRecord): JourneyPackage {
  return {
    id: String(raw.id),
    name: stringValue(raw.name),
    priceMinorUnits: numberValue(raw.price_minor_units) ?? numberValue(raw.priceMinorUnits),
    currency: nullableStringValue(raw.currency),
    capacity: numberValue(raw.capacity),
    flights: arrayValue(raw.flights).map((flight) => {
        const flightRecord = recordValue(flight);
        return {
          id: String(flightRecord.id),
          leg: stringValue(flightRecord.leg),
          carrier: stringValue(flightRecord.carrier),
          flightNo: stringValue(flightRecord.flight_no) || stringValue(flightRecord.flightNo),
          depAirport: stringValue(flightRecord.dep_airport) || stringValue(flightRecord.depAirport),
          depDt: stringValue(flightRecord.dep_dt) || stringValue(flightRecord.depDt),
          arrAirport: stringValue(flightRecord.arr_airport) || stringValue(flightRecord.arrAirport),
          arrDt: stringValue(flightRecord.arr_dt) || stringValue(flightRecord.arrDt),
        };
      }),
    hotels: arrayValue(raw.hotels).map((hotel) => {
        const hotelRecord = recordValue(hotel);
        return {
          id: String(hotelRecord.id),
          name: stringValue(hotelRecord.name),
          address: nullableStringValue(hotelRecord.address),
          roomType: nullableStringValue(hotelRecord.room_type) || nullableStringValue(hotelRecord.roomType),
          checkIn: nullableStringValue(hotelRecord.check_in) || nullableStringValue(hotelRecord.checkIn),
          checkOut: nullableStringValue(hotelRecord.check_out) || nullableStringValue(hotelRecord.checkOut),
        };
      }),
  };
}

function normalizeJourneyDetail(raw: ApiRecord): JourneyDetail {
  const listItem = normalizeJourneyListItem(raw);

  return {
    ...listItem,
    packages: arrayValue(raw.packages).map((packageItem) => normalizeJourneyPackage(recordValue(packageItem))),
    itinerary: arrayValue(raw.itinerary).map((item) => {
        const itemRecord = recordValue(item);
        return {
          id: String(itemRecord.id),
          dayIndex: Number(itemRecord.day_index ?? itemRecord.dayIndex ?? 0),
          startTime: nullableStringValue(itemRecord.start_time) || nullableStringValue(itemRecord.startTime),
          endTime: nullableStringValue(itemRecord.end_time) || nullableStringValue(itemRecord.endTime),
          title: stringValue(itemRecord.title),
          location: nullableStringValue(itemRecord.location),
          notes: nullableStringValue(itemRecord.notes),
        };
      }),
    hasItinerary: Boolean(raw.has_itinerary ?? raw.hasItinerary),
    faqs: arrayValue(raw.faqs).map((faq) => {
        const faqRecord = recordValue(faq);
        return {
          id: String(faqRecord.id),
          question: stringValue(faqRecord.question),
          answer: stringValue(faqRecord.answer),
          order: numberValue(faqRecord.order) ?? undefined,
        };
      }),
    guideSections: arrayValue(raw.guide_sections ?? raw.guideSections).map((section) => {
        const sectionRecord = recordValue(section);
        return {
          id: String(sectionRecord.id),
          order: Number(sectionRecord.order ?? 0),
          title: stringValue(sectionRecord.title),
          contentMd: stringValue(sectionRecord.content_md) || stringValue(sectionRecord.contentMd),
        };
      }),
    emergencyContacts: arrayValue(raw.emergency_contacts ?? raw.emergencyContacts).map((contact) => {
        const contactRecord = recordValue(contact);
        return {
          id: String(contactRecord.id),
          label: stringValue(contactRecord.label),
          phone: stringValue(contactRecord.phone),
          hours: nullableStringValue(contactRecord.hours),
          notes: nullableStringValue(contactRecord.notes),
        };
      }),
  };
}

function getFallbackJourneyList(): JourneyListItem[] {
  return [normalizeJourneyListItem(fennaJourneyFallback as unknown as ApiRecord)];
}

function getFallbackJourneyDetail(slug: string): JourneyDetail | null {
  if (slug !== fennaJourneyFallback.slug) {
    return null;
  }

  return normalizeJourneyDetail(fennaJourneyFallback as unknown as ApiRecord);
}

export async function getPublicJourneys(): Promise<JourneyListItem[]> {
  const payload = await fetchPublicApi<{ results?: ApiRecord[] } | ApiRecord[]>("public/trips/");
  const results = Array.isArray(payload) ? payload : payload?.results;

  if (!results?.length) {
    return getFallbackJourneyList();
  }

  const journeys = results.map(normalizeJourneyListItem).filter((journey) => journey.slug);

  if (!journeys.some((journey) => journey.slug === fennaJourneyFallback.slug)) {
    journeys.unshift(normalizeJourneyListItem(fennaJourneyFallback as unknown as ApiRecord));
  }

  return journeys;
}

export async function getPublicJourneyBySlug(slug: string): Promise<JourneyDetail | null> {
  const payload = await fetchPublicApi<ApiRecord>(`public/trips/slug/${slug}/`);

  if (!payload) {
    const journeys = await getPublicJourneys();
    const matchingJourney = journeys.find((journey) => journey.slug === slug);

    if (!matchingJourney) {
      return getFallbackJourneyDetail(slug);
    }

    const legacyPayload = await fetchPublicApi<ApiRecord>(`public/trips/${matchingJourney.id}/`);
    if (legacyPayload) {
      return normalizeJourneyDetail({
        ...legacyPayload,
        slug: matchingJourney.slug,
        excerpt: matchingJourney.excerpt,
        seo_title: matchingJourney.seoTitle,
        seo_description: matchingJourney.seoDescription,
      });
    }

    return getFallbackJourneyDetail(slug);
  }

  return normalizeJourneyDetail(payload);
}
