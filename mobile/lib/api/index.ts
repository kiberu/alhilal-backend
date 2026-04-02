// Main API exports
export { apiClient, type ApiResponse } from './client';
export { API_ENDPOINTS, API_BASE_URL } from './config';
export type {
  User,
  PilgrimProfile,
  AuthTokens,
  AuthResponse,
  OTPFallback,
  OTPRequestResponse,
  SyncState,
  OfflineSurfaceState,
} from './types';
export * from './services';
