import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isPublicPath = nextUrl.pathname.startsWith("/login")
  const isProtectedPath = !isPublicPath

  // Redirect authenticated users away from login
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/", nextUrl))
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

