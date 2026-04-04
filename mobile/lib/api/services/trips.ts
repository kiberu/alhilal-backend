import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Type Definitions for Trip APIs
export interface TripPackage {
  id: string;
  package_code: string;
  name: string;
  start_date: string;
  end_date: string;
  nights: number;
  price_minor_units: number;
  currency: string;
  capacity: number;
  sales_target: number | null;
  hotel_booking_month: string;
  airline_booking_month: string;
  status: string;
  flights: PackageFlight[];
  hotels: PackageHotel[];
}

export interface PackageFlight {
  id: string;
  leg: string;
  carrier: string;
  flight_no: string;
  dep_airport: string;
  dep_dt: string;
  arr_airport: string;
  arr_dt: string;
  group_pnr: string | null;
}

export interface PackageHotel {
  id: string;
  name: string;
  address: string | null;
  room_type: string | null;
  check_in: string;
  check_out: string;
  group_confirmation_no: string | null;
}

export interface ItineraryItem {
  id: string;
  day_index: number;
  start_time: string | null;
  end_time: string | null;
  title: string;
  location: string | null;
  notes: string | null;
  attach_url_signed: string | null;
  updated_at: string;
}

export interface TripFAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface TripGuideSection {
  id: string;
  order: number;
  title: string;
  content_md: string;
  attach_url_signed: string | null;
}

export interface EmergencyContact {
  id: string;
  label: string;
  phone: string;
  hours: string | null;
  notes: string | null;
}

export interface Trip {
  id: string;
  code: string;
  commercial_month_label: string | null;
  status: string;
  default_nights: number | null;
  name: string;
  cities: string[];
  start_date: string;
  end_date: string;
  cover_image: string | null;
  featured: boolean;
  packages_count: number;
  updated_at: string;
}

export interface TripDetail {
  id: string;
  code: string;
  family_code?: string;
  commercial_month_label?: string | null;
  status?: string | null;
  sales_open_date?: string | null;
  default_nights?: number | null;
  name: string;
  cities: string[];
  start_date: string;
  end_date: string;
  cover_image: string | null;
  featured: boolean;
  packages: TripPackage[];
  itinerary: ItineraryItem[];
  has_itinerary: boolean;
  faqs: TripFAQ[];
  guide_sections: TripGuideSection[];
  emergency_contacts: EmergencyContact[];
  updated_at?: string;
}

export interface PublicTrip {
  id: string;
  code: string;
  commercial_month_label: string | null;
  status: string;
  default_nights: number | null;
  name: string;
  slug: string;
  excerpt: string;
  seo_title: string;
  seo_description: string;
  cities: string[];
  start_date: string;
  end_date: string;
  cover_image: string | null;
  featured: boolean;
  packages_count: number;
  starting_price_minor_units: number | null;
  starting_price_currency: string | null;
  updated_at: string;
}

export interface PublicTripDetail extends PublicTrip {
  family_code?: string;
  sales_open_date?: string | null;
  packages: TripPackage[];
  itinerary: ItineraryItem[];
  has_itinerary: boolean;
  faqs: TripFAQ[];
  guide_sections: TripGuideSection[];
  emergency_contacts: EmergencyContact[];
  milestones: TripMilestone[];
}

export interface TripMilestone {
  id: string;
  milestone_type: string;
  title: string;
  status: string;
  target_date: string | null;
  actual_date: string | null;
  notes: string;
  package_name: string | null;
  updated_at: string;
}

export interface TripResource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  viewer_mode: string;
  is_pinned: boolean;
  published_at: string | null;
  file_format: string | null;
  metadata: Record<string, unknown>;
  package_name: string | null;
  file_url_signed: string | null;
  updated_at: string;
}

export interface TripReadinessChecks {
  profile_complete: boolean;
  passport_valid: boolean;
  visa_verified: boolean;
  documents_complete: boolean;
  payment_target_met: boolean;
  ticket_issued: boolean;
  darasa_one_completed: boolean;
  darasa_two_completed: boolean;
  send_off_completed: boolean;
}

