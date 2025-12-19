"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md sm:max-w-lg rounded-xl bg-white px-6 py-8 sm:px-10 sm:py-10 shadow-md text-center">
        <div className="mb-6 flex justify-center">
          <img src="/tech-c-venture-logo.png" alt="Tech.C Venture" className="h-16" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Portal.C</h1>
        <p className="mt-2 text-sm text-gray-600">Tech.C Venture メンバー管理システム</p>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            ログインに失敗しました。<br />お使いのアカウントが Tech.C Venture に登録されていない可能性があります。
          </div>
        )}

        <button onClick={() => signIn("zitadel", { callbackUrl: "/" })} className="mt-8 w-full rounded-lg bg-indigo-600 py-3 text-base sm:text-lg font-semibold text-white hover:bg-indigo-700 transition">
          ZITADELでログイン
        </button>

        <p className="mt-6 text-xs text-gray-500">本システムは Tech.C Venture 関係者専用です</p>
      </div>
    </main>
  );
}
