import type { NextAuthOptions } from "next-auth";

// 拡張された型定義
interface ExtendedProfile {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  roles?: string[];
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
  }
}

// ZITADEL OIDC設定
export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "zitadel",
      name: "ZITADEL",
      type: "oauth",
      wellKnown: process.env.ZITADEL_ISSUER,
      authorization: { params: { scope: "openid email profile" } },
      idToken: true,
      checks: ["pkce", "state"],
      client: {
        token_endpoint_auth_method: "none",
      },
      clientId: process.env.ZITADEL_CLIENT_ID,
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      if (profile) {
        token.roles = (profile as ExtendedProfile).roles || [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.roles = token.roles;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
