// API Configuration
function getDefaultApiBase(): string {
  const env = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (env) return env.endsWith('/') ? env : env + '/';
  
  // Default to localhost for development
  // Works for: Web, iOS Simulator, and with port forwarding
  return "http://localhost:8000/api/v1/";
  
  // For Android Emulator, set env var: EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000/api/v1/
  // For physical devices, set env var: EXPO_PUBLIC_API_BASE_URL=http://YOUR_LOCAL_IP:8000/api/v1/
  // Example: EXPO_PUBLIC_API_BASE_URL=http://172.20.10.2:8000/api/v1/
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
    ME: API_BASE_URL + "profile/me/",
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
    MY_TRIPS: API_BASE_URL + "me/trips/",
    MY_TRIP_DETAIL: (id: string) => API_BASE_URL + `me/trips/${id}/`,
    ITINERARY: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/itinerary/`,
    ESSENTIALS: (tripId: string) => API_BASE_URL + `me/trips/${tripId}/essentials/`,
  },
  DOCUMENTS: {
    MY_DOCUMENTS: API_BASE_URL + "me/documents/",
    UPLOAD: API_BASE_URL + "documents/upload/",
    DETAIL: (id: string) => API_BASE_URL + `documents/${id}/`,
    DELETE: (id: string) => API_BASE_URL + `documents/${id}/`,
  },
} as const;

export const REQUEST_TIMEOUT = 30000;
export const MAX_RETRIES = 2;
export const RETRY_DELAY = 750;

