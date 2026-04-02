import { apiClient, type ApiResponse } from "../client"
import { API_ENDPOINTS } from "../config"
import type { PlatformSettings } from "@/types/models"

interface PlatformSettingsApiShape {
  otp_support_phone: string
  otp_support_whatsapp: string
  otp_fallback_message: string
  mobile_support_phone: string
  mobile_support_whatsapp: string
  mobile_support_email: string
  mobile_support_message: string
  notification_provider_enabled: boolean
  notification_provider_name: string
  notification_provider_notes: string
  lead_notification_to_email: string
  lead_notification_cc_email: string
  youtube_channel_id: string
  youtube_playlist_id: string
  youtube_cache_synced_at?: string | null
  updated_at: string
}

interface PlatformSettingsUpdate {
  otpSupportPhone?: string
  otpSupportWhatsApp?: string
  otpFallbackMessage?: string
  mobileSupportPhone?: string
  mobileSupportWhatsApp?: string
  mobileSupportEmail?: string
  mobileSupportMessage?: string
  notificationProviderEnabled?: boolean
  notificationProviderName?: string
  notificationProviderNotes?: string
  leadNotificationToEmail?: string
  leadNotificationCcEmail?: string
  youtubeChannelId?: string
  youtubePlaylistId?: string
}

function mapPlatformSettings(data: PlatformSettingsApiShape): PlatformSettings {
  return {
    otpSupportPhone: data.otp_support_phone || "",
    otpSupportWhatsApp: data.otp_support_whatsapp || "",
    otpFallbackMessage: data.otp_fallback_message || "",
    mobileSupportPhone: data.mobile_support_phone || "",
    mobileSupportWhatsApp: data.mobile_support_whatsapp || "",
    mobileSupportEmail: data.mobile_support_email || "",
    mobileSupportMessage: data.mobile_support_message || "",
    notificationProviderEnabled: Boolean(data.notification_provider_enabled),
    notificationProviderName: data.notification_provider_name || "",
    notificationProviderNotes: data.notification_provider_notes || "",
    leadNotificationToEmail: data.lead_notification_to_email || "",
    leadNotificationCcEmail: data.lead_notification_cc_email || "",
    youtubeChannelId: data.youtube_channel_id || "",
    youtubePlaylistId: data.youtube_playlist_id || "",
    youtubeCacheSyncedAt: data.youtube_cache_synced_at || null,
    updatedAt: data.updated_at,
  }
}

function toApiPayload(data: PlatformSettingsUpdate): Partial<PlatformSettingsApiShape> {
  return {
    otp_support_phone: data.otpSupportPhone,
    otp_support_whatsapp: data.otpSupportWhatsApp,
    otp_fallback_message: data.otpFallbackMessage,
    mobile_support_phone: data.mobileSupportPhone,
    mobile_support_whatsapp: data.mobileSupportWhatsApp,
    mobile_support_email: data.mobileSupportEmail,
    mobile_support_message: data.mobileSupportMessage,
    notification_provider_enabled: data.notificationProviderEnabled,
    notification_provider_name: data.notificationProviderName,
    notification_provider_notes: data.notificationProviderNotes,
    lead_notification_to_email: data.leadNotificationToEmail,
    lead_notification_cc_email: data.leadNotificationCcEmail,
    youtube_channel_id: data.youtubeChannelId,
    youtube_playlist_id: data.youtubePlaylistId,
  }
}

export class PlatformService {
  static async getSettings(authToken?: string): Promise<ApiResponse<PlatformSettings>> {
    const response = await apiClient.get<PlatformSettingsApiShape>(
      API_ENDPOINTS.PLATFORM.SETTINGS,
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapPlatformSettings(response.data) : undefined,
    }
  }

  static async updateSettings(
    data: PlatformSettingsUpdate,
    authToken?: string
  ): Promise<ApiResponse<PlatformSettings>> {
    const response = await apiClient.patch<PlatformSettingsApiShape>(
      API_ENDPOINTS.PLATFORM.SETTINGS,
      toApiPayload(data),
      undefined,
      authToken
    )

    return {
      ...response,
      data: response.data ? mapPlatformSettings(response.data) : undefined,
    }
  }
}
