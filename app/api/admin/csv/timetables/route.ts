import { isAdmin } from '@/lib/auth';
import { getPublicTimetables } from '@/app/admin/_data';
import ExcelJS from 'exceljs';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

const SHEET_COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: '曜日', key: 'day', width: 8 },
  { header: '時限', key: 'period', width: 8 },
  { header: '教科名', key: 'courseName', width: 25 },
  { header: '教室', key: 'classroom', width: 15 },
  { header: '担当講師', key: 'instructor', width: 15 },
];

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return new Response('Forbidden', { status: 403 });
  }

  const timetables = await getPublicTimetables();

  // 学年×専攻ごとにグルーピング
  const groups = new Map<string, typeof timetables>();
  for (const entry of timetables) {
    const key = `${entry.grade ?? '?'}年_${entry.major ?? '未設定'}`;
    const list = groups.get(key) ?? [];
    list.push(entry);
    groups.set(key, list);
  }

  const workbook = new ExcelJS.Workbook();

  if (groups.size === 0) {
    // データなしの場合は空シートを1枚作成
    const sheet = workbook.addWorksheet('時間割');
    sheet.columns = SHEET_COLUMNS;
  } else {
    // 学年×専攻ごとにシートを作成
    for (const [sheetName, entries] of groups) {
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = SHEET_COLUMNS;

      // ヘッダー行のスタイル
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF3F4F6' },
      };

      for (const entry of entries) {
        sheet.addRow({
          day: DAY_LABELS[entry.dayOfWeek] ?? '',
          period: entry.period,
          courseName: entry.courseName,
          classroom: entry.classroom ?? '',
          instructor: entry.instructor ?? '',
        });
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const today = new Date().toISOString().slice(0, 10);
  const filename = `timetables_${today}.xlsx`;

  return new Response(Buffer.from(buffer), {
    headers: {
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
