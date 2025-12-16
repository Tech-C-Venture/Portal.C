/**
 * Event Module Factory
 * イベント関連の依存性を登録
 */

import { Container } from '../container';
import { REPOSITORY_KEYS, USE_CASE_KEYS } from '../keys';
import { SupabaseEventRepository } from '../../repositories/SupabaseEventRepository';
import { GetEventListUseCase } from '@/application/use-cases/GetEventListUseCase';
import { RegisterForEventUseCase } from '@/application/use-cases/RegisterForEventUseCase';
import { CreateEventUseCase } from '@/application/use-cases/CreateEventUseCase';

export function eventModule(container: Container): Container {
  // Repository
  container.bindSingleton(
    REPOSITORY_KEYS.EVENT,
    () => new SupabaseEventRepository()
  );

  // Use Cases
  container.bind(
    USE_CASE_KEYS.GET_EVENT_LIST,
    () => new GetEventListUseCase(container.resolve(REPOSITORY_KEYS.EVENT))
  );

  container.bind(
    USE_CASE_KEYS.REGISTER_FOR_EVENT,
    () => new RegisterForEventUseCase(container.resolve(REPOSITORY_KEYS.EVENT))
  );

  container.bind(
    USE_CASE_KEYS.CREATE_EVENT,
    () => new CreateEventUseCase(container.resolve(REPOSITORY_KEYS.EVENT))
  );

  return container;
}