export interface TripReadiness {
  id: string;
  booking_reference: string;
  trip_code: string;
  package_name: string;
  status: string;
  ready_for_travel: boolean;
  payment_progress_percent: number;
  payment_target_percent: number;
  validated_at: string | null;
  checks: TripReadinessChecks;
  missing_items: string[];
  blockers: string[];
  updated_at: string;
}

export interface TripEssentials {
  sections: TripGuideSection[];
  checklist: any[];
  contacts: EmergencyContact[];
  faqs: TripFAQ[];
  milestones: TripMilestone[];
  resources: TripResource[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function nullableStringValue(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === 'number' && !Number.isNaN(value) ? value : null;
}

function arrayValue(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function recordValue(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
}

function stringArrayValue(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function computeNights(startDate?: string, endDate?: string) {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.max(Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)), 0);
}

function normalizePackageFlight(rawValue: unknown): PackageFlight {
  const raw = recordValue(rawValue);
  return {
    id: String(raw.id ?? ''),
    leg: stringValue(raw.leg),
    carrier: stringValue(raw.carrier),
    flight_no: stringValue(raw.flight_no ?? raw.flightNo),
    dep_airport: stringValue(raw.dep_airport ?? raw.depAirport),
    dep_dt: stringValue(raw.dep_dt ?? raw.depDt),
    arr_airport: stringValue(raw.arr_airport ?? raw.arrAirport),
    arr_dt: stringValue(raw.arr_dt ?? raw.arrDt),
    group_pnr: nullableStringValue(raw.group_pnr ?? raw.groupPnr),
  };
}

function normalizePackageHotel(rawValue: unknown): PackageHotel {
  const raw = recordValue(rawValue);
  return {
    id: String(raw.id ?? ''),
    name: stringValue(raw.name),
    address: nullableStringValue(raw.address),
    room_type: nullableStringValue(raw.room_type ?? raw.roomType),
    check_in: stringValue(raw.check_in ?? raw.checkIn),
    check_out: stringValue(raw.check_out ?? raw.checkOut),
    group_confirmation_no: nullableStringValue(raw.group_confirmation_no ?? raw.groupConfirmationNo),
  };
}

function normalizeTripPackage(rawValue: unknown): TripPackage {
  const raw = recordValue(rawValue);
  const startDate = stringValue(raw.start_date ?? raw.startDate);
  const endDate = stringValue(raw.end_date ?? raw.endDate);
  return {
    id: String(raw.id ?? ''),
    package_code: stringValue(raw.package_code ?? raw.packageCode),
    name: stringValue(raw.name),
    start_date: startDate,
    end_date: endDate,
    nights: numberValue(raw.nights) ?? computeNights(startDate, endDate) ?? 0,
    price_minor_units: numberValue(raw.price_minor_units ?? raw.priceMinorUnits) ?? 0,
    currency: stringValue(raw.currency) || 'UGX',
    capacity: numberValue(raw.capacity) ?? 0,
    sales_target: numberValue(raw.sales_target ?? raw.salesTarget),
    hotel_booking_month:
      stringValue(raw.hotel_booking_month ?? raw.hotelBookingMonth),
    airline_booking_month:
      stringValue(raw.airline_booking_month ?? raw.airlineBookingMonth),
    status: stringValue(raw.status),
    flights: arrayValue(raw.flights).map(normalizePackageFlight),
    hotels: arrayValue(raw.hotels).map(normalizePackageHotel),
  };
}

export function normalizePublicTrip(rawValue: unknown): PublicTrip {
  const raw = recordValue(rawValue);
  return {
    id: String(raw.id ?? ''),
    code: stringValue(raw.code),
    commercial_month_label:
      nullableStringValue(raw.commercial_month_label ?? raw.commercialMonthLabel),
    status: stringValue(raw.status),
    default_nights: numberValue(raw.default_nights ?? raw.defaultNights),
    name: stringValue(raw.name),
    slug: stringValue(raw.slug),
    excerpt: stringValue(raw.excerpt),
    seo_title: stringValue(raw.seo_title ?? raw.seoTitle),
    seo_description: stringValue(raw.seo_description ?? raw.seoDescription),
    cities: stringArrayValue(raw.cities),
    start_date: stringValue(raw.start_date ?? raw.startDate),
    end_date: stringValue(raw.end_date ?? raw.endDate),
    cover_image: nullableStringValue(raw.cover_image ?? raw.coverImage),
    featured: Boolean(raw.featured),
    packages_count: Number(raw.packages_count ?? raw.packagesCount ?? 0),
    starting_price_minor_units:
      numberValue(raw.starting_price_minor_units ?? raw.startingPriceMinorUnits),
    starting_price_currency:
      nullableStringValue(raw.starting_price_currency ?? raw.startingPriceCurrency),
    updated_at: stringValue(raw.updated_at ?? raw.updatedAt),
  };
}

export function normalizePublicTripDetail(rawValue: unknown): PublicTripDetail {
  const raw = recordValue(rawValue);
  const packages = arrayValue(raw.packages).map(normalizeTripPackage);
  const pricedPackages = packages.filter((item) => typeof item.price_minor_units === 'number');
  const lowestPrice = pricedPackages
    .slice()
    .sort((left, right) => left.price_minor_units - right.price_minor_units)[0];

  const base = normalizePublicTrip({
    ...raw,
    packages_count: raw.packages_count ?? packages.length,
    starting_price_minor_units:
      raw.starting_price_minor_units ?? lowestPrice?.price_minor_units ?? null,
    starting_price_currency:
      raw.starting_price_currency ?? lowestPrice?.currency ?? null,
    default_nights:
      raw.default_nights ??
      packages.find((item) => typeof item.nights === 'number')?.nights ??
      computeNights(
        stringValue(raw.start_date ?? raw.startDate),
        stringValue(raw.end_date ?? raw.endDate)
      ),
  });

  return {
    ...base,
    family_code: stringValue(raw.family_code ?? raw.familyCode) || undefined,
    sales_open_date: nullableStringValue(raw.sales_open_date ?? raw.salesOpenDate),
    packages,
    itinerary: arrayValue(raw.itinerary).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ''),
        day_index: Number(record.day_index ?? record.dayIndex ?? 0),
        start_time: nullableStringValue(record.start_time ?? record.startTime),
        end_time: nullableStringValue(record.end_time ?? record.endTime),
        title: stringValue(record.title),
        location: nullableStringValue(record.location),
        notes: nullableStringValue(record.notes),
        attach_url_signed: nullableStringValue(record.attach_url_signed ?? record.attachUrlSigned),
        updated_at: stringValue(record.updated_at ?? record.updatedAt),
      };
    }),
    has_itinerary: Boolean(raw.has_itinerary ?? raw.hasItinerary ?? arrayValue(raw.itinerary).length),
    faqs: arrayValue(raw.faqs).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ''),
        question: stringValue(record.question),
        answer: stringValue(record.answer),
        order: Number(record.order ?? 0),
      };
    }),
    guide_sections: arrayValue(raw.guide_sections ?? raw.guideSections)
      .map((item) => {
        const record = recordValue(item);
        return {
          id: String(record.id ?? ''),
          order: Number(record.order ?? 0),
          title: stringValue(record.title),
          content_md: stringValue(record.content_md ?? record.contentMd),
          attach_url_signed: nullableStringValue(record.attach_url_signed ?? record.attachUrlSigned),
        };
      })
      .sort((left, right) => left.order - right.order),
    emergency_contacts: arrayValue(raw.emergency_contacts ?? raw.emergencyContacts).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ''),
        label: stringValue(record.label),
        phone: stringValue(record.phone),
        hours: nullableStringValue(record.hours),
        notes: nullableStringValue(record.notes),
      };
    }),
    milestones: arrayValue(raw.milestones).map((item) => {
      const record = recordValue(item);
      return {
        id: String(record.id ?? ''),
        milestone_type: stringValue(record.milestone_type ?? record.milestoneType),
        title: stringValue(record.title),
        status: stringValue(record.status),
        target_date: nullableStringValue(record.target_date ?? record.targetDate),
        actual_date: nullableStringValue(record.actual_date ?? record.actualDate),
        notes: stringValue(record.notes),
        package_name: nullableStringValue(record.package_name ?? record.packageName),
        updated_at: stringValue(record.updated_at ?? record.updatedAt),
      };
    }),
  };
}

