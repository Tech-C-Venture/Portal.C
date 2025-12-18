import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/layout/Navigation";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Portal.C - Tech.C Venture",
  description: "Tech.C Ventureのメンバー管理・イベント管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="ja" className="overflow-x-hidden">
      <body className="antialiased overflow-x-hidden">
        <Providers>
          <Navigation />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
