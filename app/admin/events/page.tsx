import Link from 'next/link';

export default function AdminEventsIndexPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">イベント管理</h1>
        <p className="text-gray-600">作成と参加者管理の入口です。</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/events/create"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">イベント作成</h2>
          <p className="text-sm text-gray-600">
            新規イベントの登録・日程入力
          </p>
        </Link>
        <Link
          href="/admin/events/participants"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">登録イベント一覧</h2>
          <p className="text-sm text-gray-600">
            登録済みイベントの一覧
          </p>
        </Link>
        <Link
          href="/admin/events/edit"
          className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <h2 className="text-lg font-semibold mb-2">イベント編集</h2>
          <p className="text-sm text-gray-600">
            既存イベントの内容を更新
          </p>
        </Link>
      </div>
    </div>
  );
}