/**
 * Trips Service - handles all trip-related API calls
 */
export class TripsService {
  /**
   * Fetch all public trips (no auth required)
   */
  static async getPublicTrips(featured?: boolean): Promise<ApiResponse<PaginatedResponse<PublicTrip>>> {
    const params = featured !== undefined ? { featured: String(featured) } : undefined;
    const response = await apiClient.get<unknown>(API_ENDPOINTS.TRIPS.PUBLIC_LIST, params);
    if (!response.success || !response.data) {
      return response as ApiResponse<PaginatedResponse<PublicTrip>>;
    }

    const raw = recordValue(response.data);
    const results = arrayValue(raw.results).map(normalizePublicTrip).filter((item) => item.id || item.slug);
    return {
      ...response,
      data: {
        count: Number(raw.count ?? results.length),
        next: nullableStringValue(raw.next),
        previous: nullableStringValue(raw.previous),
        results,
      },
    };
  }

  /**
   * Fetch a single public trip detail (no auth required)
   */
  static async getPublicTripDetail(tripIdentifier: string): Promise<ApiResponse<PublicTripDetail>> {
    const slugResponse = await apiClient.get<unknown>(API_ENDPOINTS.TRIPS.PUBLIC_DETAIL_BY_SLUG(tripIdentifier));
    if (slugResponse.success && slugResponse.data) {
      return {
        ...slugResponse,
        data: normalizePublicTripDetail(slugResponse.data),
      };
    }

    const idResponse = await apiClient.get<unknown>(API_ENDPOINTS.TRIPS.PUBLIC_DETAIL(tripIdentifier));
    if (idResponse.success && idResponse.data) {
      return {
        ...idResponse,
        data: normalizePublicTripDetail(idResponse.data),
      };
    }

    return {
      success: false,
      error: idResponse.error || slugResponse.error || 'Unable to load this journey right now.',
      status: idResponse.status || slugResponse.status,
    };
  }

