import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { PaginatedResponse, TripFeedback, TripFeedbackFilters } from "@/types/models"

export interface UpdateTripFeedbackData {
  reviewNotes?: string
}

/**
 * Service for post-trip feedback review API calls.
 */
export class FeedbackService {
  static async list(
    filters?: TripFeedbackFilters,
    authToken?: string
  ): Promise<ApiResponse<PaginatedResponse<TripFeedback>>> {
    return apiClient.get<PaginatedResponse<TripFeedback>>(
      API_ENDPOINTS.FEEDBACK.LIST,
      filters,
      authToken
    )
  }

  static async get(id: string, authToken?: string): Promise<ApiResponse<TripFeedback>> {
    return apiClient.get<TripFeedback>(
      API_ENDPOINTS.FEEDBACK.GET(id),
      undefined,
      authToken
    )
  }

  static async update(
    id: string,
    data: UpdateTripFeedbackData,
    authToken?: string
  ): Promise<ApiResponse<TripFeedback>> {
    return apiClient.patch<TripFeedback>(
      API_ENDPOINTS.FEEDBACK.UPDATE(id),
      data,
      undefined,
      authToken
    )
  }
}
