import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/")
      const isOnLogin = nextUrl.pathname.startsWith("/login")

      if (isOnDashboard && !isOnLogin) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn && isOnLogin) {
        return Response.redirect(new URL("/", nextUrl))
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
        session.user = token.user as any
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

