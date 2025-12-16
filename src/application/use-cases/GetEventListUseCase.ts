/**
 * GetEventListUseCase
 * イベント一覧取得ユースケース
 */

import { IEventRepository } from '../ports/IEventRepository';
import { EventDTO } from '../dtos/EventDTO';
import { EventMapper } from '../mappers/EventMapper';
import { Result, success, failure } from '../common/Result';

export class GetEventListUseCase {
  constructor(private eventRepository: IEventRepository) {}

  async execute(): Promise<Result<EventDTO[], string>> {
    const result = await this.eventRepository.findAll();

    if (!result.success) {
      return failure(`Failed to fetch events: ${result.error.message}`);
    }

    return success(EventMapper.toDTOList(result.value));
  }
}
