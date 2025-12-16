/**
 * EventMapper
 * EventエンティティとEventDTOの相互変換
 */

import { Event, getRemainingCapacity, isEventFull } from '@/domain/entities/Event';
import { EventDTO } from '../dtos/EventDTO';

export class EventMapper {
  static toDTO(event: Event): EventDTO {
    const remainingCapacity = getRemainingCapacity(event);

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      capacity: event.capacity.isUnlimited() ? 'unlimited' : event.capacity.value,
      participantCount: event.participantCount,
      remainingCapacity:
        remainingCapacity === Number.MAX_SAFE_INTEGER ? 'unlimited' : remainingCapacity,
      isFull: isEventFull(event),
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  static toDTOList(events: Event[]): EventDTO[] {
    return events.map((event) => this.toDTO(event));
  }
}
