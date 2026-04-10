import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

async function isProfileComplete(req: NextRequest, zitadelId: string): Promise<boolean> {
  try {
    const checkUrl = new URL("/api/check-onboarding", req.url)
    checkUrl.searchParams.set("zitadelId", zitadelId)

    const response = await fetch(checkUrl.toString(), {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
      },
    })

    if (!response.ok) {
      return true
    }

    const data = (await response.json()) as { complete: boolean }
    return data.complete
  } catch {
    return true
  }
}

async function getSessionUserId(req: NextRequest): Promise<string | null> {
  const sessionUrl = new URL("/api/auth/session", req.url)
  const response = await fetch(sessionUrl.toString(), {
    headers: {
      cookie: req.headers.get("cookie") ?? "",
    },
  })

  if (!response.ok) return null

  const session = (await response.json()) as { user?: { id?: string } }
  const userId = session?.user?.id
  return typeof userId === "string" ? userId : null
}

export async function middleware(req: NextRequest) {
  // OPTIONSプリフライトリクエストには即座に200を返す
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": req.headers.get("access-control-request-headers") ?? "*",
        "Access-Control-Max-Age": "86400",
      },
    })
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl
  const hasSessionCookie = Boolean(
    req.cookies.get("__Secure-next-auth.session-token")?.value ??
      req.cookies.get("next-auth.session-token")?.value
  )
  const sessionUserId =
    !token && hasSessionCookie ? await getSessionUserId(req) : null

  if (pathname.startsWith("/login")) {
    if (token || sessionUserId) {
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

  if (!token && !sessionUserId) {
    const loginUrl = new URL("/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const zitadelId =
    typeof token?.sub === "string" ? token.sub : sessionUserId ?? ""
  if (zitadelId) {
    const profileComplete = await isProfileComplete(req, zitadelId)
    if (pathname.startsWith("/onboarding")) {
      return profileComplete
          ? NextResponse.redirect(new URL("/", req.url))
          : NextResponse.next()
    }
    if (!profileComplete) {
      return NextResponse.redirect(new URL("/onboarding", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
}
