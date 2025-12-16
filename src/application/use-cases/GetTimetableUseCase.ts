/**
 * GetTimetableUseCase
 * 時間割取得ユースケース
 */

import { ITimetableRepository } from '../ports/ITimetableRepository';
import { TimetableDTO } from '../dtos/TimetableDTO';
import { TimetableMapper } from '../mappers/TimetableMapper';
import { Result, success, failure } from '../common/Result';

export class GetTimetableUseCase {
  constructor(private timetableRepository: ITimetableRepository) {}

  async execute(memberId: string): Promise<Result<TimetableDTO | null, string>> {
    const result = await this.timetableRepository.findByMemberId(memberId);

    if (!result.success) {
      return failure(`Failed to fetch timetable: ${result.error.message}`);
    }

    if (!result.value) {
      return success(null);
    }

    return success(TimetableMapper.toDTO(result.value));
  }
}
