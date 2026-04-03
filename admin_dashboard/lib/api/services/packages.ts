// lib/api/services/packages.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { TripPackage } from "@/types/models"

/**
 * Service for package management API calls.
 */
export class PackageService {
  /**
   * GET /packages
   * List all packages with filtering.
   */
  static async list(
    filters?: Record<string, any>,
    authToken?: string
  ): Promise<ApiResponse<TripPackage[]>> {
    return apiClient.get<TripPackage[]>(
      API_ENDPOINTS.PACKAGES.LIST,
      filters,
      authToken
    )
  }

  /**
   * GET /packages/:id
   * Get package details.
   */
  static async get(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<TripPackage>> {
    return apiClient.get<TripPackage>(
      API_ENDPOINTS.PACKAGES.GET(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /packages
   * Create a new package.
   */
  static async create(
    data: {
      trip: string
      package_code?: string
      name: string
      start_date_override?: string | null
      end_date_override?: string | null
      nights?: number | null
      price_minor_units: number
      currency: string
      capacity: number
      sales_target?: number | null
      hotel_booking_month?: string
      airline_booking_month?: string
      status?: string
      visibility: string
      description?: string
    },
    authToken?: string
  ): Promise<ApiResponse<TripPackage>> {
    return apiClient.post<TripPackage>(
      API_ENDPOINTS.PACKAGES.CREATE,
      {
        ...data,
        currency_code: data.currency,
      },
      undefined,
      authToken
    )
  }

  /**
   * PATCH /packages/:id
   * Update package details.
   */
  static async update(
    id: string,
    data: Partial<{
      package_code: string
      name: string
      start_date_override: string | null
      end_date_override: string | null
      nights: number | null
      price_minor_units: number
      currency: string
      capacity: number
      sales_target: number | null
      hotel_booking_month: string
      airline_booking_month: string
      status: string
      visibility: string
      description?: string
    }>,
    authToken?: string
  ): Promise<ApiResponse<TripPackage>> {
    return apiClient.patch<TripPackage>(
      API_ENDPOINTS.PACKAGES.UPDATE(id),
      {
        ...data,
        currency_code: data.currency,
      },
      undefined,
      authToken
    )
  }

  /**
   * DELETE /packages/:id
   * Delete a package.
   */
  static async delete(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      API_ENDPOINTS.PACKAGES.DELETE(id),
      undefined,
      authToken
    )
  }
}

