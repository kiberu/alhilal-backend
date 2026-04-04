import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { SupportService, type NotificationPreferences } from "@/lib/api/services/support";

const INSTALLATION_ID_KEY = "mobile_installation_id";
const ANDROID_NOTIFICATION_CHANNEL_ID = "default";

function isExpoGoAndroid() {
  return Platform.OS === "android" && Constants.expoGoConfig != null;
}

async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(ANDROID_NOTIFICATION_CHANNEL_ID, {
    name: "General",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function getStoredValue(key: string) {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function setStoredValue(key: string, value: string) {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getOrCreateInstallationId() {
  const existing = await getStoredValue(INSTALLATION_ID_KEY);
  if (existing) {
    return existing;
  }

  const generated = globalThis.crypto?.randomUUID?.() || `device-${Date.now()}`;
  await setStoredValue(INSTALLATION_ID_KEY, generated);
  return generated;
}

export async function registerCurrentDevice(
  token: string,
  preferences?: Partial<NotificationPreferences>
) {
  const installationId = await getOrCreateInstallationId();
  await ensureAndroidNotificationChannel();
  const currentPermissions = await Notifications.getPermissionsAsync();
  const permissionResponse = currentPermissions.granted
    ? currentPermissions
    : await Notifications.requestPermissionsAsync();

  let nativeTokenFields: Record<string, unknown> = {};
  let pushCapable = false;
  if (permissionResponse.granted) {
    if (isExpoGoAndroid()) {
      nativeTokenFields = {
        warning: "Remote push notifications require a development or production build on Android.",
      };
    } else {
      try {
        const nativeToken = await Notifications.getDevicePushTokenAsync();
        nativeTokenFields = {
          type: nativeToken.type,
          data: nativeToken.data,
        };
        pushCapable = true;
      } catch (error) {
        nativeTokenFields = {
          error: error instanceof Error ? error.message : "Unable to fetch device token",
        };
      }
    }
  }

  const locale = Intl.DateTimeFormat().resolvedOptions().locale || "";
  const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";

  return SupportService.registerDevice(
    {
      installation_id: installationId,
      platform: Platform.OS === "ios" ? "IOS" : Platform.OS === "android" ? "ANDROID" : Platform.OS === "web" ? "WEB" : "OTHER",
      device_name: Constants.deviceName || Platform.OS,
      device_model: Platform.OS,
      os_version: String(Platform.Version),
      app_version: Constants.expoConfig?.version || Constants.manifest2?.runtimeVersion || "unknown",
      locale,
      timezone: deviceTimezone,
      notifications_enabled: permissionResponse.granted,
      capability_flags: {
        push: pushCapable,
        local: permissionResponse.granted,
        inApp: true,
      },
      preference_state: preferences || {},
      provider_token_fields: nativeTokenFields,
    },
    token
  );
}
