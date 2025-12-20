/* eslint-disable no-restricted-imports */

import Link from "next/link";
import { FiMapPin, FiMessageCircle, FiUsers } from "react-icons/fi";
import { container } from "@/infrastructure/di/setup";
import { REPOSITORY_KEYS } from "@/infrastructure/di/keys";
import type { IEventRepository } from "@/application/ports";
import type { IMemberRepository } from "@/application/ports/IMemberRepository";
import { hasValidStatus } from "@/domain/entities/Member";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardEvent = {
  id: string;
  title: string;
  startDate: Date;
  location: string;
  capacityLabel: string;
  participantCount: number;
  isRegistered: boolean;
};

type DashboardStatus = {
  id: string;
  name: string;
  department: string;
  message: string;
  expiresAt: Date;
};

async function getDashboardData(memberId: string | null) {
  const eventRepository = container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
  const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);

  const [eventsResult, membersResult] = await Promise.all([
    eventRepository.findAll(),
    memberRepository.findAll(),
  ]);

  if (!eventsResult.success) {
    console.error("Failed to fetch events:", eventsResult.error);
  }
  if (!membersResult.success) {
    console.error("Failed to fetch members:", membersResult.error);
  }

  const events = eventsResult.success ? eventsResult.value : [];
  const members = membersResult.success ? membersResult.value : [];
  const now = new Date();

  const upcomingEvents = events
    .filter((event) => event.startDate >= now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const dashboardEvents: DashboardEvent[] = upcomingEvents.slice(0, 3).map((event) => ({
    id: event.id,
    title: event.title,
    startDate: event.startDate,
    location: event.location || "未設定",
    capacityLabel: event.capacity.isUnlimited() ? "無制限" : `${event.capacity.value}名`,
    participantCount: event.participantCount,
    isRegistered: memberId ? event.participantIds.includes(memberId) : false,
  }));

  const statusItems: DashboardStatus[] = members
    .filter((member) => hasValidStatus(member, now) && member.currentStatus)
    .sort((a, b) => {
      const aTime = a.currentStatus?.createdAt.getTime() ?? 0;
      const bTime = b.currentStatus?.createdAt.getTime() ?? 0;
      return bTime - aTime;
    })
    .slice(0, 4)
    .map((member) => ({
      id: member.id,
      name: member.name,
      department: member.department,
      message: member.currentStatus?.message ?? "",
      expiresAt: member.currentStatus?.expiresAt ?? now,
    }));

  const activeStatusCount = members.filter((member) => hasValidStatus(member, now)).length;
  const nextEvent = upcomingEvents[0];

  return {
    dashboardEvents,
    statusItems,
    totalMembers: members.length,
    upcomingEventCount: upcomingEvents.length,
    activeStatusCount,
    nextEvent,
  };
}

export default async function Home() {
  const resolvedUser = await getCurrentUser();
  const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
  const memberResult = resolvedUser?.id
    ? await memberRepository.findByZitadelId(resolvedUser.id)
    : null;
  const memberId = memberResult?.success && memberResult.value ? memberResult.value.id : null;
  const resolvedDashboard = await getDashboardData(memberId);
  const nextEventDate = resolvedDashboard.nextEvent?.startDate;

  const formattedDate = (date: Date) =>
    date.toLocaleString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-gray-500">Tech.C Venture</p>
            <h1 className="text-3xl font-bold text-gray-900">
              {resolvedUser?.name ? `ようこそ、${resolvedUser.name}さん` : "ダッシュボード"}
            </h1>
            <p className="mt-2 text-gray-600">
              イベント、メンバー、ステータスをまとめて確認できます。
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm text-gray-700">
            <p className="font-semibold text-gray-900">次のイベント</p>
            <p className="mt-1">
              {nextEventDate ? formattedDate(nextEventDate) : "予定されていません"}
            </p>
            {resolvedDashboard.nextEvent && (
              <p className="mt-1 text-gray-500">{resolvedDashboard.nextEvent.title}</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">メンバー数</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {resolvedDashboard.totalMembers}名
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">開催予定イベント</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {resolvedDashboard.upcomingEventCount}件
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">アクティブステータス</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {resolvedDashboard.activeStatusCount}件
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">すぐ行ける場所</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <Link
              href="/events"
              className="rounded-full bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
            >
              イベント
            </Link>
            <Link
              href="/members"
              className="rounded-full bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
            >
              メンバー
            </Link>
            <Link
              href="/timetable"
              className="rounded-full bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
            >
              時間割
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">近日のイベント</h2>
            <Link href="/events" className="text-sm text-blue-600 hover:text-blue-700">
              一覧を見る
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {resolvedDashboard.dashboardEvents.length === 0 ? (
              <p className="text-sm text-gray-500">
                直近のイベント予定はありません。
              </p>
            ) : (
              resolvedDashboard.dashboardEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-gray-500">
                        {formattedDate(event.startDate)}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-semibold text-gray-900">
                          {event.title}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            event.isRegistered
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {event.isRegistered ? "参加済み" : "未参加"}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      詳細
                    </Link>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="inline-flex items-center gap-1">
                      <FiMapPin className="h-4 w-4" aria-hidden />
                      {event.location}
                    </span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="inline-flex items-center gap-1">
                      <FiUsers className="h-4 w-4" aria-hidden />
                      {event.participantCount} / {event.capacityLabel}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">最新ステータス</h2>
            <Link href="/members" className="text-sm text-blue-600 hover:text-blue-700">
              メンバーを見る
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {resolvedDashboard.statusItems.length === 0 ? (
              <p className="text-sm text-gray-500">
                いま更新されているステータスはありません。
              </p>
            ) : (
              resolvedDashboard.statusItems.map((status) => (
                <div
                  key={status.id}
                  className="rounded-xl border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {status.name}
                      </p>
                      <p className="text-xs text-gray-500">{status.department}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {formattedDate(status.expiresAt)}まで
                    </p>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                    <FiMessageCircle className="h-4 w-4" aria-hidden />
                    {status.message}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
