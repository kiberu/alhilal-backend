// lib/api/middleware/errorHandler.ts
import { toast } from "sonner"

export interface ApiError {
  message: string
  status: number
  errors?: Record<string, string[]>
  code?: string
}

type LogoutCallback = () => void | Promise<void>

export class ApiErrorHandler {
  private static logoutCallback: LogoutCallback | null = null

  /**
   * Set the logout callback to be called when token expires.
   * This should be called once during app initialization.
   */
  static setLogoutCallback(callback: LogoutCallback): void {
    this.logoutCallback = callback
  }

  /**
   * Handle global errors such as authentication failures.
   * This method should be called by the API client before throwing errors.
   */
  static handleGlobalError(error: ApiError): void {
    // Only show toast notifications in browser environment
    const isBrowser = typeof window !== "undefined"
    
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.status === 401) {
        console.error("Authentication error:", error.message)
        
      if (isBrowser) {
        // Show user-friendly message
        toast.error("Session Expired", {
          description: "Your session has expired. Please login again.",
          duration: 3000,
        })
        
        // Automatically logout the user
        if (this.logoutCallback) {
          // Use setTimeout to avoid blocking the current operation
          setTimeout(() => {
            this.logoutCallback?.()
          }, 500)
        } else {
          console.warn("No logout callback set. Call ApiErrorHandler.setLogoutCallback() during app initialization.")
        }
      }
      return
    }

    // Handle 403 Forbidden - Insufficient permissions
    if (error.status === 403) {
      console.error("Access denied:", error.message)
      if (isBrowser) {
      toast.error("Access Denied", {
        description: error.message || "You don't have permission to perform this action",
      })
      }
      return
    }

    // Handle 404 Not Found
    if (error.status === 404) {
      console.error("Not found:", error.message)
      if (isBrowser) {
      toast.error("Not Found", {
        description: error.message || "The requested resource was not found",
      })
      }
      return
    }

    // Handle 500 Internal Server Error
    if (error.status >= 500) {
      console.error("Server error:", error.message)
      if (isBrowser) {
      toast.error("Server Error", {
        description: error.message || "An error occurred on the server. Please try again later.",
      })
      }
      return
    }

    // Handle other errors (400s)
    if (error.status >= 400) {
      console.error("API error:", error)
      // Don't show toast for 400 errors from server-side calls (like login from NextAuth)
      // The calling code will handle displaying the error appropriately
      if (isBrowser) {
        // Only show toast for non-authentication 400 errors
        // Authentication errors will be shown in the login form
        if (!error.message?.toLowerCase().includes("password") && 
            !error.message?.toLowerCase().includes("credentials")) {
      toast.error("Error", {
        description: error.message || "An error occurred. Please try again.",
      })
        }
      }
    }
  }

  /**
   * Format validation errors for display in forms.
   * Converts Django REST Framework error format to a more usable structure.
   */
  static formatValidationErrors(errors?: Record<string, string[]>): Record<string, string> {
    if (!errors) return {}
    
    const formatted: Record<string, string> = {}
    Object.entries(errors).forEach(([field, messages]) => {
      formatted[field] = messages.join(", ")
    })
    return formatted
  }

  /**
   * Get a user-friendly error message from an API error.
   */
  static getUserMessage(error: ApiError): string {
    // Use custom message if available
    if (error.message) return error.message

    // Fall back to status-based messages
    switch (error.status) {
      case 400:
        return "Invalid request. Please check your input."
      case 401:
        return "Your session has expired. Please login again."
      case 403:
        return "You don't have permission to perform this action."
      case 404:
        return "The requested resource was not found."
      case 409:
        return "This action conflicts with existing data."
      case 422:
        return "The submitted data is invalid."
      case 500:
        return "A server error occurred. Please try again later."
      default:
        return "An unexpected error occurred."
    }
  }
}

