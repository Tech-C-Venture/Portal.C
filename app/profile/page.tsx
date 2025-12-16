import { Button } from "@openameba/spindle-ui";
import "@openameba/spindle-ui/Button/Button.css";

export default async function ProfilePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">プロフィール</h1>
        <p className="text-gray-600">あなたの情報を編集</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 flex items-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mr-6"></div>
          <Button size="medium" variant="contained">
            写真を変更
          </Button>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">名前</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="山田太郎"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              学校メールアドレス（公開）
            </label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="yamada@example.ed.jp"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">入学年度</label>
              <input
                type="number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2022"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">所属専攻</label>
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="情報システム科"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              留年している
            </label>
            <input type="checkbox" className="w-4 h-4" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              今何してる？（24時間で消えます）
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="課題中..."
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">スキルタグ</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="React, TypeScript, Next.js (カンマ区切り)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">興味タグ</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Web開発, UI/UX (カンマ区切り)"
            />
          </div>

          <div className="w-full">
            <Button type="submit" size="large" variant="contained">
              保存
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
