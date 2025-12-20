import type { ReactNode } from "react";
import Link from "next/link";
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

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500">Admin Console</p>
            <p className="text-sm font-semibold text-gray-900">管理メニュー</p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm text-gray-600">
            <Link
              href="/admin"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              概要
            </Link>
            <Link
              href="/admin/events/create"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              イベント作成
            </Link>
            <Link
              href="/admin/events/participants"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              登録イベント一覧
            </Link>
            <Link
              href="/admin/timetables"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              時間割
            </Link>
            <Link
              href="/admin/hr"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              メンバーHR
            </Link>
            <Link
              href="/admin/gmail"
              className="rounded-full border border-gray-200 px-3 py-1 hover:bg-gray-50"
            >
              Gmail登録
            </Link>
          </nav>
        </div>
      </div>
      {children}
    </div>
  );
}
