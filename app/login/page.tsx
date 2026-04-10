import { getServerSession } from "next-auth";
  import { redirect } from "next/navigation";
  import { getAuthOptions } from "@/lib/auth-options";
  import { LoginPageClient } from "./LoginPageClient";

  type LoginPageProps = {
    searchParams?: Promise<{ callbackUrl?: string | string[] }>;
  };

  export default async function LoginPage({ searchParams }: LoginPageProps) {
    const session = await getServerSession(getAuthOptions());
    if (session) {
      const resolvedSearchParams = searchParams ? await searchParams :
  undefined;
      const callbackUrl = resolvedSearchParams?.callbackUrl;
      const rawCallback = Array.isArray(callbackUrl)
        ? callbackUrl[0]
        : callbackUrl;
      const safeCallback =
        rawCallback && rawCallback.startsWith("/") ? rawCallback : "/";
      redirect(safeCallback);
    }

    return <LoginPageClient />;
  }