import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { LoginPageClient } from "./LoginPageClient";

type LoginPageProps = {
  searchParams?: { callbackUrl?: string | string[] };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);
  if (session) {
    const callbackUrl = searchParams?.callbackUrl;
    const rawCallback = Array.isArray(callbackUrl)
      ? callbackUrl[0]
      : callbackUrl;
    const safeCallback =
      rawCallback && rawCallback.startsWith("/") ? rawCallback : "/";
    redirect(safeCallback);
  }

  return <LoginPageClient />;
}
