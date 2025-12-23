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
    const discoveredEndpoint = config.end_session_endpoint ?? null;
    if (!discoveredEndpoint) return null;

    try {
      const issuerUrl = new URL(issuer);
      const endpointUrl = new URL(discoveredEndpoint);
      if (issuerUrl.origin !== endpointUrl.origin) {
        return null;
      }
    } catch {
      return null;
    }

    return discoveredEndpoint;
  } catch {
    return null;
  }
}

function clearAuthCookies(response: NextResponse, isSecure: boolean) {
  const baseOptions = {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
  };

  response.cookies.set("next-auth.session-token", "", baseOptions);
  response.cookies.set("next-auth.csrf-token", "", baseOptions);
  response.cookies.set("next-auth.callback-url", "", baseOptions);

  const secureOptions = { ...baseOptions, secure: isSecure };
  response.cookies.set("__Secure-next-auth.session-token", "", secureOptions);
  response.cookies.set("__Secure-next-auth.callback-url", "", secureOptions);
  response.cookies.set("__Host-next-auth.csrf-token", "", secureOptions);
}

export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const endpoint = await resolveEndSessionEndpoint();
  const fallbackUrl = new URL("/login", request.url);
  const isSecure = new URL(request.url).protocol === "https:";

  if (!endpoint) {
    const response = NextResponse.redirect(fallbackUrl);
    clearAuthCookies(response, isSecure);
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
  clearAuthCookies(response, isSecure);
  return response;
}
