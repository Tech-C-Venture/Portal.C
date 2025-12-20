import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getAverageParticipationRate,
  getEventParticipants,
  getMembers,
  getAverageParticipants,
} from "@/app/admin/_data";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/events");
  }

  const [
    eventsWithParticipants,
    members,
    averageParticipationRate,
    averageParticipants,
  ] =
    await Promise.all([
      getEventParticipants(),
      getMembers(),
      getAverageParticipationRate(),
      getAverageParticipants(),
    ]);

  const now = new Date();
  const eventsThisMonth = eventsWithParticipants.filter(({ event }) => {
    const date = new Date(event.startDate);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold mb-2">管理画面</h1>
        <p className="text-gray-600">
          イベント・時間割・メンバーの実データをまとめて管理します。
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">総メンバー数</h3>
          <p className="text-3xl font-bold text-blue-600">{members.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">今月のイベント</h3>
          <p className="text-3xl font-bold text-green-600">
            {eventsThisMonth}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">平均参加率</h3>
          <p className="text-3xl font-bold text-purple-600">
            {averageParticipationRate === null
              ? "計測中"
              : `${averageParticipationRate}%`}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            平均参加者数:
            {averageParticipants === null
              ? " -"
              : ` ${averageParticipants}人`}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/events/create"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">イベント作成</h2>
          <p className="text-sm text-gray-600">
            新規イベントの登録・日程入力
          </p>
        </Link>
        <Link
          href="/admin/events/participants"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">登録イベント一覧</h2>
          <p className="text-sm text-gray-600">
            登録済みイベントの一覧
          </p>
        </Link>
        <Link
          href="/admin/timetables"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">時間割</h2>
          <p className="text-sm text-gray-600">
            時間割登録メンバーの確認
          </p>
        </Link>
        <Link
          href="/admin/hr"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">メンバーHR</h2>
          <p className="text-sm text-gray-600">
            基本情報・イベント参加数の確認
          </p>
        </Link>
      </div>
    </div>
  );
}
