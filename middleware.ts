import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  console.log("Middleware running, session:", !!session, "path:", req.nextUrl.pathname)

  // Only redirect from dashboard to login if no session
  if (!session && req.nextUrl.pathname.startsWith("/dashboard")) {
    console.log("No session, redirecting to login")
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}