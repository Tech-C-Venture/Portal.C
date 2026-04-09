import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IEventRepository } from '@/application/ports/IEventRepository';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import type { EventDTO } from '@/application/dtos/EventDTO';
import type { MemberDTO } from '@/application/dtos/MemberDTO';
import { EventMapper } from '@/application/mappers/EventMapper';
import { MemberMapper } from '@/application/mappers/MemberMapper';
import { getDb } from '@/lib/firebase/admin';

export type EventWithParticipants = {
  event: EventDTO;
  participants: MemberDTO[];
};

export type TimetableSummary = {
  memberId: string;
  memberName: string;
  grade: number;
  major: string | null;
  slotCount: number;
};

export async function getMembers(): Promise<MemberDTO[]> {
  const memberRepository = container.resolve<IMemberRepository>(
    REPOSITORY_KEYS.MEMBER
  );
  const memberResult = await memberRepository.findAll();
  if (!memberResult.success) {
    return [];
  }
  return MemberMapper.toDTOList(memberResult.value);
}

export async function getEventParticipants(): Promise<EventWithParticipants[]> {
  const eventRepository = container.resolve<IEventRepository>(
    REPOSITORY_KEYS.EVENT
  );
  const eventResult = await eventRepository.findAll();
  if (!eventResult.success) {
    return [];
  }
  const eventDtos = EventMapper.toDTOList(eventResult.value);

  return await Promise.all(
    eventDtos.map(async (event) => {
      const participantsResult = await eventRepository.getParticipants(event.id);
      const participants = participantsResult.success
        ? MemberMapper.toDTOList(participantsResult.value)
        : [];
      return { event, participants };
    })
  );
}

export async function getEventById(eventId: string): Promise<EventDTO | null> {
  const eventRepository = container.resolve<IEventRepository>(
    REPOSITORY_KEYS.EVENT
  );
  const result = await eventRepository.findById(eventId);
  if (!result.success || !result.value) {
    return null;
  }
  return EventMapper.toDTO(result.value);
}

export async function getEventParticipantsByEventId(
  eventId: string
): Promise<MemberDTO[]> {
  const eventRepository = container.resolve<IEventRepository>(
    REPOSITORY_KEYS.EVENT
  );
  const participantsResult = await eventRepository.getParticipants(eventId);
  if (!participantsResult.success) {
    return [];
  }
  return MemberMapper.toDTOList(participantsResult.value);
}

export async function getTimetableSummaries(): Promise<TimetableSummary[]> {
  const db = getDb();
  // timetable_by_grade_major ビューは存在しないため、timetablesとmembersからJOIN相当の処理を行う
  const timetableSnap = await db
    .collection('timetables')
    .where('member_id', '!=', null)
    .get();

  const memberIds = new Set<string>();
  for (const doc of timetableSnap.docs) {
    const memberId = doc.data().member_id;
    if (memberId) memberIds.add(memberId);
  }

  // メンバー情報を一括取得
  const memberMap = new Map<string, { name: string; grade: number; major: string | null }>();
  if (memberIds.size > 0) {
    const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
    const membersResult = await memberRepository.findAll();
    if (membersResult.success) {
      for (const m of membersResult.value) {
        const { calculateGrade } = await import('@/domain/entities/Member');
        memberMap.set(m.id, {
          name: m.name,
          grade: calculateGrade(m),
          major: m.department || null,
        });
      }
    }
  }

  const timetableMap = new Map<string, TimetableSummary>();
  for (const doc of timetableSnap.docs) {
    const data = doc.data();
    const memberId = data.member_id;
    if (!memberId) continue;

    const member = memberMap.get(memberId);
    if (!member) continue;

    const current = timetableMap.get(memberId);
    if (!current) {
      timetableMap.set(memberId, {
        memberId,
        memberName: member.name,
        grade: member.grade,
        major: member.major,
        slotCount: 1,
      });
    } else {
      current.slotCount += 1;
    }
  }

  return Array.from(timetableMap.values());
}

export type PublicTimetableEntry = {
  id: string;
  dayOfWeek: number;
  period: number;
  courseName: string;
  grade: number | null;
  major: string | null;
  classroom: string | null;
  instructor: string | null;
};

export type TimeSlotEntry = {
  id: string;
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

function normalizeTimeValue(value: string | null): string {
  if (!value) return '';
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export async function getTimeSlots(): Promise<TimeSlotEntry[]> {
  const db = getDb();
  const snap = await db
    .collection('timetable_time_slots')
    .orderBy('period', 'asc')
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      period: data.period,
      label: data.label,
      startTime: normalizeTimeValue(String(data.start_time ?? '')),
      endTime: normalizeTimeValue(String(data.end_time ?? '')),
      isActive: data.is_active,
    };
  });
}

