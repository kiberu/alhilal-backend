// lib/api/services/auth.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { Account, StaffProfile } from "@/types/models"

/**
 * Credentials for staff login.
 */
export interface LoginCredentials {
  phone: string
  password: string
  remember?: boolean
}

/**
 * Payload for changing password.
 */
export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * Response returned upon successful authentication.
 */
export interface AuthResponse {
  user: Account & { staffProfile?: StaffProfile }
  accessToken: string
  refreshToken: string
  expiresAt: number
}

/**
 * Service for all authentication-related API calls.
 */
export class AuthService {
  /**
   * POST /auth/staff/login
   * Authenticate staff and receive JWT tokens.
   */
  static async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    
    // Store tokens if login successful
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.accessToken, credentials.remember)
      apiClient.setRefreshToken(response.data.refreshToken, credentials.remember)
    }
    
    return response
  }

  /**
   * POST /auth/staff/refresh
   * Refresh access token using refresh token.
   */
  static async refresh(): Promise<ApiResponse<AuthResponse>> {
    const refreshToken = apiClient.getRefreshToken()
    if (!refreshToken) {
      throw { message: "No refresh token available", status: 401 }
    }
    
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    )
    
    // Update access token if refresh successful
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.accessToken, false)
    }
    
    return response
  }

  /**
   * POST /auth/staff/logout
   * Logout and invalidate refresh token.
   */
  static async logout(authToken?: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(
      API_ENDPOINTS.AUTH.LOGOUT,
      undefined,
      undefined,
      authToken
    )
    apiClient.clearAuthToken()
    return response
  }

  /**
   * GET /auth/staff/profile
   * Get authenticated staff profile.
   */
  static async getProfile(authToken?: string): Promise<ApiResponse<Account & { staffProfile?: StaffProfile }>> {
    return apiClient.get<Account & { staffProfile?: StaffProfile }>(
      API_ENDPOINTS.AUTH.PROFILE,
      undefined,
      authToken
    )
  }

  /**
   * PATCH /auth/staff/profile
   * Update authenticated staff profile.
   */
  static async updateProfile(
    data: Partial<Account>,
    authToken?: string
  ): Promise<ApiResponse<Account>> {
    return apiClient.patch<Account>(
      API_ENDPOINTS.AUTH.UPDATE_PROFILE,
      data,
      undefined,
      authToken
    )
  }

  /**
   * POST /auth/staff/change-password
   * Change staff password.
   */
  static async changePassword(
    data: ChangePasswordData,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    const payload = {
      oldPassword: data.currentPassword,
      newPassword: data.newPassword
    }
    return apiClient.post<void>(
      API_ENDPOINTS.AUTH.CHANGE_PASSWORD,
      payload,
      undefined,
      authToken
    )
  }
}

