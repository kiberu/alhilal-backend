// lib/api/services/payments.ts
import { apiClient, type ApiResponse } from "../client"
import type { Payment } from "@/types/models"

/**
 * Service for payment management API calls.
 */
export class PaymentService {
  /**
   * POST /bookings/:bookingId/payments/
   * Record a new payment for a booking.
   */
  static async recordPayment(
    bookingId: string,
    data: {
      amount_minor_units: number
      currency: string
      payment_method: string
      payment_date: string
      reference_number?: string
      notes?: string
    },
    authToken?: string
  ): Promise<ApiResponse<Payment>> {
    return apiClient.post<Payment>(
      `/bookings/${bookingId}/payments`,
      data,
      undefined,
      authToken
    )
  }

  /**
   * GET /bookings/:bookingId/payments/list
   * Get all payments for a booking with summary.
   */
  static async listPayments(
    bookingId: string,
    authToken?: string
  ): Promise<ApiResponse<{
    payments: Payment[]
    total_paid: number
    package_price: number
    balance: number
    currency: string
  }>> {
    return apiClient.get(
      `/bookings/${bookingId}/payments/list`,
      undefined,
      authToken
    )
  }
}

