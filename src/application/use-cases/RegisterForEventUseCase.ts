/**
 * RegisterForEventUseCase
 * イベント参加登録ユースケース
 */

import { IEventRepository } from '../ports/IEventRepository';
import {
  isMemberRegistered,
  isEventFull,
  isSlotFull,
} from '@/domain/entities/Event';
import { Result, success, failure } from '../common/Result';

export class RegisterForEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(
    eventId: string,
    memberId: string,
    slotId?: string
  ): Promise<Result<void, string>> {
    // イベント存在確認
    const eventResult = await this.eventRepository.findById(eventId);
    if (!eventResult.success) {
      return failure(`Failed to fetch event: ${eventResult.error.message}`);
    }

    if (!eventResult.value) {
      return failure(`Event not found: ${eventId}`);
    }

    const event = eventResult.value;

    // ビジネスルール検証
    if (isMemberRegistered(event, memberId)) {
      return failure('Already registered for this event');
    }

    if (event.slots.length > 0) {
      if (!slotId) {
        return failure('Slot is required for this event');
      }
      if (!event.slots.some((slot) => slot.id === slotId)) {
        return failure('Slot not found');
      }
      if (isSlotFull(event, slotId)) {
        return failure('Selected slot is full');
      }
    } else if (isEventFull(event)) {
      return failure('Event is full');
    }

    // 参加登録（Firestore経由でトランザクション処理）
    const registerResult = await this.eventRepository.registerMember(
      eventId,
      memberId,
      slotId
    );

    if (!registerResult.success) {
      return failure(`Failed to register: ${registerResult.error.message}`);
    }

    return success(undefined);
  }
}
