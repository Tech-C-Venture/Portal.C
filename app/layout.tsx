import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { isAdmin } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Portal.C - Tech.C Venture",
  description: "Tech.C Ventureのメンバー管理・イベント管理システム",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isAdminUser = await isAdmin();

  return (
    <html lang="ja" className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden">
        <Navigation isAdmin={isAdminUser} />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
