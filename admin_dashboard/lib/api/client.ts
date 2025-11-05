// lib/api/client.ts

import {
  API_BASE_URL,
  REQUEST_TIMEOUT,
  MAX_RETRIES,
  RETRY_DELAY,
} from "./config"
import { ApiErrorHandler } from "./middleware/errorHandler"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  items?: T
  message?: string
  error?: string
  errors?: Record<string, string[]>
  meta?: {
    page?: number
    size?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
  code?: string
}

export class ApiClient {
  private baseURL: string
  private timeout: number
  private maxRetries: number
  private retryDelay: number

  constructor(
    baseURL: string = API_BASE_URL,
    timeout: number = REQUEST_TIMEOUT,
    maxRetries: number = MAX_RETRIES,
    retryDelay: number = RETRY_DELAY
  ) {
    this.baseURL = baseURL
    this.timeout = timeout
    this.maxRetries = maxRetries
    this.retryDelay = retryDelay
  }

  private getAuthToken(): string | null {
    // For client-side requests, check for manually set tokens
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      )
    }
    return null
  }

  /** Publicly clear stored auth token */
  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
      sessionStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      sessionStorage.removeItem("refresh_token")
    }
  }

  private buildURL(
    endpoint: string,
    params?: Record<string, string | number | boolean>
  ): string {
    // Handle absolute URLs
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      const url = new URL(endpoint)
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            url.searchParams.append(k, String(v))
          }
        })
      }
      return url.toString()
    }
    
    // Handle relative URLs
    const baseURL = this.baseURL.endsWith('/') ? this.baseURL : this.baseURL + '/'
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
    const url = new URL(cleanEndpoint, baseURL)
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") {
          url.searchParams.append(k, String(v))
        }
      })
    }
    
    return url.toString()
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms))
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    params?: Record<string, string | number | boolean>,
    retryCount = 0,
    authToken?: string
  ): Promise<ApiResponse<T>> {
    try {
      const url = this.buildURL(endpoint, params)
      // Always use the passed authToken if provided, otherwise fall back to stored token
      const token = authToken || this.getAuthToken()
      const isFormData = data instanceof FormData

      const headers: HeadersInit = {}
      if (!isFormData) headers["Content-Type"] = "application/json"
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
      
      // Add cache-busting headers to prevent 304 responses for all requests
      headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
      headers["Pragma"] = "no-cache"
      headers["Expires"] = "0"

      const config: RequestInit = {
        method,
        headers,
        signal: AbortSignal.timeout(this.timeout),
        mode: 'cors',
      }
      if (data) {
        if (isFormData) {
          config.body = data
        } else if (["POST", "PUT", "PATCH"].includes(method)) {
          config.body = JSON.stringify(data)
        }
      }

      const res = await fetch(url, config)
      const contentType = res.headers.get("content-type")
      let payload: unknown
      
      if (contentType && contentType.includes("application/json")) {
        payload = await res.json()
      } else {
        payload = await res.text()
      }

      if (!res.ok) {
        let errorMessage = "An error occurred";
        let errorDetails = undefined;
        
        if (payload && typeof payload === "object") {
          // Handle nested error structure (success: false, error: {...})
          if (payload.error && typeof payload.error === "object") {
            errorMessage = payload.error.message || errorMessage;
            errorDetails = payload.error.errors;
            const errorCode = payload.error.code;
            
            const apiError = {
              message: errorMessage,
              status: res.status,
              errors: errorDetails,
              code: errorCode,
            } as ApiError;
            
            // Handle global errors (like invalid token)
            ApiErrorHandler.handleGlobalError(apiError);
            
            // Throw the structured error object
            throw apiError;
          } else {
            // Handle flat error structure
            // Check for both 'error' and 'message' fields for backend compatibility
            errorMessage = payload.error || payload.message || errorMessage;
            errorDetails = payload.errors;
            
            const apiError = {
              message: errorMessage,
              status: res.status,
              errors: errorDetails,
            } as ApiError;
            
            // Handle global errors
            ApiErrorHandler.handleGlobalError(apiError);
            
            throw apiError;
          }
        } else if (typeof payload === "string" && payload.length > 0) {
          errorMessage = payload;
          
          const apiError = {
            message: errorMessage,
            status: res.status,
            errors: errorDetails,
          } as ApiError;
          
          ApiErrorHandler.handleGlobalError(apiError);
          
          throw apiError;
        }
      }

      if (typeof payload === "object" && payload !== null) {
        if ("success" in payload) {
          return payload as ApiResponse<T>
        }
        return { success: true, data: payload as T };
      }
      return { success: true, data: payload as T };
    } catch (err) {
      if (
        retryCount < this.maxRetries &&
        err instanceof Error &&
        err.name !== "AbortError"
      ) {
        await this.sleep(this.retryDelay * (retryCount + 1))
        return this.makeRequest<T>(
          method,
          endpoint,
          data,
          params,
          retryCount + 1,
          authToken
        )
      }

      if (err instanceof Error && err.name === "AbortError") {
        throw { message: "Request timeout", status: 408 } as ApiError
      }

      if (err && "status" in err) {
        throw err as ApiError
      }

      throw { message: err?.message || "Network error", status: 0 } as ApiError
    }
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>, authToken?: string) {
    return this.makeRequest<T>("GET", endpoint, undefined, params, 0, authToken)
  }
  post<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean>, authToken?: string) {
    return this.makeRequest<T>("POST", endpoint, data, params, 0, authToken)
  }
  put<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean>, authToken?: string) {
    return this.makeRequest<T>("PUT", endpoint, data, params, 0, authToken)
  }
  patch<T>(endpoint: string, data?: unknown, params?: Record<string, string | number | boolean>, authToken?: string) {
    return this.makeRequest<T>("PATCH", endpoint, data, params, 0, authToken)
  }
  delete<T>(endpoint: string, params?: Record<string, string | number | boolean>, authToken?: string) {
    return this.makeRequest<T>("DELETE", endpoint, undefined, params, 0, authToken)
  }

  // Convenience method for FormData uploads
  postFormData<T>(endpoint: string, formData: FormData, params?: Record<string, string | number | boolean>, authToken?: string) {
    return this.makeRequest<T>("POST", endpoint, formData, params, 0, authToken)
  }

  setAuthToken(token: string, remember = false): void {
    if (typeof window !== "undefined") {
      if (remember) {
        localStorage.setItem("auth_token", token)
        sessionStorage.removeItem("auth_token")
      } else {
        sessionStorage.setItem("auth_token", token)
        localStorage.removeItem("auth_token")
      }
    }
  }

  setRefreshToken(token: string, remember = false): void {
    if (typeof window !== "undefined") {
      if (remember) {
        localStorage.setItem("refresh_token", token)
        sessionStorage.removeItem("refresh_token")
      } else {
        sessionStorage.setItem("refresh_token", token)
        localStorage.removeItem("refresh_token")
      }
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("refresh_token") ||
        sessionStorage.getItem("refresh_token")
      )
    }
    return null
  }

  isAuthenticated(): boolean {
    return this.getAuthToken() !== null
  }
}

export const apiClient = new ApiClient()

