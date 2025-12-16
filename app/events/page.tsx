/**
 * イベント一覧ページ（Clean Architecture統合版）
 */

import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import { IEventRepository } from '@/application/ports';
import { EventDTO } from '@/application/dtos';
import { EventList } from '@/components/events/EventList';

async function getEvents(): Promise<EventDTO[]> {
  try {
    const eventRepository = container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
    const result = await eventRepository.findAll();

    if (!result.success) {
      console.error('Failed to fetch events:', result.error);
      return [];
    }

    const { EventMapper } = await import('@/application/mappers/EventMapper');
    return EventMapper.toDTOList(result.value);
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">イベント一覧</h1>
        <p className="text-gray-600">Tech.C Ventureのイベントに参加しよう</p>
      </div>

      <EventList events={events} />
    </div>
  );
}
