import { API_BASE_URL, REQUEST_TIMEOUT, MAX_RETRIES, RETRY_DELAY } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export class ApiClient {
  private baseURL: string = API_BASE_URL;
  private timeout = REQUEST_TIMEOUT;
  private maxRetries = MAX_RETRIES;
  private retryDelay = RETRY_DELAY;
  private onUnauthorized?: () => void;

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
    token?: string
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildURL(endpoint, params);
      const isFormData = data instanceof FormData;
      const headers: HeadersInit = {};
      if (!isFormData) headers['Content-Type'] = 'application/json';
      if (token) headers['Authorization'] = `Bearer ${token}`;

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

      if (!res.ok) {
        const message = typeof payload === 'object' ? (payload.message || payload.error || payload.detail) : String(payload || 'Request failed');
        
        // Check for unauthorized/token expired errors
        const isUnauthorized = res.status === 401 || res.status === 403;
        const isTokenError = message && (
          message.toLowerCase().includes('invalid token') ||
          message.toLowerCase().includes('expired token') ||
          message.toLowerCase().includes('unauthorized') ||
          message.toLowerCase().includes('authentication')
        );
        
        if ((isUnauthorized || isTokenError) && this.onUnauthorized) {
          // Trigger logout callback
          this.onUnauthorized();
        }
        
        return { success: false, error: message };
      }

      // Handle different response formats
      if (typeof payload === 'object' && payload) {
        // If it's already in ApiResponse format
        if ('success' in payload) return payload as ApiResponse<T>;
        // Otherwise wrap it
        return { success: true, data: payload as T };
      }
      return { success: true, data: payload as T };
    } catch (e: any) {
      // Handle network errors with retry logic
      if (retry < this.maxRetries && !e.message?.includes('abort')) {
        await this.sleep(this.retryDelay * (retry + 1));
        return this.request<T>(method, endpoint, data, params, retry + 1, token);
      }
      return { success: false, error: e?.message || 'Network error' };
    }
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
   * Set a callback to be invoked when an unauthorized (401/403) response is received
   * This is used to automatically logout the user when their token expires
   */
  setUnauthorizedCallback(callback: () => void) {
    this.onUnauthorized = callback;
  }
}

export const apiClient = new ApiClient();

