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
  commercial_month_label: string;
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
  commercial_month_label?: string;
  status?: string;
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

/**
 * Trips Service - handles all trip-related API calls
 */
export class TripsService {
  /**
   * Fetch all public trips (no auth required)
   */
  static async getPublicTrips(featured?: boolean): Promise<ApiResponse<PaginatedResponse<Trip>>> {
    const params = featured !== undefined ? { featured: String(featured) } : undefined;
    return apiClient.get<PaginatedResponse<Trip>>(API_ENDPOINTS.TRIPS.PUBLIC_LIST, params);
  }

  /**
   * Fetch a single public trip detail (no auth required)
   */
  static async getPublicTripDetail(tripId: string): Promise<ApiResponse<TripDetail>> {
    return apiClient.get<TripDetail>(API_ENDPOINTS.TRIPS.PUBLIC_DETAIL(tripId));
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
