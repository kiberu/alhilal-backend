// lib/api/services/bookings.ts
import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type {
  Booking,
  BookingWithDetails,
  BookingFilters,
  CreateBookingData,
  BulkActionRequest,
  BulkAssignRoomsRequest,
  PaginatedResponse,
} from "@/types/models"

/**
 * Service for booking management API calls.
 */
export class BookingService {
  /**
   * GET /bookings
   * List all bookings with filtering.
   */
  static async list(
    filters?: BookingFilters,
    authToken?: string
  ): Promise<ApiResponse<PaginatedResponse<BookingWithDetails>>> {
    return apiClient.get<PaginatedResponse<BookingWithDetails>>(
      API_ENDPOINTS.BOOKINGS.LIST,
      filters,
      authToken
    )
  }

  /**
   * GET /bookings/:id
   * Get booking details.
   */
  static async get(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<BookingWithDetails>> {
    return apiClient.get<BookingWithDetails>(
      API_ENDPOINTS.BOOKINGS.GET(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /bookings
   * Create booking.
   */
  static async create(
    data: CreateBookingData,
    authToken?: string
  ): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(
      API_ENDPOINTS.BOOKINGS.CREATE,
      data,
      undefined,
      authToken
    )
  }

  /**
   * PATCH /bookings/:id
   * Update booking.
   */
  static async update(
    id: string,
    data: Partial<CreateBookingData>,
    authToken?: string
  ): Promise<ApiResponse<Booking>> {
    return apiClient.patch<Booking>(
      API_ENDPOINTS.BOOKINGS.UPDATE(id),
      data,
      undefined,
      authToken
    )
  }

  /**
   * DELETE /bookings/:id
   * Cancel booking.
   */
  static async delete(
    id: string,
    authToken?: string
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      API_ENDPOINTS.BOOKINGS.DELETE(id),
      undefined,
      authToken
    )
  }

  /**
   * POST /bookings/bulk/convert-eoi
   * Convert EOI to BOOKED.
   */
  static async bulkConvertEOI(
    data: BulkActionRequest,
    authToken?: string
  ): Promise<ApiResponse<{ updated: number }>> {
    return apiClient.post<{ updated: number }>(
      API_ENDPOINTS.BOOKINGS.BULK_CONVERT_EOI,
      data,
      undefined,
      authToken
    )
  }

  /**
   * POST /bookings/bulk/cancel
   * Bulk cancel bookings.
   */
  static async bulkCancel(
    data: BulkActionRequest,
    authToken?: string
  ): Promise<ApiResponse<{ updated: number }>> {
    return apiClient.post<{ updated: number }>(
      API_ENDPOINTS.BOOKINGS.BULK_CANCEL,
      data,
      undefined,
      authToken
    )
  }

  /**
   * POST /bookings/bulk/assign-rooms
   * Bulk assign rooms.
   */
  static async bulkAssignRooms(
    data: BulkAssignRoomsRequest,
    authToken?: string
  ): Promise<ApiResponse<{ updated: number }>> {
    return apiClient.post<{ updated: number }>(
      API_ENDPOINTS.BOOKINGS.BULK_ASSIGN_ROOMS,
      data,
      undefined,
      authToken
    )
  }

  /**
   * GET /bookings/export
   * Export bookings to CSV.
   */
  static async exportCSV(
    filters?: BookingFilters,
    authToken?: string
  ): Promise<Blob> {
    const response = await fetch(
      API_ENDPOINTS.BOOKINGS.EXPORT_CSV + "?" + new URLSearchParams(filters as Record<string, string>).toString(),
      {
        headers: {
          Authorization: `Bearer ${authToken || apiClient.getAuthToken()}`,
        },
      }
    )
    return response.blob()
  }
}

