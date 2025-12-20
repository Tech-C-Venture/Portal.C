import Link from 'next/link';
import { getMemberParticipations, getMembers } from '@/app/admin/_data';

type MemberHrDetailPageProps = {
  params: Promise<{ memberId: string }>;
};

export default async function MemberHrDetailPage({
  params,
}: MemberHrDetailPageProps) {
  const { memberId } = await params;
  const [members, participations] = await Promise.all([
    getMembers(),
    getMemberParticipations(memberId),
  ]);

  const member = members.find((item) => item.id === memberId);

  if (!member) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">メンバーが見つかりません</h1>
        <Link href="/admin/hr" className="text-blue-600 hover:underline">
          メンバーHRへ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/hr" className="text-sm text-blue-600 hover:underline">
          ← メンバーHRへ戻る
        </Link>
        <h1 className="text-2xl font-bold mt-2">{member.name}</h1>
        <p className="text-gray-600">
          {member.department} / {member.grade}年
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">基本情報</h2>
        <div className="grid gap-4 md:grid-cols-2 text-sm text-gray-700">
          <div>
            <div className="text-xs text-gray-500">学籍番号</div>
            <div>{member.studentId ?? '未登録'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">学校メール</div>
            <div>{member.schoolEmail}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">私用Gmail</div>
            <div>{member.gmailAddress ?? '未登録'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">イベント参加数</div>
            <div>{participations.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">参加履歴</h2>
        {participations.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ参加履歴がありません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    イベント
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    日時
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    場所
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {participations.map((row) => (
                  <tr key={`${row.eventId}-${row.registeredAt}`}>
                    <td className="px-4 py-3 text-sm">{row.title}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(row.eventDate).toLocaleString('ja-JP')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {row.location ?? '未設定'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
