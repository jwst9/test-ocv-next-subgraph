import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(request) {
    const authenticated = request.nextauth?.token
    const pathname = request.nextUrl?.pathname

    if (pathname.startsWith("/api/trpc")) {
      return NextResponse.next()
    }

    if (["/signin", "/signup"].includes(pathname)) {
      if (authenticated) {
        return NextResponse.redirect(new URL("/", request.nextUrl.origin))
      }
    } else if (!authenticated) {
      return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: () => true,
    },
  },
)
