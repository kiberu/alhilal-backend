import { apiClient } from "../client"
import { API_ENDPOINTS } from "../config"
import type { ApiResponse, Dua } from "@/types/models"

export const DuaService = {
  /**
   * Get all duas with optional filters
   */
  list: async (
    filters?: Record<string, string | number>,
    token?: string | null
  ): Promise<ApiResponse<{ results: Dua[]; count: number; totalPages: number }>> => {
    return apiClient.get(API_ENDPOINTS.DUAS.LIST, filters, token)
  },

  /**
   * Get a single dua by ID
   */
  get: async (id: string, token?: string | null): Promise<ApiResponse<Dua>> => {
    return apiClient.get(API_ENDPOINTS.DUAS.DETAIL(id), undefined, token)
  },

  /**
   * Create a new dua
   */
  create: async (data: Partial<Dua>, token?: string | null): Promise<ApiResponse<Dua>> => {
    return apiClient.post(API_ENDPOINTS.DUAS.CREATE, data, token)
  },

  /**
   * Update an existing dua
   */
  update: async (
    id: string,
    data: Partial<Dua>,
    token?: string | null
  ): Promise<ApiResponse<Dua>> => {
    return apiClient.patch(API_ENDPOINTS.DUAS.UPDATE(id), data, token)
  },

  /**
   * Delete a dua
   */
  delete: async (id: string, token?: string | null): Promise<ApiResponse<void>> => {
    return apiClient.delete(API_ENDPOINTS.DUAS.DELETE(id), token)
  },

  /**
   * Get duas by category
   */
  getByCategory: async (
    category: string,
    token?: string | null
  ): Promise<ApiResponse<Dua[]>> => {
    return apiClient.get(API_ENDPOINTS.DUAS.LIST, { category }, token)
  },
}

