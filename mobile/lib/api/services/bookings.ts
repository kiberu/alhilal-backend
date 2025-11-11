import { apiClient, type ApiResponse } from '../client';
import { API_ENDPOINTS } from '../config';

export interface Booking {
  id: string;
  reference_number: string;
  package_id: string;
  trip_name: string;
  trip_code: string;
  trip_date: string;
  package_name: string;
  package_price: number;
  currency_code: string;
  status: 'EOI' | 'BOOKED' | 'CONFIRMED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  amount_paid_minor_units: number;
  balance_due: number;
  special_needs?: string;
  ticket_number?: string;
  room_assignment?: string;
  created_at: string;
  updated_at: string;
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

export interface CreateBookingData {
  package: string;  // Package UUID
  special_needs?: string;
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

  /**
   * Create a new booking
   */
  static createBooking(data: CreateBookingData, token: string): Promise<ApiResponse<Booking>> {
    return apiClient.post<Booking>(API_ENDPOINTS.BOOKINGS.CREATE, data, undefined, token);
  }
}

