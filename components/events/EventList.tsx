/**
 * EventList コンポーネント
 * イベント一覧の表示（Client Component）
 */

'use client';

import { EventDTO } from '@/application/dtos';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';

interface EventListProps {
  events: EventDTO[];
}

export function EventList({ events }: EventListProps) {
  const handleRegister = async (eventId: string) => {
    // TODO: Server Actionを実装
    console.log('Register for event:', eventId);
    alert('イベント参加機能は実装中です');
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
          <p className="text-gray-600 mb-4">{event.description}</p>
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
            <Button
              size="medium"
              variant="contained"
              onClick={() => handleRegister(event.id)}
              disabled={event.isFull}
            >
              {event.isFull ? '満員' : '参加する'}
            </Button>
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
