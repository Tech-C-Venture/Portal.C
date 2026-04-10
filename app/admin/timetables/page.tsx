import {
  getPublicTimetables,
  getTimeSlots,
  getTimetableSummaries,
  getDepartments,
} from '@/app/admin/_data';
import { PublicTimetableForm } from '@/components/admin/PublicTimetableForm';
import { PublicTimetableDeleteButton } from '@/components/admin/PublicTimetableDeleteButton';
import { TimeSlotForm } from '@/components/admin/TimeSlotForm';
import { TimeSlotTable } from '@/components/admin/TimeSlotTable';
import { CsvUploadForm } from '@/components/admin/CsvUploadForm';
import {
  uploadPublicTimetableExcelAction,
  uploadTimeSlotsCsvAction,
  uploadDepartmentsCsvAction,
} from '@/app/actions/timetables';

export const dynamic = 'force-dynamic';

export default async function AdminTimetablesPage() {
  const [timetableSummaries, publicTimetables, timeSlots, departments] = await Promise.all([
    getTimetableSummaries(),
    getPublicTimetables(),
    getTimeSlots(),
    getDepartments(),
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
        <PublicTimetableForm timeSlots={timeSlots} departmentNames={departments.map((d) => d.name)} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">共通時間割 Excel管理</h2>
        </div>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              ダウンロード
            </h3>
            <a
              href="/api/admin/csv/timetables"
              download
              className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
            >
              共通時間割Excelをダウンロード (.xlsx)
            </a>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              アップロード（一括上書き）
            </h3>
            <p className="text-xs text-gray-500 mb-2">
              シート名: 「学年_専攻」（例: 1年_AIエンジニア専攻）、カラム: 曜日, 時限, 教科名, 教室, 担当講師
            </p>
            <CsvUploadForm
              action={uploadPublicTimetableExcelAction}
              label="共通時間割をアップロード"
              confirmMessage="既存の共通時間割データを全て削除し、Excelの内容で上書きします。よろしいですか？"
              accept=".xlsx"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">時間帯マスター</h2>
          <span className="text-sm text-gray-500">
            {timeSlots.length}件
          </span>
        </div>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              時間帯を追加
            </h3>
            <TimeSlotForm />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              登録済み時間帯
            </h3>
            <TimeSlotTable timeSlots={timeSlots} />
          </div>
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              CSV管理
            </h3>
            <div className="space-y-3">
              <div>
                <a
                  href="/api/admin/csv/time-slots"
                  download
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  時間帯マスターCSVをダウンロード
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  CSVカラム: 時限, ラベル, 開始時刻, 終了時刻, 有効
                </p>
                <CsvUploadForm
                  action={uploadTimeSlotsCsvAction}
                  label="時間帯マスターをアップロード"
                  confirmMessage="既存の時間帯マスターデータを全て削除し、CSVの内容で上書きします。よろしいですか？"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">専攻マスター</h2>
          <span className="text-sm text-gray-500">
            {departments.length}件
          </span>
        </div>
        <div className="space-y-4">
          {departments.length > 0 && (
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {departments.map((d) => (
                <li key={d.id}>{d.name}</li>
              ))}
            </ul>
          )}
          {departments.length === 0 && (
            <p className="text-sm text-gray-500">
              まだ専攻が登録されていません。
            </p>
          )}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              CSV管理
            </h3>
            <div className="space-y-3">
              <div>
                <a
                  href="/api/admin/csv/departments"
                  download
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                >
                  専攻マスターCSVをダウンロード
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">
                  CSVカラム: 専攻名
                </p>
                <CsvUploadForm
                  action={uploadDepartmentsCsvAction}
                  label="専攻マスターをアップロード"
                  confirmMessage="既存の専攻マスターデータを全て削除し、CSVの内容で上書きします。よろしいですか？"
                />
              </div>
            </div>
          </div>
        </div>
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
