import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

// Type Definitions for Trip APIs
export interface TripPackage {
  id: string;
  name: string;
  price_minor_units: number;
  currency: string;
  capacity: number;
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
  name: string;
  cities: string[];
  start_date: string;
  end_date: string;
  cover_image: string | null;
  featured: boolean;
  packages_count: number;
}

export interface TripDetail {
  id: string;
  code: string;
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
  }>> {
    return apiClient.get(API_ENDPOINTS.TRIPS.ESSENTIALS(tripId), undefined, token);
  }
}

