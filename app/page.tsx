/**
 * トップページ（ダッシュボード）
 * - 挨拶 + 次のイベント
 * - サマリー（メンバー数 / 開催予定イベント / アクティブステータス / すぐ行ける場所）
 * - 近日のイベント
 * - 最新ステータス
 * - 今日の時間割（ログインユーザーの専攻/学年）
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* eslint-disable no-restricted-imports */
import Link from "next/link";
import { container } from "@/infrastructure/di/setup";
import { REPOSITORY_KEYS } from "@/infrastructure/di/keys";
import type { IEventRepository, IMemberRepository } from "@/application/ports";
import type { EventDTO } from "@/application/dtos";
import type { Event } from "@/domain/entities/Event";
import { isMemberRegistered } from "@/domain/entities/Event";
import { getCurrentUser } from "@/lib/auth";
import { hasValidStatus, calculateGrade } from "@/domain/entities/Member";
import { DatabaseClient } from "@/infrastructure/database/DatabaseClient";
import { FiMapPin, FiUsers, FiMessageCircle } from "react-icons/fi";

async function getEvents(): Promise<Event[]> {
    try {
        const eventRepository = container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
        const result = await eventRepository.findAll();

        if (!result.success) {
            console.error("Failed to fetch events:", result.error);
            return [];
        }

        return result.value;
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
        hour12: false,
    });
}

type TimetableRow = {
    id: string;
    day_of_week: number;
    period: number;
    course_name: string;
    classroom: string | null;
    instructor: string | null;
};

async function getTodayTimetableRows(params: { major: string; grade: number; baseDate: Date }) {
    const { major, grade, baseDate } = params;

    // 日曜(0)/土曜(6)は基本表示なし（必要なら後で変更できます）
    const dayOfWeek = baseDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return [];

    try {
        const supabase = await DatabaseClient.getServerClient();

        const { data, error } = await supabase
            .from("timetables")
            .select("id, day_of_week, period, course_name, classroom, instructor")
            .eq("major", major)
            .eq("grade", grade)
            .eq("is_public", true)
            .eq("day_of_week", dayOfWeek)
            .order("period", { ascending: true });

        if (error) {
            console.error("Failed to fetch timetables:", error);
            return [];
        }

        return ((data ?? []) as TimetableRow[]).filter((r) => typeof r.period === "number");
    } catch (e) {
        console.error("Error fetching timetables:", e);
        return [];
    }
}

