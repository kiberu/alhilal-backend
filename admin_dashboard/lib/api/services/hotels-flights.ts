/**
 * API Service for Package Hotels and Flights
 */
import { apiClient } from '../client';
import type { ApiResponse, PaginatedResponse } from '../client';
import { API_BASE_URL } from '../config';

// ============================================================================
// TYPES
// ============================================================================

export interface PackageHotel {
  id: string;
  package: string;
  name: string;
  address?: string | null;
  room_type?: string | null;
  check_in: string;
  check_out: string;
  group_confirmation_no?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PackageFlight {
  id: string;
  package: string;
  leg: string;
  carrier: string;
  flight_no: string;
  dep_airport: string;
  dep_dt: string;
  arr_airport: string;
  arr_dt: string;
  group_pnr?: string | null;
  created_at?: string;
  updated_at?: string;
}

export type CreatePackageHotelData = Omit<PackageHotel, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePackageHotelData = Partial<CreatePackageHotelData>;

export type CreatePackageFlightData = Omit<PackageFlight, 'id' | 'created_at' | 'updated_at'>;
export type UpdatePackageFlightData = Partial<CreatePackageFlightData>;

// ============================================================================
// HOTELS SERVICE
// ============================================================================

export class HotelService {
  private static baseUrl = `${API_BASE_URL}hotels`;

  /**
   * List hotels for a package (returns paginated data)
   */
  static async list(packageId: string, token: string): Promise<ApiResponse<PaginatedResponse<PackageHotel>>> {
    return apiClient.get<PaginatedResponse<PackageHotel>>(this.baseUrl, { package: packageId }, token);
  }

  /**
   * Get a specific hotel
   */
  static async get(hotelId: string, token: string): Promise<ApiResponse<PackageHotel>> {
    return apiClient.get<PackageHotel>(`${this.baseUrl}/${hotelId}`, undefined, token);
  }

  /**
   * Create a new hotel
   */
  static async create(data: CreatePackageHotelData, token: string): Promise<ApiResponse<PackageHotel>> {
    return apiClient.post<PackageHotel>(this.baseUrl, data, undefined, token);
  }

  /**
   * Update a hotel
   */
  static async update(
    hotelId: string,
    data: UpdatePackageHotelData,
    token: string
  ): Promise<ApiResponse<PackageHotel>> {
    return apiClient.patch<PackageHotel>(`${this.baseUrl}/${hotelId}`, data, undefined, token);
  }

  /**
   * Delete a hotel
   */
  static async delete(hotelId: string, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseUrl}/${hotelId}`, undefined, token);
  }
}

// ============================================================================
// FLIGHTS SERVICE
// ============================================================================

export class FlightService {
  private static baseUrl = `${API_BASE_URL}flights`;

  /**
   * List flights for a package (returns paginated data)
   */
  static async list(packageId: string, token: string): Promise<ApiResponse<PaginatedResponse<PackageFlight>>> {
    return apiClient.get<PaginatedResponse<PackageFlight>>(this.baseUrl, { package: packageId }, token);
  }

  /**
   * Get a specific flight
   */
  static async get(flightId: string, token: string): Promise<ApiResponse<PackageFlight>> {
    return apiClient.get<PackageFlight>(`${this.baseUrl}/${flightId}`, undefined, token);
  }

  /**
   * Create a new flight
   */
  static async create(data: CreatePackageFlightData, token: string): Promise<ApiResponse<PackageFlight>> {
    return apiClient.post<PackageFlight>(this.baseUrl, data, undefined, token);
  }

  /**
   * Update a flight
   */
  static async update(
    flightId: string,
    data: UpdatePackageFlightData,
    token: string
  ): Promise<ApiResponse<PackageFlight>> {
    return apiClient.patch<PackageFlight>(`${this.baseUrl}/${flightId}`, data, undefined, token);
  }

  /**
   * Delete a flight
   */
  static async delete(flightId: string, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${this.baseUrl}/${flightId}`, undefined, token);
  }
}

