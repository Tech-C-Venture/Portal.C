/**
 * イベント一覧ページ（Clean Architecture統合版）
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* eslint-disable no-restricted-imports */
import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import { IEventRepository } from '@/application/ports';
import { EventDTO } from '@/application/dtos';
import { EventList } from '@/components/events/EventList';
import { getCurrentUser } from '@/lib/auth';
import { IMemberRepository } from '@/application/ports/IMemberRepository';
import { Event } from '@/domain/entities/Event';

async function getCurrentMemberId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return null;
  }
  const memberRepository = container.resolve<IMemberRepository>(
    REPOSITORY_KEYS.MEMBER
  );
  const result = await memberRepository.findByZitadelId(user.id);
  if (!result.success || !result.value) {
    return null;
  }
  return result.value.id;
}

async function getEvents(): Promise<
  Array<EventDTO & { isRegistered?: boolean }>
> {
  try {
    const eventRepository = container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
    const result = await eventRepository.findAll();

    if (!result.success) {
      console.error('Failed to fetch events:', result.error);
      return [];
    }

    const memberId = await getCurrentMemberId();
    const { EventMapper } = await import('@/application/mappers/EventMapper');
    const dtoList = EventMapper.toDTOList(result.value);
    const eventMap = new Map<string, Event>();
    result.value.forEach((event) => eventMap.set(event.id, event));

    return dtoList.map((dto) => {
      const event = eventMap.get(dto.id);
      const isRegistered = memberId
        ? event?.participantIds.includes(memberId)
        : false;
      return { ...dto, isRegistered };
    });
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
