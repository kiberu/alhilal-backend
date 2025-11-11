import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { ApiResponse, Visa } from "@/types/models"

export const VisaService = {
  /**
   * Get all visas with optional filters
   */
  list: async (
    filters?: Record<string, string | number>,
    token?: string | null
  ): Promise<ApiResponse<{ results: Visa[]; count: number; totalPages: number }>> => {
    return apiClient.get(API_ENDPOINTS.VISAS.LIST, filters, token)
  },

  /**
   * Get a single visa by ID
   */
  get: async (id: string, token?: string | null): Promise<ApiResponse<Visa>> => {
    return apiClient.get(API_ENDPOINTS.VISAS.GET(id), undefined, token)
  },

  /**
   * Create a new visa
   */
  create: async (data: Partial<Visa>, token?: string | null): Promise<ApiResponse<Visa>> => {
    return apiClient.post(API_ENDPOINTS.VISAS.CREATE, data, undefined, token)
  },

  /**
   * Update an existing visa
   */
  update: async (
    id: string,
    data: Partial<Visa>,
    token?: string | null
  ): Promise<ApiResponse<Visa>> => {
    return apiClient.patch(API_ENDPOINTS.VISAS.UPDATE(id), data, undefined, token)
  },

  /**
   * Delete a visa
   */
  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    return apiClient.delete(API_ENDPOINTS.VISAS.DELETE(id), undefined, token)
  },

  /**
   * Bulk approve visas
   */
  bulkApprove: async (visaIds: string[], token?: string | null): Promise<ApiResponse<void>> => {
    return apiClient.post(API_ENDPOINTS.VISAS.BULK_APPROVE, { visa_ids: visaIds }, undefined, token)
  },

  /**
   * Bulk reject visas
   */
  bulkReject: async (visaIds: string[], token?: string | null): Promise<ApiResponse<void>> => {
    return apiClient.post(API_ENDPOINTS.VISAS.BULK_REJECT, { visa_ids: visaIds }, undefined, token)
  },
}

