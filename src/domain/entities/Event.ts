/**
 * Eventエンティティ
 * Tech.C Ventureのイベント情報を表現するドメインエンティティ
 */

import { EventCapacity } from '../value-objects/EventCapacity';
import { EventSlot, createEventSlot } from '../value-objects/EventSlot';

export interface EventParticipant {
  readonly memberId: string;
  readonly slotId?: string;
}

export interface Event {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly startDate: Date;
  readonly endDate: Date;
  readonly location: string;
  readonly onlineUrl?: string;
  readonly onlinePassword?: string;
  readonly capacity: EventCapacity;
  readonly slots: readonly EventSlot[];
  readonly participants: readonly EventParticipant[];
  readonly participantIds: readonly string[];
  readonly participantCount: number;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Eventエンティティのファクトリー関数
 */
export function createEvent(params: {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  onlineUrl?: string | null;
  onlinePassword?: string | null;
  capacity?: number;
  slots?: Array<{ id: string; name: string; capacity?: number | null }>;
  participantIds?: string[];
  participants?: Array<{ memberId: string; slotId?: string }>;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}): Event {
  // 日時のバリデーション
  if (params.startDate >= params.endDate) {
    throw new Error('Start date must be before end date');
  }

  const capacity = params.capacity
    ? EventCapacity.create(params.capacity)
    : EventCapacity.unlimited();

  const slots = params.slots
    ? Object.freeze(params.slots.map((slot) => createEventSlot(slot)))
    : Object.freeze([]);

  const participants = Object.freeze(
    params.participants
      ? params.participants.map((p) => ({ memberId: p.memberId, slotId: p.slotId }))
      : (params.participantIds ?? []).map((memberId) => ({ memberId }))
  );

  const participantIds = Object.freeze(
    participants.map((p) => p.memberId)
  );

  return {
    id: params.id,
    title: params.title,
    description: params.description,
    startDate: params.startDate,
    endDate: params.endDate,
    location: params.location,
    onlineUrl: params.onlineUrl ?? undefined,
    onlinePassword: params.onlinePassword ?? undefined,
    capacity,
    slots,
    participants,
    participantIds,
    participantCount: participants.length,
    createdBy: params.createdBy,
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
  };
}

function getSlotParticipantCount(event: Event, slotId: string): number {
  return event.participants.filter((p) => p.slotId === slotId).length;
}

/**
 * 指定した枠の参加者数を取得
 */
export function getSlotParticipantsCount(event: Event, slotId: string): number {
  return getSlotParticipantCount(event, slotId);
}

/**
 * 指定した枠の残り定員数を取得
 */
export function getSlotRemainingCapacity(
  event: Event,
  slotId: string
): number {
  const slot = event.slots.find((s) => s.id === slotId);
  if (!slot) return 0;
  return slot.capacity.remainingSlots(getSlotParticipantCount(event, slotId));
}

/**
 * 指定した枠が満員かをチェック
 */
export function isSlotFull(event: Event, slotId: string): boolean {
  const slot = event.slots.find((s) => s.id === slotId);
  if (!slot) return true;
  return slot.capacity.isFull(getSlotParticipantCount(event, slotId));
}

/**
 * イベントが定員に達しているかをチェック
 */
export function isEventFull(event: Event): boolean {
  if (event.slots.length > 0) {
    return event.slots.every((slot) =>
      slot.capacity.isFull(getSlotParticipantCount(event, slot.id))
    );
  }
  return event.capacity.isFull(event.participantCount);
}

/**
 * イベントの残り定員数を取得
 */
export function getRemainingCapacity(event: Event): number {
  if (event.slots.length > 0) {
    return event.slots.reduce(
      (sum, slot) => sum + slot.capacity.remainingSlots(getSlotParticipantCount(event, slot.id)),
      0
    );
  }
  return event.capacity.remainingSlots(event.participantCount);
}

/**
 * メンバーがイベントに参加済みかをチェック
 */
export function isMemberRegistered(event: Event, memberId: string): boolean {
  return event.participantIds.includes(memberId);
}

/**
 * メンバーが参加している枠IDを取得
 */
export function getMemberSlotId(event: Event, memberId: string): string | undefined {
  return event.participants.find((p) => p.memberId === memberId)?.slotId;
}

/**
 * イベントに参加者を追加する（イミュータブル更新）
 */
export function addParticipant(
  event: Event,
  memberId: string,
  slotId?: string
): Event {
  if (isMemberRegistered(event, memberId)) {
    throw new Error('Member is already registered for this event');
  }

  if (event.slots.length > 0) {
    if (!slotId) {
      throw new Error('Slot is required for this event');
    }
    if (!event.slots.some((s) => s.id === slotId)) {
      throw new Error('Slot not found');
    }
    if (isSlotFull(event, slotId)) {
      throw new Error('Selected slot is full');
    }
  } else if (isEventFull(event)) {
    throw new Error('Event is full');
  }

  const newParticipants = Object.freeze([
    ...event.participants,
    { memberId, slotId },
  ]);

  return {
    ...event,
    participants: newParticipants,
    participantIds: Object.freeze(newParticipants.map((p) => p.memberId)),
    participantCount: newParticipants.length,
    updatedAt: new Date(),
  };
}

/**
 * イベントから参加者を削除する（イミュータブル更新）
 */
export function removeParticipant(event: Event, memberId: string): Event {
  if (!isMemberRegistered(event, memberId)) {
    throw new Error('Member is not registered for this event');
  }

  const newParticipants = Object.freeze(
    event.participants.filter((p) => p.memberId !== memberId)
  );

  return {
    ...event,
    participants: newParticipants,
    participantIds: Object.freeze(newParticipants.map((p) => p.memberId)),
    participantCount: newParticipants.length,
    updatedAt: new Date(),
  };
}

/**
 * Eventエンティティを更新する（イミュータブル更新）
 */
export function updateEvent(
  event: Event,
  updates: Partial<
    Pick<Event, 'title' | 'description' | 'startDate' | 'endDate' | 'location'>
  >
): Event {
  const updated = { ...event, ...updates, updatedAt: new Date() };

  // 日時のバリデーション
  if (updated.startDate >= updated.endDate) {
    throw new Error('Start date must be before end date');
  }

  return updated;
}
