import type { Metadata } from "next";
import React from 'react';
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Providers } from "./providers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export const metadata: Metadata = {
  title: "Portal.C",
  description: "Tech.C Venture メンバー管理・イベント管理システム",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const roles = session?.user?.roles;

  return (
    <html lang="ja">
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
