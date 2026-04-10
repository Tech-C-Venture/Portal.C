import { isAdmin } from '@/lib/auth';
import { getPublicTimetables, getDepartmentNames } from '@/app/admin/_data';
import ExcelJS from 'exceljs';

export const dynamic = 'force-dynamic';

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;
const GRADES = [1, 2, 3, 4];

const SHEET_COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: '曜日', key: 'day', width: 8 },
  { header: '時限', key: 'period', width: 8 },
  { header: '教科名', key: 'courseName', width: 25 },
  { header: '教室', key: 'classroom', width: 15 },
  { header: '担当講師', key: 'instructor', width: 15 },
];

function applyHeaderStyle(sheet: ExcelJS.Worksheet) {
  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF3F4F6' },
  };
}

export async function GET() {
  const admin = await isAdmin();
  if (!admin) {
    return new Response('Forbidden', { status: 403 });
  }

  const [timetables, departmentNames] = await Promise.all([
    getPublicTimetables(),
    getDepartmentNames(),
  ]);

  // 既存データを学年×専攻でグルーピング
  const dataMap = new Map<string, typeof timetables>();
  for (const entry of timetables) {
    const key = `${entry.grade ?? '?'}年_${entry.major ?? '未設定'}`;
    const list = dataMap.get(key) ?? [];
    list.push(entry);
    dataMap.set(key, list);
  }

  const workbook = new ExcelJS.Workbook();

  // 専攻マスター×学年で全シートを生成（データがなくても空シートを作成）
  for (const dept of departmentNames) {
    for (const grade of GRADES) {
      const sheetName = `${grade}年_${dept}`;
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = SHEET_COLUMNS;
      applyHeaderStyle(sheet);

      const entries = dataMap.get(sheetName) ?? [];
      for (const entry of entries) {
        sheet.addRow({
          day: DAY_LABELS[entry.dayOfWeek] ?? '',
          period: entry.period,
          courseName: entry.courseName,
          classroom: entry.classroom ?? '',
          instructor: entry.instructor ?? '',
        });
      }

      // 使用済みキーを除去
      dataMap.delete(sheetName);
    }
  }

  // マスターにない学年×専攻のデータがあれば追加シートとして出力
  for (const [sheetName, entries] of dataMap) {
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = SHEET_COLUMNS;
    applyHeaderStyle(sheet);

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

  // シートが1つもない場合（専攻マスター未登録＆データなし）
  if (workbook.worksheets.length === 0) {
    const sheet = workbook.addWorksheet('時間割');
    sheet.columns = SHEET_COLUMNS;
    applyHeaderStyle(sheet);
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
