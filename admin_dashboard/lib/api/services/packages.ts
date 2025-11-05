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
      name: string
      price_minor_units: number
      currency: string
      capacity: number
      visibility: string
      description?: string
    },
    authToken?: string
  ): Promise<ApiResponse<TripPackage>> {
    return apiClient.post<TripPackage>(
      API_ENDPOINTS.PACKAGES.CREATE,
      data,
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
      name: string
      price_minor_units: number
      currency: string
      capacity: number
      visibility: string
      description?: string
    }>,
    authToken?: string
  ): Promise<ApiResponse<TripPackage>> {
    return apiClient.patch<TripPackage>(
      API_ENDPOINTS.PACKAGES.UPDATE(id),
      data,
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


