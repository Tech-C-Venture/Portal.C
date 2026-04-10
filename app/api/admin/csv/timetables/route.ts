import { isAdmin } from '@/lib/auth';
import { getPublicTimetables } from '@/app/admin/_data';
import { generateCsv, type CsvColumnDef } from '@/lib/csv';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

type TimetableRow = {
  grade: number | null;
  major: string | null;
  dayOfWeek: number;
  period: number;
  courseName: string;
  classroom: string | null;
  instructor: string | null;
};

const TIMETABLE_COLUMNS: readonly CsvColumnDef<TimetableRow>[] = [
  { header: '学年', accessor: (r) => r.grade ?? '' },
  { header: '専攻', accessor: (r) => r.major ?? '' },
  { header: '曜日', accessor: (r) => DAY_LABELS[r.dayOfWeek] ?? '' },
  { header: '時限', accessor: (r) => r.period },
  { header: '教科名', accessor: (r) => r.courseName },
  { header: '教室', accessor: (r) => r.classroom ?? '' },
  { header: '担当講師', accessor: (r) => r.instructor ?? '' },
];

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return new Response('Forbidden', { status: 403 });
  }

  const timetables = await getPublicTimetables();
  const csv = generateCsv(TIMETABLE_COLUMNS, timetables);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `timetables_${today}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
