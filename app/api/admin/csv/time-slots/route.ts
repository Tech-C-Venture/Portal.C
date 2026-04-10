import { isAdmin } from '@/lib/auth';
import { getTimeSlots } from '@/app/admin/_data';
import { generateCsv, type CsvColumnDef } from '@/lib/csv';

type TimeSlotRow = {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

const TIME_SLOT_COLUMNS: readonly CsvColumnDef<TimeSlotRow>[] = [
  { header: '時限', accessor: (r) => r.period },
  { header: 'ラベル', accessor: (r) => r.label },
  { header: '開始時刻', accessor: (r) => r.startTime },
  { header: '終了時刻', accessor: (r) => r.endTime },
  { header: '有効', accessor: (r) => r.isActive },
];

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return new Response('Forbidden', { status: 403 });
  }

  const timeSlots = await getTimeSlots();
  const csv = generateCsv(TIME_SLOT_COLUMNS, timeSlots);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `time_slots_${today}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
