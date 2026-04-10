import { isAdmin } from '@/lib/auth';
import { generateCsv, type CsvColumnDef } from '@/lib/csv';

export const dynamic = 'force-dynamic';

type InviteTemplateRow = {
  familyName: string;
  givenName: string;
  email: string;
  role: string;
};

const INVITE_COLUMNS: readonly CsvColumnDef<InviteTemplateRow>[] = [
  { header: '姓', accessor: (r) => r.familyName },
  { header: '名', accessor: (r) => r.givenName },
  { header: 'メールアドレス', accessor: (r) => r.email },
  { header: 'ロール', accessor: (r) => r.role },
];

const SAMPLE_DATA: InviteTemplateRow[] = [
  { familyName: 'Yamada', givenName: 'Taro', email: 'taro.yamada@example.com', role: '' },
  { familyName: 'Suzuki', givenName: 'Hanako', email: 'hanako.suzuki@example.com', role: 'admin' },
];

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return new Response('Forbidden', { status: 403 });
  }

  const csv = generateCsv(INVITE_COLUMNS, SAMPLE_DATA);

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="invite_template.csv"',
    },
  });
}
