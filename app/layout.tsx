import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "Portal.C - Tech.C Venture",
  description: "Tech.C Ventureのメンバー管理・イベント管理システム",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="ja">
      <body>
        <Providers>
          {session && <Navigation />}
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
