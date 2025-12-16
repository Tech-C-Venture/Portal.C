/**
 * メンバー一覧ページ（Clean Architecture統合版）
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getMemberListAction } from '@/app/actions/members';
import { MemberList } from '@/components/members/MemberList';

export default async function MembersPage() {
  const members = await getMemberListAction();

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
