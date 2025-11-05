import type { NextAuthConfig } from "next-auth"
import type { Account, StaffProfile } from "@/types/models"

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/error", // Custom error page
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnLogin = nextUrl.pathname.startsWith("/login")
      const isPublicPath = isOnLogin || nextUrl.pathname === "/"

      // Allow public paths
      if (isPublicPath) {
        return true
      }

      // Protect all other paths
      if (!isLoggedIn) {
        return false // Redirect to login
      }

      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.user = user.user
      }
      
      // Handle session update
      if (trigger === "update" && session) {
        token = { ...token, ...session }
      }
      
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.user = token.user as (Account & { staffProfile?: StaffProfile })
      }
      return session
    },
  },
  providers: [], // Add providers with an empty array for now
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  trustHost: true,
} satisfies NextAuthConfig

