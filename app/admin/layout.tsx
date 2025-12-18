import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/events");
  }

  return children;
}
