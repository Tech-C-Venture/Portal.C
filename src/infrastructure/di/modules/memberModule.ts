/**
 * Member Module Factory
 * メンバー関連の依存性を登録
 */

import { Container } from '../container';
import { REPOSITORY_KEYS, USE_CASE_KEYS } from '../keys';
import { SupabaseMemberRepository } from '../../repositories/SupabaseMemberRepository';
import { MockMemberRepository } from '../../repositories/MockMemberRepository';
import { GetMemberProfileUseCase } from '@/application/use-cases/GetMemberProfileUseCase';
import { UpdateMemberProfileUseCase } from '@/application/use-cases/UpdateMemberProfileUseCase';

export function memberModule(container: Container): Container {
  // Repository - 環境変数に基づいてモックまたは実装を選択
  const useMockData = process.env.USE_MOCK_DATA === 'true';

  container.bindSingleton(
    REPOSITORY_KEYS.MEMBER,
    () => useMockData ? new MockMemberRepository() : new SupabaseMemberRepository()
  );

  // Use Cases
  container.bind(
    USE_CASE_KEYS.GET_MEMBER_PROFILE,
    () => new GetMemberProfileUseCase(container.resolve(REPOSITORY_KEYS.MEMBER))
  );

  container.bind(
    USE_CASE_KEYS.UPDATE_MEMBER_PROFILE,
    () => new UpdateMemberProfileUseCase(container.resolve(REPOSITORY_KEYS.MEMBER))
  );

  return container;
}
