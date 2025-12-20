import Link from 'next/link';
import { getEventParticipationStats } from '@/app/admin/_data';

export default async function AdminEventEditListPage() {
  const eventStats = await getEventParticipationStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">イベント編集</h1>
        <p className="text-gray-600">
          編集は各イベント詳細ページから行います。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">イベント一覧</h2>
          <span className="text-sm text-gray-500">
            {eventStats.length}件
          </span>
        </div>
        {eventStats.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだイベントが登録されていません。
          </p>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {eventStats.map((event) => (
              <div
                key={event.eventId}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-2">
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.eventDate).toLocaleString('ja-JP')}
                  </p>
                </div>
                <Link
                  href={`/admin/events/${event.eventId}/participants`}
                  className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  イベント詳細
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
