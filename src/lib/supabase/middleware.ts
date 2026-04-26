import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { ROLE_HOME, type Role } from "@/lib/constants"
import type { Database } from "@/types/database"

const PUBLIC_PATHS = ["/", "/login", "/signup", "/invite", "/api/health"]
const ROLE_PREFIXES: Record<string, Role> = {
  "/admin": "platform_admin",
  "/school": "school_admin",
  "/driver": "driver",
  "/parent": "parent",
}
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  // Allow the app to boot before Supabase keys are configured (Phase 0 in progress).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response
  }

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p) ||
    pathname.startsWith("/invite/") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth")

  const isDemoRoute = Object.keys(ROLE_PREFIXES).some((p) => pathname.startsWith(p))

  if (!user && DEMO_MODE && isDemoRoute) {
    return response
  }

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  if (user) {
    const matchedPrefix = Object.keys(ROLE_PREFIXES).find((p) =>
      pathname.startsWith(p)
    )

    if (matchedPrefix) {
      const requiredRole = ROLE_PREFIXES[matchedPrefix]
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle()

      if (roleRow?.role && roleRow.role !== requiredRole) {
        const url = request.nextUrl.clone()
        url.pathname = ROLE_HOME[roleRow.role as Role] ?? "/login"
        return NextResponse.redirect(url)
      }
    }
  }

  return response
}
