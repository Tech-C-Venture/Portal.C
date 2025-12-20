/**
 * MemberCard コンポーネント
 * メンバー情報カードの表示
 */

'use client';

import { MemberDTO } from '@/application/dtos';

interface MemberCardProps {
  member: MemberDTO;
}

export function MemberCard({ member }: MemberCardProps) {
  // ステータスが有効かチェック（24時間以内）
  const isStatusValid = member.currentStatus
    ? new Date(member.currentStatus.expiresAt) > new Date()
    : false;
  const avatarUrl = member.avatarUrl;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-4 flex items-center justify-center text-white font-bold overflow-hidden">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={`${member.name}のアイコン`} className="w-full h-full object-cover" />
          ) : (
            member.name.charAt(0)
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">{member.name}</h2>
          <p className="text-sm text-gray-500">
            {member.grade}年生 / {member.department}
          </p>
        </div>
      </div>

      {member.currentStatus && isStatusValid && (
        <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
          💬 {member.currentStatus.message}
        </div>
      )}

      {member.skills.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-gray-600 mb-1">スキル:</p>
          <div className="flex flex-wrap gap-1">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {member.interests.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-1">興味:</p>
          <div className="flex flex-wrap gap-1">
            {member.interests.map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
