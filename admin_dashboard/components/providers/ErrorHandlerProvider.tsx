"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { ApiErrorHandler } from "@/lib/api/middleware/errorHandler"

/**
 * Provider that initializes the API error handler with logout callback.
 * This enables automatic logout when token expires (401 errors).
 */
export function ErrorHandlerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Set up the logout callback once during app initialization
    ApiErrorHandler.setLogoutCallback(async () => {
      console.log("Token expired - logging out user")
      await signOut({ 
        redirect: true, 
        callbackUrl: "/login?expired=true" 
      })
    })
  }, [])

  return <>{children}</>
}

