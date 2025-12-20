/**
 * EventList コンポーネント
 * イベント一覧の表示（Client Component）
 */

'use client';

import { EventDTO } from '@/application/dtos';
import Link from 'next/link';

interface EventListProps {
  events: Array<EventDTO & { isRegistered?: boolean }>;
}

export function EventList({ events }: EventListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <p>📅 {new Date(event.startDate).toLocaleString('ja-JP')}</p>
            <p>📍 {event.location}</p>
            <p>
              👥 {event.participantCount} /{' '}
              {event.capacity === 'unlimited' ? '無制限' : event.capacity}名
            </p>
            {event.isFull && <p className="text-red-600 font-semibold">満員</p>}
          </div>
          <div className="mt-4 w-full">
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              詳細を見る
            </Link>
          </div>
        </div>
      ))}

      {events.length === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          現在、開催予定のイベントはありません
        </div>
      )}
    </div>
  );
}
