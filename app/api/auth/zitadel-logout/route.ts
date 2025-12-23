import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const issuer = process.env.ZITADEL_ISSUER;
const clientId = process.env.ZITADEL_CLIENT_ID;
const endSessionEndpoint = process.env.ZITADEL_END_SESSION_ENDPOINT;

async function resolveEndSessionEndpoint(): Promise<string | null> {
  if (endSessionEndpoint) return endSessionEndpoint;
  if (!issuer) return null;
  try {
    const response = await fetch(`${issuer}/.well-known/openid-configuration`);
    if (!response.ok) return null;
    const config = (await response.json()) as { end_session_endpoint?: string };
    return config.end_session_endpoint ?? null;
  } catch {
    return null;
  }
}

function clearAuthCookies(response: NextResponse) {
  const cookieOptions = { maxAge: 0, path: "/" };
  response.cookies.set("next-auth.session-token", "", cookieOptions);
  response.cookies.set("__Secure-next-auth.session-token", "", cookieOptions);
  response.cookies.set("next-auth.csrf-token", "", cookieOptions);
  response.cookies.set("__Host-next-auth.csrf-token", "", cookieOptions);
  response.cookies.set("next-auth.callback-url", "", cookieOptions);
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const endpoint = await resolveEndSessionEndpoint();
  const fallbackUrl = new URL("/login", request.url);

  if (!endpoint) {
    const response = NextResponse.redirect(fallbackUrl);
    clearAuthCookies(response);
    return response;
  }

  const postLogoutRedirectUri = new URL("/login", request.url).toString();
  const params = new URLSearchParams({
    post_logout_redirect_uri: postLogoutRedirectUri,
  });
  if (token?.idToken) {
    params.set("id_token_hint", String(token.idToken));
  }
  if (clientId) {
    params.set("client_id", clientId);
  }

  const logoutUrl = `${endpoint}?${params.toString()}`;
  const response = NextResponse.redirect(logoutUrl);
  clearAuthCookies(response);
  return response;
}
