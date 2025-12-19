import { DayOfWeek } from "@/types";
import { Button } from "@openameba/spindle-ui";
import "@openameba/spindle-ui/Button/Button.css";

const days = Object.values(DayOfWeek);
const periods = [1, 2, 3, 4, 5, 6];

export default function TimetablePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">時間割</h1>
        <p className="text-muted">メンバーの時間割を確認</p>
      </div>

      <div className="mb-6 flex gap-4">
        <select className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
          <option>全学年</option>
          <option>1年生</option>
          <option>2年生</option>
          <option>3年生</option>
          <option>4年生</option>
        </select>
        <select className="px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring">
          <option>全専攻</option>
          <option>情報システム科</option>
          <option>AIシステム科</option>
          <option>ゲームクリエイター科</option>
        </select>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                時限
              </th>
              {days.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {periods.map((period) => (
              <tr key={period}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {period}限
                </td>
                {days.map((day) => (
                  <td key={`${day}-${period}`} className="px-4 py-3">
                    <div className="text-sm text-muted2 hover:bg-gray-50 p-2 rounded cursor-pointer">
                      {/* 授業情報がここに表示される */}
                      -
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <Button size="medium" variant="contained">
          自分の時間割を登録
        </Button>
      </div>
    </div>
  );
}