export async function getPublicTimetables(): Promise<PublicTimetableEntry[]> {
  const db = getDb();
  const snap = await db
    .collection('timetables')
    .where('is_public', '==', true)
    .get();

  const entries = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      dayOfWeek: data.day_of_week,
      period: data.period,
      courseName: data.course_name,
      grade: data.grade ?? null,
      major: data.major ?? null,
      classroom: data.classroom ?? null,
      instructor: data.instructor ?? null,
    };
  });

  // Firestoreはmulti-field orderByに複合インデックスが必要なため、JS側でソート
  entries.sort((a, b) => {
    if ((a.grade ?? 0) !== (b.grade ?? 0)) return (a.grade ?? 0) - (b.grade ?? 0);
    if ((a.major ?? '') !== (b.major ?? '')) return (a.major ?? '').localeCompare(b.major ?? '');
    if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
    return a.period - b.period;
  });

  return entries;
}

export async function getParticipationCounts(): Promise<Map<string, number>> {
  const db = getDb();
  const snap = await db.collection('event_participants').get();

  const participationCounts = new Map<string, number>();
  for (const doc of snap.docs) {
    const memberId = doc.data().member_id;
    participationCounts.set(
      memberId,
      (participationCounts.get(memberId) ?? 0) + 1
    );
  }

  return participationCounts;
}

export type EventParticipationStat = {
  eventId: string;
  title: string;
  eventDate: string;
  capacity: number | null;
  registeredCount: number;
  participatedCount: number;
  availableSpots: number | null;
};

export async function getEventParticipationStats(): Promise<
  EventParticipationStat[]
> {
  const db = getDb();

  // イベント一覧取得
  const eventsSnap = await db
    .collection('events')
    .orderBy('event_date', 'desc')
    .get();

  // 全参加者取得
  const participantsSnap = await db.collection('event_participants').get();

  // イベントごとに集計
  const participantsByEvent = new Map<string, { registered: number; participated: number }>();
  for (const doc of participantsSnap.docs) {
    const data = doc.data();
    const eventId = data.event_id;
    const current = participantsByEvent.get(eventId) ?? { registered: 0, participated: 0 };
    current.registered += 1;
    if (data.participated) current.participated += 1;
    participantsByEvent.set(eventId, current);
  }

  return eventsSnap.docs.map((doc) => {
    const data = doc.data();
    const stats = participantsByEvent.get(doc.id) ?? { registered: 0, participated: 0 };
    const capacity = data.capacity ?? null;
    return {
      eventId: doc.id,
      title: data.title,
      eventDate: data.event_date?.toDate()?.toISOString() ?? '',
      capacity,
      registeredCount: stats.registered,
      participatedCount: stats.participated,
      availableSpots: capacity !== null ? Math.max(0, capacity - stats.registered) : null,
    };
  });
}

export type MemberParticipation = {
  eventId: string;
  title: string;
  eventDate: string;
  location: string | null;
  registeredAt: string;
  participated: boolean;
};

export async function getMemberParticipations(
  memberId: string
): Promise<MemberParticipation[]> {
  const db = getDb();
  const snap = await db
    .collection('event_participants')
    .where('member_id', '==', memberId)
    .get();

  if (snap.empty) return [];

  // イベント情報を一括取得
  const eventIds = snap.docs.map((doc) => doc.data().event_id);
  const uniqueEventIds = [...new Set(eventIds)];
  const eventMap = new Map<string, { title: string; event_date: any; location: string | null }>();

  for (const eventId of uniqueEventIds) {
    const eventSnap = await db.collection('events').doc(eventId).get();
    if (eventSnap.exists) {
      const data = eventSnap.data()!;
      eventMap.set(eventId, {
        title: data.title,
        event_date: data.event_date,
        location: data.location ?? null,
      });
    }
  }

  const results = snap.docs.map((doc) => {
    const data = doc.data();
    const event = eventMap.get(data.event_id);
    return {
      eventId: data.event_id,
      title: event?.title ?? '不明なイベント',
      eventDate: event?.event_date?.toDate()?.toISOString() ?? data.registered_at?.toDate()?.toISOString() ?? '',
      location: event?.location ?? null,
      registeredAt: data.registered_at?.toDate()?.toISOString() ?? '',
      participated: Boolean(data.participated),
    };
  });

  // registered_atで降順ソート
  results.sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

  return results;
}

export async function getAverageParticipationRate(): Promise<number | null> {
  const stats = await getEventParticipationStats();

  const capacityRates = stats
    .filter((s) => s.capacity && s.capacity > 0)
    .map((s) => s.registeredCount / (s.capacity ?? 1));

  if (capacityRates.length === 0) {
    return null;
  }

  return Math.round(
    (capacityRates.reduce((sum, rate) => sum + rate, 0) /
      capacityRates.length) *
      100
  );
}

export async function getAverageParticipants(): Promise<number | null> {
  const stats = await getEventParticipationStats();

  const counts = stats.map((s) => s.registeredCount);

  if (counts.length === 0) {
    return null;
  }

  return Math.round(
    counts.reduce((sum, value) => sum + value, 0) / counts.length
  );
}
