import { API_BASE_URL, REQUEST_TIMEOUT, MAX_RETRIES, RETRY_DELAY } from './config';
import { AuthStorage } from '@/lib/storage';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export class ApiClient {
  private baseURL: string = API_BASE_URL;
  private timeout = REQUEST_TIMEOUT;
  private maxRetries = MAX_RETRIES;
  private retryDelay = RETRY_DELAY;
  private refreshPromise: Promise<string | null> | null = null;

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') url.searchParams.append(k, String(v));
      });
    }
    return url.toString();
  }

  private async sleep(ms: number) { return new Promise((r) => setTimeout(r, ms)); }

  private async request<T>(
    method: string, 
    endpoint: string, 
    data?: any, 
    params?: any, 
    retry = 0, 
    token?: string,
    allowAuthRetry = true,
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildURL(endpoint, params);
      const isFormData = data instanceof FormData;
      const headers: HeadersInit = {};
      if (!isFormData) headers['Content-Type'] = 'application/json';
      const authToken = token ?? await AuthStorage.getAccessToken();
      if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

      // React Native may not support AbortSignal.timeout; use AbortController if available
      let res: Response;
      if (typeof AbortController !== 'undefined') {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        try {
          res = await fetch(url, {
            method,
            headers,
            body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      } else {
        // Fallback without abort
        res = await fetch(url, {
          method,
          headers,
          body: data ? (isFormData ? data : JSON.stringify(data)) : undefined,
        });
      }

      const contentType = res.headers.get('content-type');
      const payload = contentType && contentType.includes('application/json') ? await res.json() : await res.text();

      if (res.status === 401 && allowAuthRetry && !endpoint.includes('auth/refresh/')) {
        const refreshedToken = await this.refreshAccessToken();
        if (refreshedToken) {
          return this.request<T>(method, endpoint, data, params, retry, refreshedToken, false);
        }
      }

      if (!res.ok) {
        const message = typeof payload === 'object' ? (payload.message || payload.error || payload.detail) : String(payload || 'Request failed');
        return { success: false, error: message, status: res.status };
      }

      // Handle different response formats
      if (typeof payload === 'object' && payload) {
        // If it's already in ApiResponse format
        if ('success' in payload) return { ...(payload as ApiResponse<T>), status: res.status };
        // Otherwise wrap it
        return { success: true, data: payload as T, status: res.status };
      }
      return { success: true, data: payload as T, status: res.status };
    } catch (e: any) {
      // Handle network errors with retry logic
      if (retry < this.maxRetries && !e.message?.includes('abort')) {
        await this.sleep(this.retryDelay * (retry + 1));
        return this.request<T>(method, endpoint, data, params, retry + 1, token, allowAuthRetry);
      }
      return { success: false, error: e?.message || 'Network error', status: 0 };
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      const refreshToken = await AuthStorage.getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      try {
        const response = await fetch(this.buildURL('auth/refresh/'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 400) {
            await AuthStorage.clearAll();
          }
          return null;
        }

        const payload = await response.json();
        const nextAccessToken = payload?.access;
        if (!nextAccessToken) {
          return null;
        }

        await AuthStorage.updateAccessToken(nextAccessToken);
        return nextAccessToken;
      } catch {
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  get<T>(endpoint: string, params?: any, token?: string) { 
    return this.request<T>('GET', endpoint, undefined, params, 0, token); 
  }
  
  post<T>(endpoint: string, data?: any, params?: any, token?: string) { 
    return this.request<T>('POST', endpoint, data, params, 0, token); 
  }
  
  put<T>(endpoint: string, data?: any, params?: any, token?: string) { 
    return this.request<T>('PUT', endpoint, data, params, 0, token); 
  }
  
  patch<T>(endpoint: string, data?: any, params?: any, token?: string) { 
    return this.request<T>('PATCH', endpoint, data, params, 0, token); 
  }
  
  delete<T>(endpoint: string, params?: any, token?: string) { 
    return this.request<T>('DELETE', endpoint, undefined, params, 0, token); 
  }

  /**
   * The client silently refreshes pilgrim access tokens and only clears the
   * session when the refresh token is definitively invalid.
   */
}

export const apiClient = new ApiClient();
