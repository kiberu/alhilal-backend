// lib/api/services/trips.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type {
  Trip,
  TripFullDetails,
  TripFilters,
  CreateTripData,
} from "@/types/models"

/**
 * Service for trip management API calls.
 */
export class TripService {
  /**
   * GET /trips
   * List all trips with filtering and pagination.
   */
  static async list(
    filters?: TripFilters,
    authToken?: string
  ): Promise<ApiResponse<Trip[]>> {
    return apiClient.get<Trip[]>(
      API_ENDPOINTS.TRIPS.LIST,
      filters,
      authToken
    )
  }

  /**
   * GET /trips/:id
   * Get trip details.
   */
  static async get(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<TripFullDetails>> {
    return apiClient.get<TripFullDetails>(
      API_ENDPOINTS.TRIPS.GET(id),
      undefined,
      authToken
    )
  }

  /**
   * GET /trips/:id
   * Get trip details (alias for get method).
   */
  static async getById(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<TripFullDetails>> {
    return this.get(id, authToken)
  }

  /**
   * POST /trips
   * Create a new trip.
   */
  static async create(
    data: CreateTripData,
    authToken?: string
  ): Promise<ApiResponse<Trip>> {
    return apiClient.post<Trip>(
      API_ENDPOINTS.TRIPS.CREATE,
      data,
      undefined,
      authToken
    )
  }

  /**
   * PATCH /trips/:id
   * Update trip details.
   */
  static async update(
    id: string,
    data: Partial<CreateTripData>,
    authToken?: string
  ): Promise<ApiResponse<Trip>> {
    return apiClient.patch<Trip>(
      API_ENDPOINTS.TRIPS.UPDATE(id),
      data,
      undefined,
      authToken
    )
  }

  /**
   * DELETE /trips/:id
   * Delete a trip.
   */
  static async delete(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      API_ENDPOINTS.TRIPS.DELETE(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /trips/:id/duplicate
   * Duplicate a trip.
   */
  static async duplicate(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<Trip>> {
    return apiClient.post<Trip>(
      API_ENDPOINTS.TRIPS.DUPLICATE(id),
      undefined,
      undefined,
      authToken
    )
  }

  /**
   * GET /trips/:id/roster
   * Export trip roster.
   */
  static async exportRoster(
    id: string,
    authToken?: string
  ): Promise<Blob> {
    // This would return a file download
    const response = await fetch(API_ENDPOINTS.TRIPS.EXPORT_ROSTER(id), {
      headers: {
        Authorization: `Bearer ${authToken || apiClient.getAuthToken()}`,
      },
    })
    return response.blob()
  }
}