  /**
   * Fetch user's trips (requires auth)
   */
  static async getMyTrips(token: string): Promise<ApiResponse<Trip[]>> {
    return apiClient.get<Trip[]>(API_ENDPOINTS.TRIPS.MY_TRIPS, undefined, token);
  }

  /**
   * Fetch a single trip detail for authenticated user
   */
  static async getMyTripDetail(tripId: string, token: string): Promise<ApiResponse<TripDetail>> {
    return apiClient.get<TripDetail>(API_ENDPOINTS.TRIPS.MY_TRIP_DETAIL(tripId), undefined, token);
  }

  /**
   * Fetch itinerary for a trip (requires auth)
   */
  static async getTripItinerary(tripId: string, token: string): Promise<ApiResponse<ItineraryItem[]>> {
    return apiClient.get<ItineraryItem[]>(API_ENDPOINTS.TRIPS.ITINERARY(tripId), undefined, token);
  }

  /**
   * Fetch trip essentials (guide sections, checklist, contacts, FAQs)
   */
  static async getTripEssentials(tripId: string, token: string): Promise<ApiResponse<{
    sections: TripGuideSection[];
    checklist: any[];
    contacts: EmergencyContact[];
    faqs: TripFAQ[];
    milestones: TripMilestone[];
    resources: TripResource[];
  }>> {
    return apiClient.get<TripEssentials>(API_ENDPOINTS.TRIPS.ESSENTIALS(tripId), undefined, token);
  }

  /**
   * Fetch public milestones for a booked trip
   */
  static async getTripMilestones(tripId: string, token: string): Promise<ApiResponse<TripMilestone[]>> {
    return apiClient.get<TripMilestone[]>(API_ENDPOINTS.TRIPS.MILESTONES(tripId), undefined, token);
  }

  /**
   * Fetch published trip resources for a booked trip
   */
  static async getTripResources(tripId: string, token: string): Promise<ApiResponse<TripResource[]>> {
    return apiClient.get<TripResource[]>(API_ENDPOINTS.TRIPS.RESOURCES(tripId), undefined, token);
  }

  /**
   * Fetch travel-readiness status for a booked trip
   */
  static async getTripReadiness(tripId: string, token: string): Promise<ApiResponse<TripReadiness>> {
    return apiClient.get<TripReadiness>(API_ENDPOINTS.TRIPS.READINESS(tripId), undefined, token);
  }
}
