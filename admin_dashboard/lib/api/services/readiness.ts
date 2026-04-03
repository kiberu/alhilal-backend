import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type {
  PilgrimReadiness,
  PaginatedResponse,
  PaginationParams,
} from "@/types/models"

export interface ReadinessFilters extends PaginationParams {
  pilgrim?: string
  trip?: string
  package?: string
  booking?: string
  status?: string
  ready_for_travel?: boolean
  requires_follow_up?: boolean
  search?: string
}

export interface UpdatePilgrimReadinessData {
  booking?: string
  darasa_one_completed?: boolean
  darasa_two_completed?: boolean
  send_off_completed?: boolean
  validation_notes?: string
}

/**
 * Service for pilgrim travel-readiness API calls.
 */
export class ReadinessService {
  static async list(
    filters?: ReadinessFilters,
    authToken?: string
  ): Promise<ApiResponse<PaginatedResponse<PilgrimReadiness>>> {
    return apiClient.get<PaginatedResponse<PilgrimReadiness>>(
      API_ENDPOINTS.READINESS.LIST,
      filters,
      authToken
    )
  }

  static async get(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<PilgrimReadiness>> {
    return apiClient.get<PilgrimReadiness>(
      API_ENDPOINTS.READINESS.GET(id),
      undefined,
      authToken
    )
  }

  static async create(
    data: UpdatePilgrimReadinessData,
    authToken?: string
  ): Promise<ApiResponse<PilgrimReadiness>> {
    return apiClient.post<PilgrimReadiness>(
      API_ENDPOINTS.READINESS.CREATE,
      data,
      undefined,
      authToken
    )
  }

  static async update(
    id: string,
    data: UpdatePilgrimReadinessData,
    authToken?: string
  ): Promise<ApiResponse<PilgrimReadiness>> {
    return apiClient.patch<PilgrimReadiness>(
      API_ENDPOINTS.READINESS.UPDATE(id),
      data,
      undefined,
      authToken
    )
  }

  static async validateReady(
    id: string,
    validation_notes?: string,
    authToken?: string
  ): Promise<ApiResponse<PilgrimReadiness>> {
    return apiClient.post<PilgrimReadiness>(
      API_ENDPOINTS.READINESS.VALIDATE_READY(id),
      validation_notes ? { validation_notes } : {},
      undefined,
      authToken
    )
  }

  static async clearValidation(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<PilgrimReadiness>> {
    return apiClient.post<PilgrimReadiness>(
      API_ENDPOINTS.READINESS.CLEAR_VALIDATION(id),
      {},
      undefined,
      authToken
    )
  }
}
