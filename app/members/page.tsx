/**
 * メンバー一覧ページ（Clean Architecture統合版）
 */

import { container } from '@/infrastructure/di/setup';
import { USE_CASE_KEYS } from '@/infrastructure/di/keys';
import { GetMemberProfileUseCase } from '@/application/use-cases';
import { IMemberRepository } from '@/application/ports';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import { MemberDTO } from '@/application/dtos';
import { MemberList } from '@/components/members/MemberList';

async function getMembers(): Promise<MemberDTO[]> {
  try {
    // DIコンテナからリポジトリを取得
    const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);

    // リポジトリから全メンバーを取得
    const result = await memberRepository.findAll();

    if (!result.success) {
      console.error('Failed to fetch members:', result.error);
      return [];
    }

    // エンティティをDTOに変換
    const { MemberMapper } = await import('@/application/mappers/MemberMapper');
    return MemberMapper.toDTOList(result.value);
  } catch (error) {
    console.error('Error fetching members:', error);
    return [];
  }
}

export default async function MembersPage() {
  const members = await getMembers();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">メンバー一覧</h1>
        <p className="text-gray-600">Tech.C Ventureのメンバー</p>
      </div>

      <MemberList members={members} />
    </div>
  );
}
