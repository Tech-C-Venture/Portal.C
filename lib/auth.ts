import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth-options";

function isBuildPhase() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

export async function getSession() {
  if (isBuildPhase()) {
    return null;
  }
  try {
    return await getServerSession(getAuthOptions());
  } catch (error) {
    console.warn("[auth] Failed to get server session:", error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function isAdmin() {
  const session = await getSession();
  const roles = session?.user?.roles || [];
  return roles.includes("admin");
}
