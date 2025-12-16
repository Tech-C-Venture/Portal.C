/**
 * CreateEventUseCase
 * イベント作成ユースケース（管理者向け）
 */

import { IEventRepository } from '../ports/IEventRepository';
import { EventDTO } from '../dtos/EventDTO';
import { EventMapper } from '../mappers/EventMapper';
import { createEvent } from '@/domain/entities/Event';
import { Result, success, failure } from '../common/Result';

interface CreateEventInput {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity?: number;
  createdBy: string;
}

export class CreateEventUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(input: CreateEventInput): Promise<Result<EventDTO, string>> {
    try {
      // ドメインエンティティ作成
      const event = createEvent({
        id: crypto.randomUUID(),
        title: input.title,
        description: input.description,
        startDate: input.startDate,
        endDate: input.endDate,
        location: input.location,
        capacity: input.capacity,
        createdBy: input.createdBy,
      });

      // リポジトリに保存
      const result = await this.eventRepository.create(event);
      if (!result.success) {
        return failure(`Failed to create event: ${result.error.message}`);
      }

      return success(EventMapper.toDTO(result.value));
    } catch (error) {
      return failure(`Invalid event data: ${(error as Error).message}`);
    }
  }
}
