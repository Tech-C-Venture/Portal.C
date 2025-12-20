/* eslint-disable no-restricted-imports */
import { DatabaseClient } from "@/infrastructure/database/DatabaseClient";
import { PublicTimetableTable } from "@/components/timetable/PublicTimetableTable";

async function getPublicTimetables() {
  const supabase = await DatabaseClient.getServerClient();
  const { data } = await supabase
    .from("timetables")
    .select(
      "id, day_of_week, period, course_name, grade, major, classroom, instructor"
    )
    .eq("is_public", true);

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

export default async function TimetablePage() {
  const publicTimetables = await getPublicTimetables();
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">時間割</h1>
        <p className="text-gray-600">メンバーの時間割を確認</p>
      </div>

      <PublicTimetableTable entries={publicTimetables} />
    </div>
  );
}
