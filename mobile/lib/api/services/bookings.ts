import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Booking {
  id: string;
  trip_name: string;
  trip_date: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  amount_paid: string;
  total_amount: string;
  created_at: string;
  package_name?: string;
}

export interface BookingDetail extends Booking {
  pilgrim_name: string;
  pilgrim_phone: string;
  trip_details?: {
    departure_date: string;
    return_date: string;
    cities: string[];
  };
  payment_history?: Array<{
    amount: string;
    date: string;
    method: string;
  }>;
}

export class BookingsService {
  /**
   * Get all bookings for the authenticated user
   */
  static getMyBookings(token: string): Promise<ApiResponse<Booking[]>> {
    return apiClient.get<Booking[]>(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, undefined, token);
  }

  /**
   * Get details of a specific booking
   */
  static getBookingDetail(bookingId: string, token: string): Promise<ApiResponse<BookingDetail>> {
    return apiClient.get<BookingDetail>(
      API_ENDPOINTS.BOOKINGS.BOOKING_DETAIL(bookingId),
      undefined,
      token
    );
  }
}

