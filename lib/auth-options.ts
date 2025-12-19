import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { createAdminClient } from "@/lib/supabase/admin";

interface ExtendedProfile {
  sub: string;
  name?: string;
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

function requireEnv(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} must be set`);
  }
  return value;
}

const issuer = requireEnv(process.env.ZITADEL_ISSUER, "ZITADEL_ISSUER");
const clientId = requireEnv(process.env.ZITADEL_CLIENT_ID, "ZITADEL_CLIENT_ID");
const userInfoEndpoint = requireEnv(
  process.env.ZITADEL_USERINFO_ENDPOINT,
  "ZITADEL_USERINFO_ENDPOINT"
);

async function ensureMemberOnSignIn(user: {
  id?: string;
  name?: string | null;
  email?: string | null;
}) {
  if (!user?.id || !user.email) {
    throw new Error("ZITADEL user id/email is missing");
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("members")
    .select("id")
    .eq("zitadel_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to check member: ${error.message}`);
  }

  if (data) return;

  const enrollmentYear = new Date().getFullYear();
  const { error: insertError } = await supabase.from("members").insert({
    zitadel_id: user.id,
    student_id: null,
    name: user.name ?? user.email,
    school_email: user.email,
    enrollment_year: enrollmentYear,
    major: null,
  });

  if (insertError && insertError.code !== "23505") {
    throw new Error(`Failed to create member: ${insertError.message}`);
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "zitadel",
      name: "ZITADEL",
      type: "oauth",
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      authorization: {
        params: { scope: "openid email profile urn:zitadel:iam:org:project:roles" },
      },
      idToken: true,
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      clientId,
      profile(profile) {
        const extendedProfile = profile as ExtendedProfile;
        return {
          id: extendedProfile.sub,
          name: extendedProfile.name,
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
          userInfoEndpoint,
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
    async signIn({ user }) {
      await ensureMemberOnSignIn(user);
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
};
