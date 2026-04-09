import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/lib/auth-options";

export async function getSession() {
  return await getServerSession(getAuthOptions());
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
