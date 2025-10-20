// hooks/useAuth.ts - Refactored for Auth.js
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

/**
 * Custom hook for authentication functionality using Auth.js.
 */
export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const login = async (phone: string, password: string) => {
    const result = await signIn("credentials", {
      phone,
      password,
      redirect: false,
    })

    if (result?.error) {
      throw new Error(result.error)
    }

    if (result?.ok) {
      router.push("/")
    }

    return result
  }

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" })
  }

  return {
    user: session?.user,
    accessToken: session?.accessToken,
    refreshToken: session?.refreshToken,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    login,
    logout,
    isAdmin: session?.user?.staffProfile?.role === "ADMIN",
    isAgent: session?.user?.staffProfile?.role === "AGENT",
  }
}

/**
 * Hook to protect routes that require authentication.
 * Note: With middleware, this is mostly for client-side checks.
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  if (!isLoading && !isAuthenticated) {
    router.push("/login")
  }

  return { isAuthenticated, isLoading }
}

/**
 * Hook to protect routes that require admin role.
 */
export function useRequireAdmin() {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  if (!isLoading) {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (user?.staffProfile?.role !== "ADMIN") {
      router.push("/")
    }
  }

  return { 
    isAuthenticated, 
    isLoading, 
    isAdmin: user?.staffProfile?.role === "ADMIN" 
  }
}
