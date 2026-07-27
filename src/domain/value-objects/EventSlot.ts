/**
 * EventSlot 値オブジェクト
 * イベント内の申込枠（例：LT枠）を表現する
 */

import { EventCapacity } from './EventCapacity';

export interface EventSlot {
  readonly id: string;
  readonly name: string;
  readonly capacity: EventCapacity;
}

export function createEventSlot(params: {
  id: string;
  name: string;
  capacity?: number | null;
}): EventSlot {
  const name = params.name.trim();
  if (!name) {
    throw new Error('Slot name is required');
  }

  const capacity =
    params.capacity == null ? EventCapacity.unlimited() : EventCapacity.create(params.capacity);

  return {
    id: params.id,
    name,
    capacity,
  };
}
