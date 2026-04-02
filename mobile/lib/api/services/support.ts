import { apiClient, type ApiResponse } from "../client";
import { API_ENDPOINTS } from "../config";

export interface NotificationPreferences {
  push_enabled: boolean;
  in_app_enabled: boolean;
  trip_updates: boolean;
  document_updates: boolean;
  readiness_updates: boolean;
  daily_program_updates: boolean;
  support_updates: boolean;
  marketing_updates: boolean;
  support_phone: string;
  support_whatsapp: string;
  support_email: string;
  support_message: string;
  notification_provider_enabled: boolean;
  notification_provider_name: string;
  updated_at: string;
}

export interface DeviceInstallation {
  id: string;
  installation_id: string;
  platform: "IOS" | "ANDROID" | "WEB" | "OTHER";
  device_name: string;
  device_model: string;
  os_version: string;
  app_version: string;
  locale: string;
  timezone: string;
  notifications_enabled: boolean;
  capability_flags: Record<string, unknown>;
  preference_state: Record<string, unknown>;
  provider_token_fields: Record<string, unknown>;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface TripSupportUpdate {
  id: string;
  trip_id: string;
  title: string;
  body_md: string;
  urgency: string;
  pinned: boolean;
  publish_at: string;
  package_name: string | null;
  attach_url_signed: string | null;
  created_at: string;
}

export interface DailyProgramItem {
  id: string;
  day_index: number;
  title: string;
  location: string | null;
  notes: string | null;
  start_time: string | null;
  end_time: string | null;
}

export interface DailyProgramDay {
  id: string;
  day_index: number;
  label: string;
  date: string | null;
  items: DailyProgramItem[];
}

export interface DailyProgram {
  trip_id: string;
  trip_code: string;
  trip_name: string;
  trip_status: string;
  current_day_index: number;
  is_trip_live: boolean;
  pinned_resource: {
    id: string;
    title: string;
    description: string;
    resource_type: string;
    viewer_mode: string;
    is_pinned: boolean;
    published_at: string | null;
    file_format: string | null;
    metadata: Record<string, unknown>;
    package_name: string | null;
    file_url_signed: string | null;
  } | null;
  days: DailyProgramDay[];
  updated_at: string | null;
}

export interface TripFeedback {
  id: string;
  booking_reference: string;
  trip_code: string;
  trip_name: string;
  status: "DRAFT" | "SUBMITTED";
  overall_rating: number | null;
  support_rating: number | null;
  accommodation_rating: number | null;
  transport_rating: number | null;
  highlights: string;
  improvements: string;
  testimonial_opt_in: boolean;
  follow_up_requested: boolean;
  review_notes: string;
  reviewed_by_name: string | null;
  reviewed_at: string | null;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TripFeedbackState {
  eligible: boolean;
  reason: string | null;
  feedback: TripFeedback | null;
}

export interface TripFeedbackPayload {
  status?: "DRAFT" | "SUBMITTED";
  overall_rating?: number;
  support_rating?: number;
  accommodation_rating?: number;
  transport_rating?: number;
  highlights?: string;
  improvements?: string;
  testimonial_opt_in?: boolean;
  follow_up_requested?: boolean;
}

export class SupportService {
  static async getNotificationPreferences(token: string): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.get<NotificationPreferences>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, undefined, token);
  }

  static async updateNotificationPreferences(
    data: Partial<NotificationPreferences>,
    token: string
  ): Promise<ApiResponse<NotificationPreferences>> {
    return apiClient.put<NotificationPreferences>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, data, undefined, token);
  }

  static async listDevices(token: string): Promise<ApiResponse<DeviceInstallation[]>> {
    return apiClient.get<DeviceInstallation[]>(API_ENDPOINTS.NOTIFICATIONS.DEVICES, undefined, token);
  }

  static async registerDevice(
    data: Partial<DeviceInstallation> & Pick<DeviceInstallation, "installation_id" | "platform">,
    token: string
  ): Promise<ApiResponse<DeviceInstallation>> {
    return apiClient.post<DeviceInstallation>(API_ENDPOINTS.NOTIFICATIONS.DEVICES, data, undefined, token);
  }

  static async updateDevice(
    deviceId: string,
    data: Partial<DeviceInstallation>,
    token: string
  ): Promise<ApiResponse<DeviceInstallation>> {
    return apiClient.patch<DeviceInstallation>(API_ENDPOINTS.NOTIFICATIONS.DEVICE_DETAIL(deviceId), data, undefined, token);
  }

  static async deleteDevice(deviceId: string, token: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.NOTIFICATIONS.DEVICE_DETAIL(deviceId), undefined, token);
  }

  static async getTripUpdates(tripId: string, token: string): Promise<ApiResponse<TripSupportUpdate[]>> {
    return apiClient.get<TripSupportUpdate[]>(API_ENDPOINTS.TRIPS.UPDATES(tripId), undefined, token);
  }

  static async getDailyProgram(tripId: string, token: string): Promise<ApiResponse<DailyProgram>> {
    return apiClient.get<DailyProgram>(API_ENDPOINTS.TRIPS.DAILY_PROGRAM(tripId), undefined, token);
  }

  static async getTripFeedback(tripId: string, token: string): Promise<ApiResponse<TripFeedbackState>> {
    return apiClient.get<TripFeedbackState>(API_ENDPOINTS.TRIPS.FEEDBACK(tripId), undefined, token);
  }

  static async saveTripFeedback(
    tripId: string,
    data: TripFeedbackPayload,
    token: string
  ): Promise<ApiResponse<TripFeedback>> {
    return apiClient.post<TripFeedback>(API_ENDPOINTS.TRIPS.FEEDBACK(tripId), data, undefined, token);
  }
}
