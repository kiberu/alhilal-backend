// lib/api/services/users.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { User, CreateUserData, UpdateUserData, ChangeUserPasswordData } from "@/types/models"

/**
 * Service for user management API calls (Admin).
 */
export class UserService {
  /**
   * GET /users
   * Get paginated list of users with optional filters.
   */
  static async getUsers(
    params?: {
      page?: number
      size?: number
      role?: string
      isActive?: boolean
      search?: string
    },
    authToken?: string
  ): Promise<ApiResponse<User[]>> {
    return apiClient.get<User[]>(
      API_ENDPOINTS.USERS.LIST,
      params as Record<string, string | number | boolean>,
      authToken
    )
  }

  /**
   * GET /users/:id
   * Get user by ID.
   */
  static async getUser(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<User>> {
    return apiClient.get<User>(
      API_ENDPOINTS.USERS.DETAIL(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /users
   * Create a new user.
   */
  static async createUser(
    data: CreateUserData,
    authToken?: string
  ): Promise<ApiResponse<User>> {
    return apiClient.post<User>(
      API_ENDPOINTS.USERS.LIST,
      data,
      undefined,
      authToken
    )
  }

  /**
   * PATCH /users/:id
   * Update user.
   */
  static async updateUser(
    id: string,
    data: UpdateUserData,
    authToken?: string
  ): Promise<ApiResponse<User>> {
    return apiClient.patch<User>(
      API_ENDPOINTS.USERS.DETAIL(id),
      data,
      undefined,
      authToken
    )
  }

  /**
   * DELETE /users/:id
   * Delete user.
   */
  static async deleteUser(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      API_ENDPOINTS.USERS.DETAIL(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /users/:id/change-password
   * Change user password (admin).
   */
  static async changeUserPassword(
    id: string,
    data: ChangeUserPasswordData,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD(id),
      data,
      undefined,
      authToken
    )
  }
}

