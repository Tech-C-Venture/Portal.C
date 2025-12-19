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
  memberUrl.searchParams.set(
    "select",
    "id,student_id,enrollment_year,major,is_repeating,repeat_years"
  )
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
    student_id: string | null
    enrollment_year: number | null
    major: string | null
    is_repeating: boolean | null
    repeat_years: number | null
  }>

  const member = data[0]
  if (!member) return false

  const tagsUrl = new URL(`${supabaseUrl}/rest/v1/member_tags`)
  tagsUrl.searchParams.set("select", "tag:tags(category)")
  tagsUrl.searchParams.set("member_id", `eq.${member.id}`)

  const tagsResponse = await fetch(tagsUrl.toString(), {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: "application/json",
    },
  })

  if (!tagsResponse.ok) {
    return true
  }

  const tags = (await tagsResponse.json()) as Array<{
    tag: { category: string } | null
  }>

  let hasSkill = false
  let hasInterest = false
  for (const item of tags) {
    if (item.tag?.category === "skill") hasSkill = true
    if (item.tag?.category === "interest") hasInterest = true
  }

  const baseOk =
    !!member.student_id &&
    !!member.enrollment_year &&
    !!member.major &&
    member.major.trim().length > 0 &&
    hasSkill &&
    hasInterest
  const repeatingOk = !member.is_repeating || !!member.repeat_years

  return baseOk && repeatingOk
}

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  if (pathname.startsWith("/login")) {
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

  const tokenRoles = (token as { roles?: unknown }).roles
  const roles = Array.isArray(tokenRoles)
    ? tokenRoles.filter((role): role is string => typeof role === "string")
    : []
  const isAdmin = roles.includes("admin")
  const zitadelId = typeof token.sub === "string" ? token.sub : ""
  if (!isAdmin && zitadelId) {
    const profileComplete = await isProfileComplete(zitadelId)
    if (!profileComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/events", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico).*)",
  ],
}
