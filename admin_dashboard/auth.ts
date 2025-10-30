import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"
import { AuthService } from "@/lib/api/services/auth"
import type { Account, StaffProfile } from "@/types/models"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Phone and password are required")
        }

        try {
          // Call Django backend API
          const response = await AuthService.login({
            phone: credentials.phone as string,
            password: credentials.password as string,
          })

          if (response.success && response.data) {
            // Return user data with tokens
            return {
              id: response.data.user.id,
              name: response.data.user.name,
              email: response.data.user.email || null,
              phone: response.data.user.phone,
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              user: response.data.user,
            }
          }

          throw new Error(response.error || "Authentication failed")
        } catch (error) {
          console.error("Auth error:", error)
          const errorMessage = error instanceof Error ? error.message : "Authentication failed"
          throw new Error(errorMessage)
        }
      },
    }),
  ],
})

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    accessToken: string
    refreshToken: string
    user: Account & { staffProfile?: StaffProfile }
  }

  interface User {
    accessToken: string
    refreshToken: string
    user: Account & { staffProfile?: StaffProfile }
    phone: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string
    refreshToken: string
    user: Account & { staffProfile?: StaffProfile }
  }
}

