/* eslint-disable no-restricted-imports */
'use client'; // サーバーアクションをクライアントコンポーネントに渡すため

import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { DatabaseClient } from "@/infrastructure/database/DatabaseClient";

import { getCurrentUser } from '@/lib/auth';
import { fetchMyTimetable } from '@/lib/supabase/actions';
import { PublicTimetableTable, type PublicTimetableEntry } from "@/components/timetable/PublicTimetableTable";
import { addCourseToMyTimetable } from '@/app/actions/timetables';
import { useEffect, useState } from 'react';

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

export default function TimetablePage() {
  const [publicTimetables, setPublicTimetables] = useState<PublicTimetableEntry[]>([]);
  const [privateTimetables, setPrivateTimetables] = useState<PublicTimetableEntry[]>([]);

  useEffect(() => {
    async function fetchData() {
      const publicData = await getPublicTimetables();
      setPublicTimetables(publicData);

      const user = await getCurrentUser();
      if (user?.id) {
        const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
        const memberResult = await memberRepository.findByZitadelId(user.id);

        if (memberResult.success && memberResult.value) {
          const myData = (await fetchMyTimetable(memberResult.value.id)) as PrivateTimetableData[] | null;
          if (myData) {
            const privateData = myData
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
            setPrivateTimetables(privateData);
          }
        }
      }
    }
    fetchData();
  }, []);

  const handleRegister = async (timetableId: string) => {
    const result = await addCourseToMyTimetable(timetableId);
    if (result.success) {
      alert('マイ時間割に追加しました。');
      // データ再取得 or キャッシュ再検証によりUIが更新される
    } else {
      alert(`エラー: ${result.message}`);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">時間割</h1>
        <p className="text-gray-600">自分に合った時間割を表示</p>
      </div>

      <PublicTimetableTable 
        entries={publicTimetables} 
        privateEntries={privateTimetables}
        onRegister={handleRegister}
      />
    </div>
  );
}