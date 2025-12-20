import Link from 'next/link';
import {
  getEventById,
  getEventParticipantsByEventId,
} from '@/app/admin/_data';

type AdminEventParticipantsDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

export default async function AdminEventParticipantsDetailPage({
  params,
}: AdminEventParticipantsDetailPageProps) {
  const { eventId } = await params;
  const [event, participants] = await Promise.all([
    getEventById(eventId),
    getEventParticipantsByEventId(eventId),
  ]);

  if (!event) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">イベントが見つかりません</h1>
        <Link
          href="/admin/events/participants"
          className="text-blue-600 hover:underline"
        >
          イベント一覧へ戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/events/participants"
          className="text-sm text-blue-600 hover:underline"
        >
          ← イベント一覧へ戻る
        </Link>
        <h1 className="text-2xl font-bold mt-2">{event.title}</h1>
        <p className="text-gray-600">
          {new Date(event.startDate).toLocaleString('ja-JP')} /{' '}
          {event.location || '場所未設定'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          このイベントを編集
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
          <p className="text-gray-600 mb-4">
            {event.description || '詳細が登録されていません。'}
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>📅 {new Date(event.startDate).toLocaleString('ja-JP')}</p>
            <p>📍 {event.location || '場所未設定'}</p>
            <p>
              👥 {participants.length} /{' '}
              {event.capacity === 'unlimited' ? '無制限' : event.capacity}名
            </p>
            <p>
              🌐 {event.onlineUrl ? event.onlineUrl : 'オンラインリンクなし'}
            </p>
            {event.onlinePassword && (
              <p>🔑 パスワード: {event.onlinePassword}</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">参加者</h2>
            <span className="text-sm text-gray-500">
              {participants.length}名
            </span>
          </div>
          {participants.length === 0 ? (
            <p className="text-sm text-gray-500">
              まだ参加者がいません。
            </p>
          ) : (
            <div className="grid gap-3">
              {participants.map((member) => (
                <div
                  key={member.id}
                  className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.department} / {member.grade}年
                      </div>
                    </div>
                    <Link
                      href={`/admin/hr/${member.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      参加履歴
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
