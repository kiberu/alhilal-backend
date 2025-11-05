import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { ApiResponse, Passport } from "@/types/models"

export const PassportService = {
  /**
   * Get all passports with optional filters
   */
  list: async (
    filters?: Record<string, string | number>,
    token?: string | null
  ): Promise<ApiResponse<{ results: Passport[]; count: number; totalPages: number }>> => {
    return apiClient.get(API_ENDPOINTS.PASSPORTS.LIST, filters, token)
  },

  /**
   * Get a single passport by ID
   */
  get: async (id: string, token?: string | null): Promise<ApiResponse<Passport>> => {
    return apiClient.get(API_ENDPOINTS.PASSPORTS.DETAIL(id), undefined, token)
  },

  /**
   * Create a new passport
   */
  create: async (data: Partial<Passport>, token?: string | null): Promise<ApiResponse<Passport>> => {
    return apiClient.post(API_ENDPOINTS.PASSPORTS.CREATE, data, token)
  },

  /**
   * Update an existing passport
   */
  update: async (
    id: string,
    data: Partial<Passport>,
    token?: string | null
  ): Promise<ApiResponse<Passport>> => {
    return apiClient.patch(API_ENDPOINTS.PASSPORTS.UPDATE(id), data, token)
  },

  /**
   * Delete a passport
   */
  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    return apiClient.delete(API_ENDPOINTS.PASSPORTS.DELETE(id), token)
  },

  /**
   * Get expiring passports (within a certain number of days)
   */
  getExpiring: async (
    days: number = 90,
    token?: string | null
  ): Promise<ApiResponse<Passport[]>> => {
    return apiClient.get(API_ENDPOINTS.PASSPORTS.EXPIRING, { days }, token)
  },
}

