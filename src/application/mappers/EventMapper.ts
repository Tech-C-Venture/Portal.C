/**
 * EventMapper
 * EventエンティティとEventDTOの相互変換
 */

import {
  Event,
  isEventFull,
  isSlotFull,
  getSlotRemainingCapacity,
  getSlotParticipantsCount,
} from '@/domain/entities/Event';
import { EventDTO, EventSlotDTO } from '../dtos/EventDTO';

function formatCapacityValue(value: number): number | 'unlimited' {
  return value >= Number.MAX_SAFE_INTEGER ? 'unlimited' : value;
}

function mapSlotToDTO(event: Event, slot: Event['slots'][number]): EventSlotDTO {
  const count = getSlotParticipantsCount(event, slot.id);
  const remaining = getSlotRemainingCapacity(event, slot.id);

  return {
    id: slot.id,
    name: slot.name,
    capacity: slot.capacity.isUnlimited() ? 'unlimited' : slot.capacity.value,
    participantCount: count,
    remainingCapacity:
      remaining >= Number.MAX_SAFE_INTEGER ? 'unlimited' : remaining,
    isFull: isSlotFull(event, slot.id),
  };
}

function getEventSlotTotalCapacity(event: Event): number | 'unlimited' {
  if (event.slots.some((slot) => slot.capacity.isUnlimited())) {
    return 'unlimited';
  }
  return event.slots.reduce((sum, slot) => sum + slot.capacity.value, 0);
}

function getEventSlotRemainingCapacity(event: Event): number | 'unlimited' {
  if (event.slots.some((slot) => slot.capacity.isUnlimited())) {
    return 'unlimited';
  }
  return event.slots.reduce(
    (sum, slot) =>
      sum + slot.capacity.remainingSlots(getSlotParticipantsCount(event, slot.id)),
    0
  );
}

export class EventMapper {
  static toDTO(event: Event): EventDTO {
    const hasSlots = event.slots.length > 0;

    const capacity: number | 'unlimited' = hasSlots
      ? getEventSlotTotalCapacity(event)
      : event.capacity.isUnlimited()
        ? 'unlimited'
        : event.capacity.value;

    const remainingCapacity: number | 'unlimited' = hasSlots
      ? getEventSlotRemainingCapacity(event)
      : formatCapacityValue(event.capacity.remainingSlots(event.participantCount));

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      location: event.location,
      onlineUrl: event.onlineUrl,
      onlinePassword: event.onlinePassword,
      capacity,
      slots: event.slots.map((slot) => mapSlotToDTO(event, slot)),
      participantCount: event.participantCount,
      remainingCapacity,
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
