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
          className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-[0_16px_42px_rgba(42,97,179,0.14)] transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2 text-foreground">{event.title}</h2>
          <p className="text-muted mb-4">{event.description}</p>
          <div className="space-y-2 text-sm text-muted2 mb-4">
            <p>📅 {new Date(event.startDate).toLocaleString('ja-JP')}</p>
            <p>📍 {event.location}</p>
            <p>
              👥 {event.participantCount} /{' '}
              {event.capacity === 'unlimited' ? '無制限' : event.capacity}名
            </p>
            {event.isFull && <p className="inline-flex items-center rounded-lg bg-[#b7e0e4]/50 px-2 py-1 text-sm font-semibold text-foreground">満員</p>}
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
        <div className="col-span-full text-center py-12 text-muted">
          現在、開催予定のイベントはありません
        </div>
      )}
    </div>
  );
}
