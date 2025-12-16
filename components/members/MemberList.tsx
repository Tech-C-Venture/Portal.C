/**
 * MemberList コンポーネント
 * メンバー一覧の表示（Client Component）
 */

'use client';

import { useState } from 'react';
import { MemberDTO } from '@/application/dtos';
import { MemberCard } from './MemberCard';

interface MemberListProps {
  members: MemberDTO[];
}

export function MemberList({ members }: MemberListProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // 検索フィルター
  const filteredMembers = members.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(query) ||
      member.department.toLowerCase().includes(query) ||
      member.skills.some((skill) => skill.toLowerCase().includes(query)) ||
      member.interests.some((interest) => interest.toLowerCase().includes(query))
    );
  });

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          placeholder="スキルや興味で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          検索条件に一致するメンバーが見つかりませんでした
        </div>
      )}
    </>
  );
}
