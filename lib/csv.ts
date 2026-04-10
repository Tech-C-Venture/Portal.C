/**
 * CSV共通ユーティリティ
 * CSV生成・パース・バリデーション機能を提供する
 */

const BOM = '\uFEFF';

export interface CsvColumnDef<T> {
  readonly header: string;
  readonly accessor: (row: T) => string | number | boolean;
}

export interface CsvParseResult {
  readonly headers: string[];
  readonly rows: string[][];
}

export interface CsvRowError {
  readonly row: number;
  readonly message: string;
}

/**
 * フィールド値をCSV用にエスケープする
 * カンマ・ダブルクォート・改行が含まれる場合はダブルクォートで囲む
 */
function escapeField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * データ配列からUTF-8 BOM付きCSV文字列を生成する
 */
export function generateCsv<T>(
  columns: readonly CsvColumnDef<T>[],
  data: readonly T[]
): string {
  const headerRow = columns.map((col) => escapeField(col.header)).join(',');

  const dataRows = data.map((item) =>
    columns.map((col) => escapeField(String(col.accessor(item)))).join(',')
  );

  return BOM + [headerRow, ...dataRows].join('\r\n') + '\r\n';
}

/**
 * CSV文字列をヘッダーとデータ行に分解する
 * BOMが存在する場合は自動除去する
 */
export function parseCsv(csvText: string): CsvParseResult {
  let text = csvText;
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }

  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);

  return { headers, rows };
}

/**
 * CSV行をフィールド配列にパースする
 * ダブルクォート囲みに対応
 */
function parseRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i += 2;
        } else {
          inQuotes = false;
          i++;
        }
      } else {
        current += char;
        i++;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
        i++;
      } else if (char === ',') {
        fields.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }
  }

  fields.push(current.trim());
  return fields;
}

/**
 * パースされたヘッダー行が期待するカラム定義と一致するかを検証する
 */
export function validateCsvHeaders(
  actual: string[],
  expected: string[]
): { valid: boolean; message?: string } {
  if (actual.length !== expected.length) {
    return {
      valid: false,
      message: `カラム数が一致しません。期待: ${expected.join(', ')} (${expected.length}列)`,
    };
  }

  for (let i = 0; i < expected.length; i++) {
    if (actual[i] !== expected[i]) {
      return {
        valid: false,
        message: `${i + 1}列目のヘッダーが不正です。期待: "${expected[i]}", 実際: "${actual[i]}"。期待するカラム: ${expected.join(', ')}`,
      };
    }
  }

  return { valid: true };
}
