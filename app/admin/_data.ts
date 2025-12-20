import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IEventRepository } from '@/application/ports/IEventRepository';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import type { EventDTO } from '@/application/dtos/EventDTO';
import type { MemberDTO } from '@/application/dtos/MemberDTO';
import { EventMapper } from '@/application/mappers/EventMapper';
import { MemberMapper } from '@/application/mappers/MemberMapper';
import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';

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
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('timetable_by_grade_major')
    .select(
      'member_id, member_name, current_grade, major, day_of_week, period, course_name, semester, year'
    );

  const timetableMap = new Map<string, TimetableSummary>();
  for (const row of data ?? []) {
    const current = timetableMap.get(row.member_id);
    if (!current) {
      timetableMap.set(row.member_id, {
        memberId: row.member_id,
        memberName: row.member_name,
        grade: row.current_grade,
        major: row.major,
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

export async function getPublicTimetables(): Promise<PublicTimetableEntry[]> {
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('timetables')
    .select(
      'id, day_of_week, period, course_name, grade, major, classroom, instructor'
    )
    .eq('is_public', true)
    .order('grade', { ascending: true })
    .order('major', { ascending: true })
    .order('day_of_week', { ascending: true })
    .order('period', { ascending: true });

  return (
    data?.map((row) => ({
      id: row.id,
      dayOfWeek: row.day_of_week,
      period: row.period,
      courseName: row.course_name,
      grade: row.grade,
      major: row.major,
      classroom: row.classroom,
      instructor: row.instructor,
    })) ?? []
  );
}

export async function getParticipationCounts(): Promise<Map<string, number>> {
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('event_participants')
    .select('member_id');

  const participationCounts = new Map<string, number>();
  for (const row of data ?? []) {
    participationCounts.set(
      row.member_id,
      (participationCounts.get(row.member_id) ?? 0) + 1
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
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('event_participation_stats')
    .select(
      'event_id, title, event_date, capacity, registered_count, participated_count, available_spots'
    )
    .order('event_date', { ascending: false });

  return (
    data?.map((row) => ({
      eventId: row.event_id,
      title: row.title,
      eventDate: row.event_date,
      capacity: row.capacity,
      registeredCount: row.registered_count,
      participatedCount: row.participated_count,
      availableSpots: row.available_spots,
    })) ?? []
  );
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
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('event_participants')
    .select(
      'event_id, registered_at, participated, events (id, title, event_date, location)'
    )
    .eq('member_id', memberId)
    .order('registered_at', { ascending: false });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?.map((row: any) => ({
      eventId: row.event_id,
      title: row.events?.title ?? '不明なイベント',
      eventDate: row.events?.event_date ?? row.registered_at,
      location: row.events?.location ?? null,
      registeredAt: row.registered_at,
      participated: Boolean(row.participated),
    })) ?? []
  );
}

export async function getAverageParticipationRate(): Promise<number | null> {
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('event_participation_stats')
    .select('capacity, registered_count');

  // Note: Unbounded events should be summarized via average participants.
  const capacityRates = (data ?? [])
    .filter((row) => row.capacity && row.capacity > 0)
    .map((row) => row.registered_count / (row.capacity ?? 1));

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
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from('event_participation_stats')
    .select('capacity, registered_count');

  const counts = (data ?? []).map((row) => row.registered_count);

  if (counts.length === 0) {
    return null;
  }

  return Math.round(
    counts.reduce((sum, value) => sum + value, 0) / counts.length
  );
}