export default async function Home() {
    const now = new Date();

    const timetableDateLabel = now.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    });


    const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);

    const [events, currentUser, membersResult] = await Promise.all([
        getEvents(),
        getCurrentUser(),
        memberRepository.findAll(),
    ]);

    const members = membersResult.success ? membersResult.value : [];

    const currentMemberResult = currentUser
        ? await memberRepository.findByZitadelId(currentUser.id)
        : { success: false as const, value: null as any };

    const currentMember = currentMemberResult.success ? currentMemberResult.value : null;
    const currentMemberId = currentMember?.id ?? null;

    const { EventMapper } = await import("@/application/mappers/EventMapper");
    const eventDtos = EventMapper.toDTOList(events);
    const eventsById = new Map(events.map((event) => [event.id, event]));
    const eventsWithRegistration: Array<EventDTO & { isRegistered?: boolean }> = eventDtos.map((eventDto) => {
        if (!currentMemberId) {
            return eventDto;
        }

        const sourceEvent = eventsById.get(eventDto.id);
        const isRegistered = sourceEvent ? isMemberRegistered(sourceEvent, currentMemberId) : false;
        return { ...eventDto, isRegistered };
    });

    // 開催予定（startDate が未来）
    const upcomingEvents = (eventsWithRegistration ?? [])
        .filter((e) => new Date(e.startDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    const nextEvent = upcomingEvents[0] ?? null;

    // 受付中（既存ロジック流用）：isFull === false かつ endDate >= now（開始日ソート）
    const openEvents = (eventsWithRegistration ?? [])
        .filter((e) => !e.isFull && new Date(e.endDate) >= now)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    // 近日のイベント：ひとまず「開催予定」を優先、無ければ「受付中」から表示(最大3件)
    const recentEvents = [
        ...upcomingEvents,
        ...openEvents.filter((o) => !upcomingEvents.some((u) => u.id === o.id)),
    ].slice(0, 3);

    // ダッシュボード表示用（実データ）
    const userName = currentUser?.name ?? "ユーザー";
    const majorName = currentMember?.department ?? "—";
    const memberCount = membersResult.success ? `${members.length}名` : "—";
    const activeStatusMembers = members.filter((m) => hasValidStatus(m, now));
    const activeStatusCount = membersResult.success ? `${activeStatusMembers.length}件` : "—";

    const latestStatuses = activeStatusMembers
        .sort((a, b) => {
            const aTime = a.currentStatus?.createdAt?.getTime?.() ?? 0;
            const bTime = b.currentStatus?.createdAt?.getTime?.() ?? 0;
            return bTime - aTime;
        })
        .slice(0, 3)
        .map((m) => ({
            id: m.id,
            name: m.name,
            major: m.department,
            message: m.currentStatus?.message ?? "",
            until: m.currentStatus?.expiresAt ?? now,
        }));

    const todayTimetable =
        currentMember && majorName !== "—"
            ? await getTodayTimetableRows({
                major: currentMember.department,
                grade: calculateGrade(currentMember, now),
                baseDate: now,
            })
            : [];

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
                            <p className="text-sm font-semibold text-gray-900">{nextEvent?.title ?? ""}</p>
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
                        {recentEvents.length === 0 ? (
                            <p className="text-sm text-gray-600">直近のイベント予定はありません。</p>
                            ) : (
                            <div className="space-y-3">
                                {recentEvents.map((e) => (
                                    <div key={e.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">{formatDateTime(new Date(e.startDate))}</p>
                                                <p className="mt-1 text-base font-bold text-gray-900">{e.title}</p>
                                                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    <span className="inline-flex items-center gap-1">
                                                      <FiMapPin className="h-4 w-4" aria-hidden />
                                                        {e.location || "未設定"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <FiUsers className="h-4 w-4" aria-hidden />
                                                        {e.participantCount} /{" "}
                                                        {e.capacity === "unlimited" ? "無制限" : `${e.capacity}名`}
                                                    </span>
                                                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                                                        {e.isFull ? "満員" : "受付中"}
                                                    </span>
                                                    {typeof e.isRegistered === "boolean" && (
                                                        <span
                                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                                e.isRegistered
                                                                    ? "bg-emerald-100 text-emerald-800"
                                                                    : "bg-gray-200 text-gray-700"
                                                            }`}
                                                        >
                                                            {e.isRegistered ? "参加済み" : "未参加"}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <Link href={`/events/${e.id}`} className="text-sm font-semibold text-blue-700 hover:underline">
                                                詳細
                                            </Link>
                                        </div>
                                    </div>
                                ))}
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

                                            {/* 💬 → react-icons に置換 */}
                                            <p className="mt-2 text-sm text-gray-700 inline-flex items-center gap-1">
                                                <FiMessageCircle className="h-4 w-4" aria-hidden />
                                                {s.message}
                                            </p>
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

            {/* 今日の時間割 */}
            <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-gray-900">今日の時間割</h2>

                    <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-500">{timetableDateLabel}</p>
                        <Link href="/timetable" className="text-sm font-semibold text-blue-700 hover:underline">
                            時間割を見る
                        </Link>
                    </div>
                </div>

                <div className="mt-4">
                    {!currentMember ? (
                        <p className="text-sm text-gray-600">ログイン情報を取得できませんでした。</p>
                    ) : todayTimetable.length === 0 ? (
                        <p className="text-sm text-gray-600">今日の時間割は登録されていません。</p>
                    ) : (
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {todayTimetable.map((t) => (
                                <div key={t.id} className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                                    <p className="text-sm font-semibold text-gray-900">{t.period}限</p>
                                    <p className="mt-1 text-sm text-gray-700">{t.course_name}</p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        {[t.instructor, t.classroom].filter(Boolean).join(" / ") || "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
