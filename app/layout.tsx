import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "Portal.C",
  description: "Tech.C Venture メンバー管理・イベント管理システム",
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(getAuthOptions());
  const roles = session?.user?.roles;

  return (
    <html lang="ja">
      <head>
        <meta name="theme-color" content="#2a61b3" />
      </head>
      <body className="bg-gray-50 text-gray-900">
        <Providers>
          {session && <Navigation roles={roles} />}
          <main className="container mx-auto min-h-screen px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
