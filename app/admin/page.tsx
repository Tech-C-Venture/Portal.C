import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/events");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">管理画面</h1>
        <p className="text-gray-600">イベント管理と参加者統計</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">総メンバー数</h3>
          <p className="text-3xl font-bold text-blue-600">42</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">今月のイベント</h3>
          <p className="text-3xl font-bold text-green-600">5</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">平均参加率</h3>
          <p className="text-3xl font-bold text-purple-600">78%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">新規イベント作成</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              イベント名
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="イベント名を入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">説明</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="イベントの説明"
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">日時</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">場所</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="場所を入力"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">定員</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="30"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            イベントを作成
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">参加統計</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  メンバー
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  参加回数
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  最終参加日
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">山田太郎</td>
                <td className="px-4 py-3 text-sm">15回</td>
                <td className="px-4 py-3 text-sm">2024-03-20</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">佐藤花子</td>
                <td className="px-4 py-3 text-sm">12回</td>
                <td className="px-4 py-3 text-sm">2024-03-18</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
