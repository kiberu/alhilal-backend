import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Lead, LeadFilters, PaginatedResponse, UpdateLeadData } from "@/types/models"

/**
 * Service for website lead API calls.
 */
export class LeadService {
  /**
   * GET /leads
   * List website leads with filtering and pagination.
   */
  static async list(
    filters?: LeadFilters,
    authToken?: string
  ): Promise<ApiResponse<PaginatedResponse<Lead>>> {
    return apiClient.get<PaginatedResponse<Lead>>(
      API_ENDPOINTS.LEADS.LIST,
      filters,
      authToken
    )
  }

  /**
   * GET /leads/:id
   * Get website lead details.
   */
  static async get(id: string, authToken?: string): Promise<ApiResponse<Lead>> {
    return apiClient.get<Lead>(
      API_ENDPOINTS.LEADS.GET(id),
      undefined,
      authToken
    )
  }

  /**
   * PATCH /leads/:id
   * Update website lead follow-up data.
   */
  static async update(
    id: string,
    data: UpdateLeadData,
    authToken?: string
  ): Promise<ApiResponse<Lead>> {
    return apiClient.patch<Lead>(
      API_ENDPOINTS.LEADS.UPDATE(id),
      data,
      undefined,
      authToken
    )
  }
}
