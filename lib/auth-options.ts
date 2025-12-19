import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";

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
  if (Array.isArray(profile["urn:zitadel:iam:org:project:roles"])) {
    return profile["urn:zitadel:iam:org:project:roles"] ?? [];
  }
  return [];
}

const issuer = process.env.ZITADEL_ISSUER;
const clientId = process.env.ZITADEL_CLIENT_ID;

if (!issuer || !clientId) {
  throw new Error("ZITADEL_ISSUER and ZITADEL_CLIENT_ID must be set");
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    {
      id: "zitadel",
      name: "ZITADEL",
      type: "oauth",
      wellKnown: `${issuer}/.well-known/openid-configuration`,
      authorization: { params: { scope: "openid email profile" } },
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
  },
  pages: {
    signIn: "/login",
  },
};
