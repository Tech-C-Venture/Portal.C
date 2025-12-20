import { CreateEventForm } from '@/components/admin/CreateEventForm';

export default function AdminEventCreatePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">イベント作成</h1>
        <p className="text-gray-600">新規イベントを登録します。</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <CreateEventForm />
      </div>
    </div>
  );
}
