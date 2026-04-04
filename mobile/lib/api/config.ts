import Constants from 'expo-constants';
import { Platform } from 'react-native';

// API Configuration
const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function parseHostFromUri(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const withScheme = trimmed.includes('://') ? trimmed : `http://${trimmed}`;
    return new URL(withScheme).hostname;
  } catch {
    return null;
  }
}

function inferDevMachineHost(): string | null {
  const expoGoDebuggerHost = (Constants as { expoGoConfig?: { debuggerHost?: string } }).expoGoConfig?.debuggerHost;
  const manifestDebuggerHost = (Constants as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;
  const possibleHostUris = [
    Constants.linkingUri,
    Constants.expoConfig?.hostUri,
    expoGoDebuggerHost,
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)?.extra?.expoClient?.hostUri,
    manifestDebuggerHost,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);

  for (const hostUri of possibleHostUris) {
    const host = parseHostFromUri(hostUri);
    if (host && !LOOPBACK_HOSTS.has(host)) {
      return host;
    }
  }

  return null;
}

function rewriteLoopbackHost(baseUrl: string): string {
  try {
    const parsed = new URL(ensureTrailingSlash(baseUrl));
    if (!LOOPBACK_HOSTS.has(parsed.hostname)) {
      return parsed.toString();
    }

    const devMachineHost = inferDevMachineHost();
    if (devMachineHost) {
      parsed.hostname = devMachineHost;
      return parsed.toString();
    }

    if (Platform.OS === 'android') {
      // Android Emulator uses 10.0.2.2 to reach the host machine.
      parsed.hostname = '10.0.2.2';
      return parsed.toString();
    }

    return parsed.toString();
  } catch {
    return ensureTrailingSlash(baseUrl);
  }
}

function getDefaultApiBase(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (env) {
    return rewriteLoopbackHost(env);
  }

  const devMachineHost = inferDevMachineHost();
  if (devMachineHost) {
    return `http://${devMachineHost}:8000/api/v1/`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api/v1/';
  }

  // iOS simulator + web fallback.
  return 'http://localhost:8000/api/v1/';
}

export const API_BASE_URL = getDefaultApiBase();

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: {
    REQUEST_OTP: API_BASE_URL + "auth/request-otp/",
    VERIFY_OTP: API_BASE_URL + "auth/verify-otp/",
    REFRESH_TOKEN: API_BASE_URL + "auth/refresh/",
    STAFF_LOGIN: API_BASE_URL + "auth/staff/login/",
    STAFF_PROFILE: API_BASE_URL + "auth/staff/profile/",
  },
  PROFILE: {
    ME: API_BASE_URL + "me/",
    UPDATE: API_BASE_URL + "profile/update/",
  },
  BOOKINGS: {
    MY_BOOKINGS: API_BASE_URL + "me/bookings/",
    BOOKING_DETAIL: (id: string) => API_BASE_URL + `me/bookings/${id}/`,
    CREATE: API_BASE_URL + "bookings/create/",
  },
  TRIPS: {
    PUBLIC_LIST: API_BASE_URL + "public/trips/",
    PUBLIC_DETAIL: (id: string) => API_BASE_URL + `public/trips/${id}/`,
    PUBLIC_DETAIL_BY_SLUG: (slug: string) => API_BASE_URL + `public/trips/slug/${slug}/`,
    MY_TRIPS: API_BASE_URL + "me/trips/",
    MY_TRIP_DETAIL: (id: string) => API_BASE_URL + `me/trips/${id}/`,
    ITINERARY: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/itinerary/`,
    UPDATES: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/updates/`,
    ESSENTIALS: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/essentials/`,
    MILESTONES: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/milestones/`,
    RESOURCES: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/resources/`,
    READINESS: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/readiness/`,
    DAILY_PROGRAM: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/daily-program/`,
    FEEDBACK: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/feedback/`,
  },
  CONTENT: {
    GUIDANCE_LIST: API_BASE_URL + "public/guidance/",
    GUIDANCE_DETAIL: (slug: string) => API_BASE_URL + `public/guidance/${slug}/`,
    VIDEOS: API_BASE_URL + "public/videos/",
  },
  LEADS: {
    PUBLIC_CREATE: API_BASE_URL + "public/leads/",
  },
  NOTIFICATIONS: {
    PREFERENCES: API_BASE_URL + "me/notification-preferences/",
    DEVICES: API_BASE_URL + "me/devices/",
    DEVICE_DETAIL: (deviceId: string) => API_BASE_URL + `me/devices/${deviceId}/`,
  },
  DOCUMENTS: {
    MY_DOCUMENTS: API_BASE_URL + "me/documents/",
    DETAIL: (id: string) => API_BASE_URL + `me/documents/${id}/`,
    DELETE: (id: string) => API_BASE_URL + `me/documents/${id}/`,
  },
} as const;

export const REQUEST_TIMEOUT = 30000;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 750;
