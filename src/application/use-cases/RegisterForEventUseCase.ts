/**
 * RegisterForEventUseCase
 * イベント参加登録ユースケース
 */

import { IEventRepository } from '../ports/IEventRepository';
import { Result, success, failure } from '../common/Result';

export class RegisterForEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(eventId: string, memberId: string): Promise<Result<void, string>> {
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
    if (event.participantIds.includes(memberId)) {
      return failure('Already registered for this event');
    }

    if (event.capacity.isFull(event.participantCount)) {
      return failure('Event is full');
    }

    // 参加登録（PostgreSQL関数経由でトランザクション処理）
    const registerResult = await this.eventRepository.registerMember(eventId, memberId);

    if (!registerResult.success) {
      return failure(`Failed to register: ${registerResult.error.message}`);
    }

    return success(undefined);
  }
}
