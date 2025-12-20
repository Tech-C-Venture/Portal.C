import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getEventById } from '@/app/admin/_data';
import { EditEventForm } from '@/components/admin/EditEventForm';
import { deleteEventAction } from '@/app/actions/events';

type AdminEventEditPageProps = {
  params: Promise<{ eventId: string }>;
};

function formatDateTimeLocal(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const offset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offset);
  return local.toISOString().slice(0, 16);
}

export default async function AdminEventEditPage({
  params,
}: AdminEventEditPageProps) {
  const { eventId } = await params;
  const event = await getEventById(eventId);
  if (!event) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events/edit"
          className="text-sm text-blue-600 hover:underline"
        >
          ← イベント一覧へ戻る
        </Link>
        <h1 className="text-2xl font-bold mt-2">イベント編集</h1>
        <p className="text-gray-600">イベント内容を更新できます。</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <EditEventForm
          eventId={event.id}
          title={event.title}
          description={event.description}
          startDateLocal={formatDateTimeLocal(event.startDate)}
          location={event.location}
          capacity={event.capacity === 'unlimited' ? null : event.capacity}
          onlineUrl={event.onlineUrl ?? null}
          onlinePassword={event.onlinePassword ?? null}
        />
      </div>

      <div className="bg-white rounded-lg border border-rose-100 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-rose-700 mb-2">
          イベント削除
        </h2>
        <p className="text-sm text-rose-600 mb-4">
          削除すると参加者情報も含めて元に戻せません。
        </p>
        <form action={deleteEventAction}>
          <input type="hidden" name="eventId" value={event.id} />
          <button
            type="submit"
            className="rounded-md bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700"
          >
            イベントを削除
          </button>
        </form>
      </div>
    </div>
  );
}
