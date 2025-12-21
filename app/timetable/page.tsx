/* eslint-disable no-restricted-imports */
import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { DatabaseClient } from "@/infrastructure/database/DatabaseClient";

import { getCurrentUser } from '@/lib/auth';
import { fetchMyTimetable } from '@/lib/supabase/actions';
import { PublicTimetableTable, type PublicTimetableEntry } from "@/components/timetable/PublicTimetableTable";

type TimetableRow = {
  id: string;
  day_of_week: number;
  period: number;
  course_name: string;
  grade: number | null;
  major: string | null;
  classroom: string | null;
  instructor: string | null;
};

type PrivateTimetableData = {
  id: string;
  timetables: TimetableRow | null;
};

async function getPublicTimetables(): Promise<PublicTimetableEntry[]> {
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from("timetables")
    .select("id, day_of_week, period, course_name, grade, major, classroom, instructor")
    .eq("is_public", true);

  return data?.map((row) => ({
    id: row.id,
    dayOfWeek: row.day_of_week,
    period: row.period,
    courseName: row.course_name,
    grade: row.grade,
    major: row.major,
    classroom: row.classroom,
    instructor: row.instructor,
  })) ?? [];
}

export default async function TimetablePage() {
  const publicTimetables = await getPublicTimetables();
  const user = await getCurrentUser();
  let privateTimetables: PublicTimetableEntry[] = [];
  let defaultGrade: number | undefined;
  let defaultMajor: string | undefined;

  if (user?.id) {
    const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
    const memberResult = await memberRepository.findByZitadelId(user.id);
    
    if (memberResult.success && memberResult.value) {
      defaultGrade = memberResult.value.grade;
      defaultMajor = memberResult.value.major;

      const myData = (await fetchMyTimetable(memberResult.value.id)) as PrivateTimetableData[] | null;
      if (myData) {
        privateTimetables = myData
          .filter((item): item is PrivateTimetableData & { timetables: TimetableRow } => item.timetables !== null)
          .map((item) => ({
            id: item.id,
            dayOfWeek: item.timetables.day_of_week,
            period: item.timetables.period,
            courseName: item.timetables.course_name,
            grade: item.timetables.grade,
            major: item.timetables.major,
            classroom: item.timetables.classroom,
            instructor: item.timetables.instructor,
          }));
      }
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">時間割</h1>
        <p className="text-gray-600">自分に合った時間割を表示</p>
      </div>

      <PublicTimetableTable 
        entries={publicTimetables} 
        privateEntries={privateTimetables}
        defaultGrade={defaultGrade}
        defaultMajor={defaultMajor}
      />
    </div>
  );
}