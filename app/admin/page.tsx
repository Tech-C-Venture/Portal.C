import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button } from "@openameba/spindle-ui";
import "@openameba/spindle-ui/Button/Button.css";
import { MemberGmailForm } from "@/components/admin/MemberGmailForm";

export default async function AdminPage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/events");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">管理画面</h1>
        <p className="text-muted">イベント管理と参加者統計</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
          <h3 className="text-lg font-semibold mb-2">総メンバー数</h3>
          <p className="text-3xl font-bold text-blue-600">42</p>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
          <h3 className="text-lg font-semibold mb-2">今月のイベント</h3>
          <p className="text-3xl font-bold text-green-600">5</p>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-soft p-6">
          <h3 className="text-lg font-semibold mb-2">平均参加率</h3>
          <p className="text-3xl font-bold text-primary">78%</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-soft p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">新規イベント作成</h2>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              イベント名
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="イベント名を入力"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">説明</label>
            <textarea
              className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              rows={3}
              placeholder="イベントの説明"
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">日時</label>
              <input
                type="datetime-local"
                className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">場所</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="場所を入力"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">定員</label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="30"
            />
          </div>
          <div className="w-full">
            <Button type="submit" size="large" variant="contained">
              イベントを作成
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-2">私用Gmail登録</h2>
        <p className="text-sm text-gray-600 mb-4">
          管理者専用: 学校メールアドレスで検索し、私用Gmailを登録します。
        </p>
        <MemberGmailForm />
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
