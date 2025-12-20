import { getPublicTimetables, getTimetableSummaries } from '@/app/admin/_data';
import { PublicTimetableForm } from '@/components/admin/PublicTimetableForm';
import { PublicTimetableDeleteButton } from '@/components/admin/PublicTimetableDeleteButton';

export default async function AdminTimetablesPage() {
  const [timetableSummaries, publicTimetables] = await Promise.all([
    getTimetableSummaries(),
    getPublicTimetables(),
  ]);
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">時間割</h1>
        <p className="text-gray-600">時間割登録メンバーの一覧です。</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">共通時間割の追加</h2>
        </div>
        <PublicTimetableForm />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">共通時間割一覧</h2>
          <span className="text-sm text-gray-500">
            {publicTimetables.length}件
          </span>
        </div>
        {publicTimetables.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ共通時間割が登録されていません。
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    学年
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    専攻
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    曜日
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    時限
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    教科名
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    教室
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    担当講師
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {publicTimetables.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-sm">
                      {row.grade ?? '-'}年
                    </td>
                    <td className="px-4 py-3 text-sm">{row.major ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {dayLabels[row.dayOfWeek] ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">{row.period}限</td>
                    <td className="px-4 py-3 text-sm">{row.courseName}</td>
                    <td className="px-4 py-3 text-sm">
                      {row.classroom ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {row.instructor ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <PublicTimetableDeleteButton timetableId={row.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">登録メンバー</h2>
          <span className="text-sm text-gray-500">
            {timetableSummaries.length}名
          </span>
        </div>
        {timetableSummaries.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだ時間割の登録がありません。
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
                    学年
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    専攻
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                    登録コマ数
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timetableSummaries.map((row) => (
                  <tr key={row.memberId}>
                    <td className="px-4 py-3 text-sm">{row.memberName}</td>
                    <td className="px-4 py-3 text-sm">{row.grade}年</td>
                    <td className="px-4 py-3 text-sm">
                      {row.major ?? '未設定'}
                    </td>
                    <td className="px-4 py-3 text-sm">{row.slotCount}</td>
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
