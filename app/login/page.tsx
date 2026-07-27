export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { redirect } from "next/navigation";
  import { getSession } from "@/lib/auth";
  import { LoginPageClient } from "./LoginPageClient";

  type LoginPageProps = {
    searchParams?: Promise<{ callbackUrl?: string | string[] }>;
  };

  export default async function LoginPage({ searchParams }: LoginPageProps) {
    const session = await getSession();
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