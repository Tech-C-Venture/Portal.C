import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

async function isProfileComplete(zitadelId: string): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return true
  }

  const memberUrl = new URL(`${supabaseUrl}/rest/v1/members`)
  memberUrl.searchParams.set("select", "id,onboarding_completed")
  memberUrl.searchParams.set("zitadel_id", `eq.${encodeURIComponent(zitadelId)}`)
  memberUrl.searchParams.set("limit", "1")

  const memberResponse = await fetch(memberUrl.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  })

  if (!memberResponse.ok) {
    return true
  }

  const data = (await memberResponse.json()) as Array<{
    id: string
    onboarding_completed: boolean | null
  }>

  const member = data[0]
  if (!member) return false

  return Boolean(member.onboarding_completed)
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/login")) {
    if (token) {
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")
      const safeCallback =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/"
      return NextResponse.redirect(new URL(safeCallback, req.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith("/onboarding")) {
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token) {
    const zitadelId = typeof token.sub === "string" ? token.sub : ""
    if (zitadelId) {
      const profileComplete = await isProfileComplete(zitadelId)
      if (!profileComplete) {
        return NextResponse.redirect(new URL("/onboarding", req.url))
      }
      if (pathname === "/") {
        return NextResponse.redirect(new URL("/events", req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}
