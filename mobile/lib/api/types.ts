// API Types and Interfaces

export interface User {
  id: string;
  role: 'STAFF' | 'PILGRIM';
  phone: string;
  email?: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PilgrimProfile {
  user: string; // User ID
  full_name?: string;
  passport_number?: string;
  phone?: string;
  dob?: string; // ISO date string
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  nationality?: string; // ISO 3166-1 alpha-2
  address?: string;
  emergency_name?: string;
  emergency_phone?: string;
  emergency_relationship?: string;
  medical_conditions?: string;
  dietary_requirements?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
  profile?: PilgrimProfile;
  is_new_user?: boolean;
  needs_profile_completion?: boolean;
}

export interface OTPRequestResponse {
  sent: boolean;
  expires_in: number; // seconds
  message: string;
}

export interface Booking {
  id: string;
  reference_number: string;
  pilgrim: string;
  package: string;
  status: 'EOI' | 'BOOKED' | 'CONFIRMED' | 'CANCELLED';
  payment_status: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  amount_paid_minor_units: number;
  currency?: string;
  payment_note?: string;
  ticket_number?: string;
  room_assignment?: string;
  special_needs?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  code: string;
  name: string;
  type: 'UMRAH' | 'HAJJ' | 'ZIYARAH' | 'OTHER';
  description?: string;
  start_date: string;
  end_date: string;
  duration_days: number;
  status: 'DRAFT' | 'OPEN' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface TripPackage {
  id: string;
  trip: string;
  name: string;
  description?: string;
  price_minor_units: number;
  currency: string;
  capacity: number;
  available_slots: number;
  inclusions?: string[];
  exclusions?: string[];
  visibility: 'PUBLIC' | 'PRIVATE' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

