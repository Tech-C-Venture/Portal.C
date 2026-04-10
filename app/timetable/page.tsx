/* eslint-disable no-restricted-imports */
import { getDb } from "@/lib/firebase/admin";
import { PublicTimetableTable } from "@/components/timetable/PublicTimetableTable";
import { getCurrentMemberProfileAction } from "@/app/actions/members";

async function getPublicTimetables() {
  const db = getDb();
  const snap = await db
    .collection("timetables")
    .where("is_public", "==", true)
    .get();

  return snap.docs.map((doc) => {
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
}

export default async function TimetablePage() {
  const publicTimetables = await getPublicTimetables();
  let defaultGrade: number | undefined;
  let defaultMajor: string | undefined;
  try {
    const member = await getCurrentMemberProfileAction();
    defaultGrade = member.grade;
    defaultMajor = member.department;
  } catch {
    defaultGrade = undefined;
    defaultMajor = undefined;
  }
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">時間割</h1>
        <p className="text-gray-600">メンバーの時間割を確認</p>
      </div>

      <PublicTimetableTable
        entries={publicTimetables}
        defaultGrade={defaultGrade}
        defaultMajor={defaultMajor}
      />
    </div>
  );
}
