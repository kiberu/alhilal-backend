// lib/api/services/dashboard.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { DashboardStats, RecentActivity, TripWithPackages } from "@/types/models"

/**
 * Service for dashboard API calls.
 */
export class DashboardService {
  /**
   * GET /dashboard/stats
   * Get dashboard statistics.
   */
  static async getStats(
    authToken?: string
  ): Promise<ApiResponse<DashboardStats>> {
    return apiClient.get<DashboardStats>(
      API_ENDPOINTS.DASHBOARD.STATS,
      undefined,
      authToken
    )
  }

  /**
   * GET /dashboard/activity
   * Get recent activity feed.
   */
  static async getActivity(
    authToken?: string
  ): Promise<ApiResponse<RecentActivity[]>> {
    return apiClient.get<RecentActivity[]>(
      API_ENDPOINTS.DASHBOARD.ACTIVITY,
      undefined,
      authToken
    )
  }

  /**
   * GET /dashboard/upcoming-trips
   * Get upcoming trips widget.
   */
  static async getUpcomingTrips(
    authToken?: string
  ): Promise<ApiResponse<TripWithPackages[]>> {
    return apiClient.get<TripWithPackages[]>(
      API_ENDPOINTS.DASHBOARD.UPCOMING_TRIPS,
      undefined,
      authToken
    )
  }
}

