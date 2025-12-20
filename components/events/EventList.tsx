/**
 * EventList コンポーネント
 * イベント一覧の表示（Client Component）
 */

'use client';

import { EventDTO } from '@/application/dtos';
import Link from 'next/link';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';

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
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">{event.title}</h2>
            {typeof event.isRegistered === "boolean" && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  event.isRegistered
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {event.isRegistered ? "参加済み" : "未参加"}
              </span>
            )}
          </div>
          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <p className="flex items-center gap-2">
              <FiCalendar className="h-4 w-4" aria-hidden />
              {new Date(event.startDate).toLocaleString('ja-JP')}
            </p>
            <p className="flex items-center gap-2">
              <FiMapPin className="h-4 w-4" aria-hidden />
              {event.location}
            </p>
            <p className="flex items-center gap-2">
              <FiUsers className="h-4 w-4" aria-hidden />
              {event.participantCount} /{' '}
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
