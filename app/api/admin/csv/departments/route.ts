import { isAdmin } from '@/lib/auth';
import { getDepartments } from '@/app/admin/_data';
import { generateCsv, type CsvColumnDef } from '@/lib/csv';

export const dynamic = 'force-dynamic';

type DepartmentRow = {
  name: string;
};

const DEPARTMENT_COLUMNS: readonly CsvColumnDef<DepartmentRow>[] = [
  { header: '専攻名', accessor: (r) => r.name },
];

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return new Response('Forbidden', { status: 403 });
  }

  const departments = await getDepartments();
  const csv = generateCsv(DEPARTMENT_COLUMNS, departments);

  const today = new Date().toISOString().slice(0, 10);
  const filename = `departments_${today}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
