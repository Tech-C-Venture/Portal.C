import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

interface ExtendedProfile {
  sub: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  email?: string;
  picture?: string;
  roles?: string[];
  "urn:zitadel:iam:org:project:roles"?: string[];
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: string[];
    email?: string | null;
    sub?: string;
    accessToken?: string;
    idToken?: string;
  }
}

function extractRoles(profile?: ExtendedProfile | null): string[] {
  if (!profile) return [];
  if (Array.isArray(profile.roles)) return profile.roles;
  const projectRoles = profile["urn:zitadel:iam:org:project:roles"];
  if (Array.isArray(projectRoles)) return projectRoles;
  if (projectRoles && typeof projectRoles === "object") {
    return Object.keys(projectRoles);
  }
  return [];
}

async function fetchUserInfoRoles(
  endpoint: string,
  accessToken?: string | null
): Promise<string[]> {
  if (!accessToken) return [];

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn('[auth] userinfo request failed', response.status);
      return [];
    }

    const profile = (await response.json()) as ExtendedProfile;
    return extractRoles(profile);
  } catch {
    return [];
  }
}

function resolveDisplayName(
  profile: ExtendedProfile | null | undefined,
  fallback: string | null
): string | null {
  const explicit = profile?.name?.trim();
  if (explicit) return explicit;
  const given = profile?.given_name?.trim();
  const family = profile?.family_name?.trim();
  if (given || family) {
    return [family, given].filter(Boolean).join(" ").trim();
  }
  const preferred = profile?.preferred_username?.trim();
  if (preferred) return preferred;
  const fallbackValue = fallback?.trim();
  return fallbackValue || null;
}

async function fetchUserInfoName(
  endpoint: string,
  accessToken?: string | null
): Promise<string | null> {
  if (!accessToken) return null;

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return null;
    }

    const profile = (await response.json()) as ExtendedProfile;
    return resolveDisplayName(profile, null);
  } catch {
    return null;
  }
}

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

function getIssuer() {
  return isBuildPhase() ? 'https://build-placeholder' : requireEnv(process.env.ZITADEL_ISSUER, "ZITADEL_ISSUER");
}
function getClientId() {
  return isBuildPhase() ? 'build-placeholder' : requireEnv(process.env.ZITADEL_CLIENT_ID, "ZITADEL_CLIENT_ID");
}
function getUserInfoEndpoint() {
  return isBuildPhase() ? 'https://build-placeholder/userinfo' : requireEnv(process.env.ZITADEL_USERINFO_ENDPOINT, "ZITADEL_USERINFO_ENDPOINT");
}

async function resolveUserName(
  user: { name?: string | null },
  profile?: ExtendedProfile | null,
  accessToken?: string | null
): Promise<string | null> {
  const candidate = resolveDisplayName(profile, user.name ?? null);
  if (candidate) return candidate;
  return await fetchUserInfoName(getUserInfoEndpoint(), accessToken);
}

async function ensureMemberOnSignIn(user: {
  id?: string;
  name?: string | null;
  email?: string | null;
}, profile?: ExtendedProfile | null, accessToken?: string | null) {
  if (!user?.id || !user.email) {
    throw new Error("ZITADEL user id/email is missing");
  }

  const db = getDb();
  const membersRef = db.collection("members");
  const resolvedName = await resolveUserName(user, profile, accessToken);
  const normalizedName = resolvedName?.trim() || null;

  // zitadel_idで既存メンバーを検索
  const snap = await membersRef
    .where("zitadel_id", "==", user.id)
    .limit(1)
    .get();

  if (!snap.empty) {
    const doc = snap.docs[0];
    const data = doc.data();
    const normalizedMemberName = (data.name as string)?.trim();
    if (normalizedName && normalizedName !== normalizedMemberName) {
      await doc.ref.update({ name: normalizedName });
    }
    return;
  }

  // 新規メンバー作成
  const enrollmentYear = new Date().getFullYear();
  const newId = crypto.randomUUID();
  await membersRef.doc(newId).set({
    zitadel_id: user.id,
    student_id: null,
    name: normalizedName ?? user.email,
    school_email: user.email,
    gmail_address: null,
    enrollment_year: enrollmentYear,
    is_repeating: false,
    repeat_years: null,
    major: null,
    onboarding_completed: false,
    current_status: null,
    status_updated_at: null,
    avatar_url: null,
    skills: [],
    interests: [],
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  });
}

let _authOptions: NextAuthOptions | null = null;

export function getAuthOptions(): NextAuthOptions {
  if (_authOptions) return _authOptions;
  _authOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    providers: [
      {
        id: "zitadel",
        name: "ZITADEL",
        type: "oauth",
        wellKnown: `${getIssuer()}/.well-known/openid-configuration`,
      authorization: {
        params: { scope: "openid email profile urn:zitadel:iam:org:project:roles" },
      },
      idToken: true,
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      clientId: getClientId(),
      profile(profile) {
        const extendedProfile = profile as ExtendedProfile;
        return {
          id: extendedProfile.sub,
          name: resolveDisplayName(extendedProfile, null),
          email: extendedProfile.email,
          image: extendedProfile.picture,
          roles: extractRoles(extendedProfile),
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
        token.sub = account.providerAccountId;
      }
      if (profile) {
        const extendedProfile = profile as ExtendedProfile;
        token.email = extendedProfile.email ?? token.email ?? null;
        token.roles = extractRoles(extendedProfile);
      }

      if (!token.roles || token.roles.length === 0) {
        const userInfoRoles = await fetchUserInfoRoles(
          getUserInfoEndpoint(),
          token.accessToken as string | null
        );
        if (userInfoRoles.length > 0) {
          token.roles = userInfoRoles;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.sub as string) ?? session.user.id;
        session.user.email = (token.email as string | null) ?? session.user.email;
        session.user.roles = token.roles;
      }
      return session;
    },
    async signIn({ user, profile, account }) {
      try {
        await ensureMemberOnSignIn(
          user,
          profile as ExtendedProfile | null,
          (account?.access_token as string | null) ?? null
        );
      } catch (error) {
        console.error("[auth] ensureMemberOnSignIn failed:", error);
        // Firestoreエラーでもログイン自体はブロックしない
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  };
  return _authOptions;
}

