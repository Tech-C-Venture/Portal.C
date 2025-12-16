/**
 * ITimetableRepository
 * 時間割リポジトリのポートインターフェース
 */

import { Timetable } from '@/domain/entities/Timetable';
import { Result } from '../common/Result';

export interface ITimetableRepository {
  findById(id: string): Promise<Result<Timetable | null>>;
  findByMemberId(memberId: string): Promise<Result<Timetable | null>>;
  create(timetable: Timetable): Promise<Result<Timetable>>;
  update(timetable: Timetable): Promise<Result<Timetable>>;
  delete(id: string): Promise<Result<void>>;
}
