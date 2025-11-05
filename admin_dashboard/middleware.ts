import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isLoginPath = nextUrl.pathname === "/login"
  const isRootPath = nextUrl.pathname === "/"
  const isErrorPath = nextUrl.pathname === "/error"

  // Redirect authenticated users from login to dashboard
  if (isLoggedIn && isLoginPath) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect authenticated users from root to dashboard
  if (isLoggedIn && isRootPath) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl))
  }

  // Redirect unauthenticated users from protected paths to login
  if (!isLoggedIn && !isLoginPath && !isRootPath && !isErrorPath) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

