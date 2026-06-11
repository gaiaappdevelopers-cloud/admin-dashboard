import { NextRequest, NextResponse } from "next/server"

const PUBLIC_PATHS = ["/login"]
const API_PATHS = ["/api/"]

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (API_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const isPublic = PUBLIC_PATHS.includes(pathname)
  const isAuthenticated = !!req.cookies.get("refresh_token")?.value

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
