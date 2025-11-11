import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';
import type { AuthResponse, OTPRequestResponse } from '../types';

export interface RequestOTPData {
  phone: string;
}

export interface VerifyOTPData {
  phone: string;
  otp: string;
}

export interface CompleteProfileData {
  full_name: string;
  dob?: string; // ISO date string
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string;
  passport_number?: string;
  has_passport: boolean;
}

export class AuthService {
  /**
   * Request OTP for phone number
   * Creates a new PILGRIM user if phone doesn't exist
   */
  static requestOTP(data: RequestOTPData): Promise<ApiResponse<OTPRequestResponse>> {
    return apiClient.post<OTPRequestResponse>(API_ENDPOINTS.AUTH.REQUEST_OTP, data);
  }

  /**
   * Verify OTP and get authentication tokens
   * Returns JWT tokens and user data
   */
  static verifyOTP(data: VerifyOTPData): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.VERIFY_OTP, data);
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshToken(refreshToken: string): Promise<ApiResponse<{ access: string }>> {
    return apiClient.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH_TOKEN, {
      refresh: refreshToken,
    });
  }

  /**
   * Get current user profile (requires authentication)
   */
  static getProfile(token: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.get<AuthResponse>(API_ENDPOINTS.PROFILE.ME, undefined, token);
  }

  /**
   * Update pilgrim profile
   */
  static updateProfile(data: Partial<CompleteProfileData>, token: string): Promise<ApiResponse<any>> {
    return apiClient.put(API_ENDPOINTS.PROFILE.UPDATE, data, undefined, token);
  }

  /**
   * Staff login (password-based)
   */
  static staffLogin(phone: string, password: string): Promise<ApiResponse<AuthResponse>> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.STAFF_LOGIN, {
      phone,
      password,
    });
  }
}

