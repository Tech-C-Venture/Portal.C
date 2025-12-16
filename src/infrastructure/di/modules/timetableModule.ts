/**
 * Timetable Module Factory
 * 時間割関連の依存性を登録
 */

import { Container } from '../container';
import { REPOSITORY_KEYS, USE_CASE_KEYS } from '../keys';
import { SupabaseTimetableRepository } from '../../repositories/SupabaseTimetableRepository';
import { GetTimetableUseCase } from '@/application/use-cases/GetTimetableUseCase';

export function timetableModule(container: Container): Container {
  // Repository
  container.bindSingleton(
    REPOSITORY_KEYS.TIMETABLE,
    () => new SupabaseTimetableRepository()
  );

  // Use Cases
  container.bind(
    USE_CASE_KEYS.GET_TIMETABLE,
    () => new GetTimetableUseCase(container.resolve(REPOSITORY_KEYS.TIMETABLE))
  );

  return container;
}
