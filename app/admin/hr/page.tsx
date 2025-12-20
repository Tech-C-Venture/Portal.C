import Link from 'next/link';
import { getMembers, getParticipationCounts } from '@/app/admin/_data';

export default async function AdminHrPage() {
  const [members, participationCounts] = await Promise.all([
    getMembers(),
    getParticipationCounts(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">メンバーHR</h1>
        <p className="text-gray-600">
          基本登録情報・イベント参加数・Gmailを確認します。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">メンバー一覧</h2>
          <span className="text-sm text-gray-500">{members.length}名</span>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">
            メンバーが登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    メンバー
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    学籍番号
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    学校メール
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    私用Gmail
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    イベント参加数
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    詳細
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3 text-sm">
                      <div className="font-medium text-gray-900">
                        {member.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.department} / {member.grade}年
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {member.studentId ?? '未登録'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {member.schoolEmail}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {member.gmailAddress ?? '未登録'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {participationCounts.get(member.id) ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/hr/${member.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        参加履歴
                      </Link>
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
