/**
 * Eventエンティティ
 * Tech.C Ventureのイベント情報を表現するドメインエンティティ
 */

import { EventCapacity } from '../value-objects/EventCapacity';

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
  readonly participantCount: number;
  readonly participantIds: readonly string[];
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
  participantIds?: string[];
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

  const participantIds = Object.freeze(params.participantIds ?? []);

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
    participantCount: participantIds.length,
    participantIds,
    createdBy: params.createdBy,
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
  };
}

/**
 * イベントが定員に達しているかをチェック
 */
export function isEventFull(event: Event): boolean {
  return event.capacity.isFull(event.participantCount);
}

/**
 * イベントの残り定員数を取得
 */
export function getRemainingCapacity(event: Event): number {
  return event.capacity.remainingSlots(event.participantCount);
}

/**
 * メンバーがイベントに参加済みかをチェック
 */
export function isMemberRegistered(event: Event, memberId: string): boolean {
  return event.participantIds.includes(memberId);
}

/**
 * イベントに参加者を追加する（イミュータブル更新）
 */
export function addParticipant(event: Event, memberId: string): Event {
  if (isMemberRegistered(event, memberId)) {
    throw new Error('Member is already registered for this event');
  }

  if (isEventFull(event)) {
    throw new Error('Event is full');
  }

  const newParticipantIds = Object.freeze([...event.participantIds, memberId]);

  return {
    ...event,
    participantIds: newParticipantIds,
    participantCount: newParticipantIds.length,
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

  const newParticipantIds = Object.freeze(
    event.participantIds.filter((id) => id !== memberId)
  );

  return {
    ...event,
    participantIds: newParticipantIds,
    participantCount: newParticipantIds.length,
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
