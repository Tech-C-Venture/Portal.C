import NextAuth from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";

async function handler(...args: Parameters<ReturnType<typeof NextAuth>>) {
  return NextAuth(getAuthOptions())(...args);
}

export { handler as GET, handler as POST };
