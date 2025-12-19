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

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-[0_16px_42px_rgba(42,97,179,0.14)] transition-shadow">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-accent2 rounded-full mr-4 flex items-center justify-center text-foreground font-bold">
          {member.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">{member.name}</h2>
          <p className="text-sm text-muted2">
            {member.grade}年生 / {member.department}
          </p>
        </div>
      </div>

      {member.currentStatus && isStatusValid && (
        <div className="mb-3 rounded-xl border border-border bg-accent1 p-3 text-sm text-foreground">
          💬 {member.currentStatus.message}
        </div>
      )}

      {member.skills.length > 0 && (
        <div className="mb-3">
          <p className="text-sm text-muted mb-1">スキル:</p>
          <div className="flex flex-wrap gap-1">
            {member.skills.map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 bg-accent1 text-foreground text-xs rounded-lg border border-border"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {member.interests.length > 0 && (
        <div>
          <p className="text-sm text-muted mb-1">興味:</p>
          <div className="flex flex-wrap gap-1">
            {member.interests.map((interest) => (
              <span
                key={interest}
                className="px-2 py-1 bg-[#b7e0e4]/40 text-foreground text-xs rounded-lg border border-border"
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
