/**
 * トップページ（ダッシュボード）
 * - 挨拶 + 次のイベント
 * - サマリー（メンバー数 / 開催予定イベント / アクティブステータス / すぐ行ける場所）
 * - 近日のイベント
 * - 最新ステータス
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* eslint-disable no-restricted-imports */
import Link from "next/link";
import { container } from "@/infrastructure/di/setup";
import { REPOSITORY_KEYS } from "@/infrastructure/di/keys";
import type { IEventRepository } from "@/application/ports";
import type { EventDTO } from "@/application/dtos";
import { FiMapPin } from "react-icons/fi";

async function getEvents(): Promise<EventDTO[]> {
    try {
        const eventRepository = container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
        const result = await eventRepository.findAll();

        if (!result.success) {
            console.error("Failed to fetch events:", result.error);
            return [];
        }

        const { EventMapper } = await import("@/application/mappers/EventMapper");
        return EventMapper.toDTOList(result.value);
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

function formatDateTime(date: Date) {
    return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default async function Home() {
    const events = await getEvents();
    const now = new Date();

    // 開催予定（startDate が未来）
    const upcomingEvents = (events ?? [])
        .filter((e) => new Date(e.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const nextEvent = upcomingEvents[0] ?? null;

    // 受付中（既存ロジック流用）：isFull === false かつ endDate >= now（開始日ソート）
    const openEvents = (events ?? [])
        .filter((e) => !e.isFull && new Date(e.endDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // 近日のイベント：ひとまず「開催予定」を優先、無ければ「受付中」から表示
    const recentEvent = nextEvent ?? openEvents[0] ?? null;

    // ---- ここは後で差し替え想定のプレースホルダー ----
    const userName = "ユーザー"; // TODO: 認証のユーザー名に差し替え
    const majorName = "専攻名";  // TODO: メンバー情報の専攻に差し替え
    const memberCount = "—";     // TODO: メンバー数に差し替え
    const activeStatusCount = "—"; // TODO: ステータス件数に差し替え

    // 最新ステータス（プレースホルダー）
    const latestStatuses: Array<{
        id: string;
        name: string;
        major?: string;
        message: string;
        until: Date;
    }> = [
        // TODO: DBのステータス一覧に差し替え
        // { id: "1", name: "山田 太郎", major: "情報", message: "開発中", until: new Date() },
    ];
    // ---------------------------------------------

    return (
        <div className="space-y-8">
            {/* 挨拶 + 次のイベント */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid gap-6 md:grid-cols-[1fr_320px] md:items-start">
                    <div>
                        <p className="text-sm text-gray-500">Tech.C Venture</p>

                        <div className="mt-1 flex flex-wrap items-end gap-x-3 gap-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                ようこそ、{userName}さん
                            </h1>
                            <span className="inline-flex items-center rounded-full bg-blue-600 px-2.5 py-1 text-xs font-semibold text-white">
                {majorName}
              </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600">
                            イベント、メンバー、ステータスをまとめて確認できます。
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-sm font-semibold text-gray-900">次のイベント</p>
                        <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-700">
                                {nextEvent ? formatDateTime(new Date(nextEvent.startDate)) : "予定はありません"}
                            </p>
                            <p className="text-sm font-semibold text-gray-900">
                                {nextEvent?.title ?? ""}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* サマリー */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">メンバー数</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{memberCount}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">開催予定イベント</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{upcomingEvents.length}件</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">アクティブステータス</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{activeStatusCount}</p>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">すぐ行ける場所</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-sm">
                        <Link
                            href="/events"
                            className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white hover:opacity-90"
                        >
                            イベント
                        </Link>
                        <Link
                            href="/members"
                            className="rounded-full bg-gray-100 px-4 py-2 font-semibold text-gray-900 hover:bg-gray-200"
                        >
                            メンバー
                        </Link>
                        <Link
                            href="/timetable"
                            className="rounded-full bg-gray-100 px-4 py-2 font-semibold text-gray-900 hover:bg-gray-200"
                        >
                            時間割
                        </Link>
                    </div>
                </div>
            </section>

            {/* 下段（近日のイベント / 最新ステータス） */}
            <section className="grid gap-6 lg:grid-cols-2">
                {/* 近日のイベント */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-900">近日のイベント</h2>
                        <Link href="/events" className="text-sm font-semibold text-blue-700 hover:underline">
                            一覧を見る
                        </Link>
                    </div>

                    <div className="mt-4">
                        {!recentEvent ? (
                            <p className="text-sm text-gray-600">直近のイベント予定はありません。</p>
                        ) : (
                            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            {formatDateTime(new Date(recentEvent.startDate))}
                                        </p>
                                        <p className="mt-1 text-base font-bold text-gray-900">
                                            {recentEvent.title}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                                            <span className="inline-flex items-center gap-1">
                                                <FiMapPin className="h-4 w-4" aria-hidden />
                                                {"location" in recentEvent && (recentEvent as any).location ? (
                                                    <span>{(recentEvent as any).location}</span>
                                                ) : (
                                                    <span>未設定</span>
                                                )}
                                            </span>
                                            <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                                                {recentEvent.isFull ? "満員" : "受付中"}
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        href={"/events"}
                                        className="text-sm font-semibold text-blue-700 hover:underline"
                                    >
                                        詳細
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 最新ステータス */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-gray-900">最新ステータス</h2>
                        <Link href="/members" className="text-sm font-semibold text-blue-700 hover:underline">
                            メンバーを見る
                        </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                        {latestStatuses.length === 0 ? (
                            <p className="text-sm text-gray-600">いま更新されているステータスはありません。</p>
                        ) : (
                            latestStatuses.map((s) => (
                                <div key={s.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-sm font-bold text-gray-900">{s.name}</p>
                                                {s.major && (
                                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-800">
                            {s.major}
                          </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-sm text-gray-700">💬 {s.message}</p>
                                        </div>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatDateTime(s.until)} まで
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
