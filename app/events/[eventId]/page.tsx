/**
 * イベント詳細ページ
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* eslint-disable no-restricted-imports */
import { notFound } from 'next/navigation';
import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IEventRepository } from '@/application/ports/IEventRepository';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { getCurrentUser } from '@/lib/auth';
import { EventRegisterButton } from '@/components/events/EventRegisterButton';
import { SiGooglemeet } from 'react-icons/si';
import { TbBrandZoom } from 'react-icons/tb';

type EventDetailPageProps = {
  params: Promise<{ eventId: string }>;
};

function buildJoinUrl(url: string, password?: string) {
  if (!password) {
    return url;
  }
  if (url.includes('pwd=')) {
    return url;
  }
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}pwd=${encodeURIComponent(password)}`;
}

function isZoomMeeting(url: string, password?: string) {
  const lower = url.toLowerCase();
  if (lower.includes('zoom')) return true;
  if (lower.includes('/j/')) return true;
  if (password) return true;
  return false;
}

function getMeetingIcon(url: string, password?: string) {
  const lower = url.toLowerCase();
  if (isZoomMeeting(url, password)) return <TbBrandZoom className="h-4 w-4" />;
  if (lower.includes('meet')) return <SiGooglemeet className="h-4 w-4" />;
  return null;
}

async function getCurrentMemberId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return null;
  }
  const memberRepository = container.resolve<IMemberRepository>(
    REPOSITORY_KEYS.MEMBER
  );
  const result = await memberRepository.findByZitadelId(user.id);
  if (!result.success || !result.value) {
    return null;
  }
  return result.value.id;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;
  const eventRepository = container.resolve<IEventRepository>(
    REPOSITORY_KEYS.EVENT
  );
  const result = await eventRepository.findById(eventId);
  if (!result.success || !result.value) {
    notFound();
  }

  const { EventMapper } = await import('@/application/mappers/EventMapper');
  const eventDto = EventMapper.toDTO(result.value);
  const memberId = await getCurrentMemberId();
  const isRegistered = memberId
    ? result.value.participantIds.includes(memberId)
    : false;
  const onlineUrl = eventDto.onlineUrl;
  const onlinePassword = eventDto.onlinePassword;
  const isZoom =
    typeof onlineUrl === 'string' && isZoomMeeting(onlineUrl, onlinePassword);
  const hasOnline = Boolean(onlineUrl);
  const joinUrl = onlineUrl
    ? buildJoinUrl(onlineUrl, onlinePassword)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{eventDto.title}</h1>
        <p className="text-gray-600">
          {new Date(eventDto.startDate).toLocaleString('ja-JP')} /{' '}
          {eventDto.location || '場所未設定'}
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid gap-6 lg:grid-cols-[1.6fr,1fr]">
          <div>
            <h2 className="text-lg font-semibold mb-3">詳細</h2>
            <p className="whitespace-pre-line text-gray-700">
              {eventDto.description || '詳細が登録されていません。'}
            </p>
          </div>
          <div className="space-y-4 rounded-lg border border-gray-100 bg-gray-50 p-4">
            <div>
              <p className="text-xs font-medium text-gray-500">日時</p>
              <p className="text-sm text-gray-800">
                {new Date(eventDto.startDate).toLocaleString('ja-JP')}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">場所</p>
              <p className="text-sm text-gray-800">
                {eventDto.location || '場所未設定'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500">参加者</p>
              <p className="text-sm text-gray-800">
                {eventDto.participantCount} /{' '}
                {eventDto.capacity === 'unlimited'
                  ? '無制限'
                  : eventDto.capacity}
                名
              </p>
            </div>
            <div className="pt-2">
              {eventDto.isFull && !isRegistered ? (
                <div className="text-sm font-semibold text-red-600">満員</div>
              ) : (
                <EventRegisterButton
                  eventId={eventDto.id}
                  isRegistered={isRegistered}
                  disabled={eventDto.isFull && !isRegistered}
                />
              )}
            </div>
            {hasOnline && isRegistered && joinUrl && (
              <div className="border-t border-gray-200 pt-3">
                <p className="text-xs font-medium text-gray-500">
                  オンライン参加
                </p>
                <a
                  href={joinUrl}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  target="_blank"
                  rel="noreferrer"
                >
                  {onlineUrl ? getMeetingIcon(onlineUrl, onlinePassword) : null}
                  {isZoom ? 'Zoomに参加' : 'オンライン参加'}
                </a>
                {onlinePassword && (
                  <p className="mt-2 text-xs text-gray-600">
                    パスワード: {onlinePassword}
                  </p>
                )}
              </div>
            )}
            {hasOnline && !isRegistered && (
              <p className="text-xs text-gray-500">
                参加登録後にオンライン参加リンクを表示します。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
