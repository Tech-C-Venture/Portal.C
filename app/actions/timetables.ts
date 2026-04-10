'use server';
/* eslint-disable no-restricted-imports */

import { isAdmin } from '@/lib/auth';
import { getDb } from '@/lib/firebase/admin';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { parseCsv, validateCsvHeaders, type CsvRowError } from '@/lib/csv';
import { departmentOptions } from '@/lib/constants/departments';

export interface PublicTimetableFormState {
  error: string | null;
  success: string | null;
}

export interface TimeSlotFormState {
  error: string | null;
  success: string | null;
}

function parseTimeToMinutes(value: string): number | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/.exec(value);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return hours * 60 + minutes;
}

export async function createPublicTimetableAction(
  _prevState: PublicTimetableFormState,
  formData: FormData
): Promise<PublicTimetableFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const dayOfWeekRaw = (formData.get('dayOfWeek') as string | null)?.trim();
  const timeSlotId = (formData.get('timeSlotId') as string | null)?.trim();
  const courseName = (formData.get('courseName') as string | null)?.trim();
  const gradeRaw = (formData.get('grade') as string | null)?.trim();
  const major = (formData.get('major') as string | null)?.trim();
  const classroom = (formData.get('classroom') as string | null)?.trim();
  const instructor = (formData.get('instructor') as string | null)?.trim();

  if (!dayOfWeekRaw || !timeSlotId || !courseName || !gradeRaw || !major) {
    return { error: '必須項目を入力してください。', success: null };
  }

  const dayOfWeek = Number(dayOfWeekRaw);
  const grade = Number(gradeRaw);

  if (Number.isNaN(dayOfWeek) || Number.isNaN(grade)) {
    return { error: '曜日・学年は数字で入力してください。', success: null };
  }

  const year = new Date().getFullYear();
  const db = getDb();

  const timeSlotSnap = await db
    .collection('timetable_time_slots')
    .doc(timeSlotId)
    .get();

  if (!timeSlotSnap.exists) {
    return { error: '選択した時間帯が見つかりませんでした。', success: null };
  }

  const timeSlot = timeSlotSnap.data()!;

  try {
    await db.collection('timetables').add({
      member_id: null,
      day_of_week: dayOfWeek,
      period: timeSlot.period,
      course_name: courseName,
      semester: null,
      year,
      is_public: true,
      grade,
      major,
      classroom: classroom || null,
      instructor: instructor || null,
      time_slot_id: timeSlot.id ?? timeSlotId,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    return { error: `登録に失敗しました: ${(error as Error).message}`, success: null };
  }

  revalidatePath('/timetable');
  revalidatePath('/admin/timetables');

  return { error: null, success: '時間割を登録しました。' };
}

export async function createTimeSlotAction(
  _prevState: TimeSlotFormState,
  formData: FormData
): Promise<TimeSlotFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const periodRaw = (formData.get('period') as string | null)?.trim();
  const label = (formData.get('label') as string | null)?.trim();
  const startTime = (formData.get('startTime') as string | null)?.trim();
  const endTime = (formData.get('endTime') as string | null)?.trim();
  const isActive = formData.get('isActive') === 'on';

  if (!periodRaw || !label || !startTime || !endTime) {
    return { error: '必須項目を入力してください。', success: null };
  }

  const period = Number(periodRaw);
  if (Number.isNaN(period) || period < 1 || period > 10) {
    return { error: '時限は1〜10の数字で入力してください。', success: null };
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null) {
    return { error: '時間はHH:MM形式で入力してください。', success: null };
  }
  if (startMinutes >= endMinutes) {
    return { error: '開始時刻は終了時刻より前にしてください。', success: null };
  }

  const db = getDb();
  try {
    await db.collection('timetable_time_slots').add({
      period,
      label,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    return { error: `登録に失敗しました: ${(error as Error).message}`, success: null };
  }

  revalidatePath('/admin/timetables');

  return { error: null, success: '時間帯を登録しました。' };
}

export async function updateTimeSlotAction(
  _prevState: TimeSlotFormState,
  formData: FormData
): Promise<TimeSlotFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const timeSlotId = (formData.get('timeSlotId') as string | null)?.trim();
  const periodRaw = (formData.get('period') as string | null)?.trim();
  const label = (formData.get('label') as string | null)?.trim();
  const startTime = (formData.get('startTime') as string | null)?.trim();
  const endTime = (formData.get('endTime') as string | null)?.trim();
  const isActive = formData.get('isActive') === 'on';

  if (!timeSlotId) {
    return { error: '時間帯IDが取得できませんでした。', success: null };
  }
  if (!periodRaw || !label || !startTime || !endTime) {
    return { error: '必須項目を入力してください。', success: null };
  }

  const period = Number(periodRaw);
  if (Number.isNaN(period) || period < 1 || period > 10) {
    return { error: '時限は1〜10の数字で入力してください。', success: null };
  }

  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  if (startMinutes === null || endMinutes === null) {
    return { error: '時間はHH:MM形式で入力してください。', success: null };
  }
  if (startMinutes >= endMinutes) {
    return { error: '開始時刻は終了時刻より前にしてください。', success: null };
  }

  const db = getDb();
  try {
    await db.collection('timetable_time_slots').doc(timeSlotId).update({
      period,
      label,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    return { error: `更新に失敗しました: ${(error as Error).message}`, success: null };
  }

  revalidatePath('/admin/timetables');

  return { error: null, success: '時間帯を更新しました。' };
}

export async function deleteTimeSlotAction(formData: FormData): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('管理者権限が必要です。');
  }

  const timeSlotId = (formData.get('timeSlotId') as string | null)?.trim();
  if (!timeSlotId) {
    throw new Error('時間帯IDが取得できませんでした。');
  }

  const db = getDb();
  await db.collection('timetable_time_slots').doc(timeSlotId).delete();

  revalidatePath('/admin/timetables');
}

export async function deletePublicTimetableAction(
  formData: FormData
): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('管理者権限が必要です。');
  }

  const timetableId = (formData.get('timetableId') as string | null)?.trim();
  if (!timetableId) {
    throw new Error('時間割IDが取得できませんでした。');
  }

  const db = getDb();
  const docSnap = await db.collection('timetables').doc(timetableId).get();

  if (!docSnap.exists || !docSnap.data()?.is_public) {
    throw new Error('公開時間割が見つかりませんでした。');
  }

  await db.collection('timetables').doc(timetableId).delete();

  revalidatePath('/timetable');
  revalidatePath('/admin/timetables');
}

// --- CSV Upload ---

export interface CsvUploadState {
  error: string | null;
  errors: CsvRowError[] | null;
  success: string | null;
}

const DAY_LABEL_TO_NUMBER: Record<string, number> = {
  '日': 0, '月': 1, '火': 2, '水': 3, '木': 4, '金': 5, '土': 6,
};

const TIMETABLE_CSV_HEADERS = ['学年', '専攻', '曜日', '時限', '教科名', '教室', '担当講師'];
const TIME_SLOT_CSV_HEADERS = ['時限', 'ラベル', '開始時刻', '終了時刻', '有効'];

const validDepartments = new Set<string>(departmentOptions);

function validateTimetableRows(rows: string[][]): CsvRowError[] {
  const errors: CsvRowError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.length < 5) {
      errors.push({ row: rowNum, message: 'カラム数が不足しています。' });
      continue;
    }

    const [gradeStr, major, dayStr, periodStr, courseName] = row;

    const grade = Number(gradeStr);
    if (Number.isNaN(grade) || grade < 1 || grade > 4) {
      errors.push({ row: rowNum, message: `学年が不正です: "${gradeStr}"。1〜4の数字を指定してください。` });
    }

    if (!major || !validDepartments.has(major)) {
      errors.push({ row: rowNum, message: `専攻が不正です: "${major}"。有効な専攻名: ${departmentOptions.join(', ')}` });
    }

    if (!(dayStr in DAY_LABEL_TO_NUMBER)) {
      errors.push({ row: rowNum, message: `曜日が不正です: "${dayStr}"。日/月/火/水/木/金/土 のいずれかを指定してください。` });
    }

    const period = Number(periodStr);
    if (Number.isNaN(period) || period < 1 || period > 10) {
      errors.push({ row: rowNum, message: `時限が不正です: "${periodStr}"。1〜10の数字を指定してください。` });
    }

    if (!courseName || courseName.trim().length === 0) {
      errors.push({ row: rowNum, message: '教科名が空です。' });
    }
  }

  return errors;
}

function validateTimeSlotRows(rows: string[][]): CsvRowError[] {
  const errors: CsvRowError[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 1;

    if (row.length < 5) {
      errors.push({ row: rowNum, message: 'カラム数が不足しています。' });
      continue;
    }

    const [periodStr, label, startTime, endTime, isActiveStr] = row;

    const period = Number(periodStr);
    if (Number.isNaN(period) || period < 1 || period > 10) {
      errors.push({ row: rowNum, message: `時限が不正です: "${periodStr}"。1〜10の数字を指定してください。` });
    }

    if (!label || label.trim().length === 0) {
      errors.push({ row: rowNum, message: 'ラベルが空です。' });
    }

    const startMinutes = parseTimeToMinutes(startTime);
    if (startMinutes === null) {
      errors.push({ row: rowNum, message: `開始時刻の形式が不正です: "${startTime}"。HH:MM形式で指定してください。` });
    }

    const endMinutes = parseTimeToMinutes(endTime);
    if (endMinutes === null) {
      errors.push({ row: rowNum, message: `終了時刻の形式が不正です: "${endTime}"。HH:MM形式で指定してください。` });
    }

    if (startMinutes !== null && endMinutes !== null && startMinutes >= endMinutes) {
      errors.push({ row: rowNum, message: '開始時刻は終了時刻より前にしてください。' });
    }

    const validBooleans = ['true', 'false', '1', '0'];
    if (!validBooleans.includes(isActiveStr.toLowerCase())) {
      errors.push({ row: rowNum, message: `有効フラグが不正です: "${isActiveStr}"。true/false/1/0 のいずれかを指定してください。` });
    }
  }

  return errors;
}

export async function uploadPublicTimetableCsvAction(
  _prevState: CsvUploadState,
  formData: FormData
): Promise<CsvUploadState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', errors: null, success: null };
  }

  const file = formData.get('file') as File | null;
  if (!file || !file.name.endsWith('.csv')) {
    return { error: 'CSVファイルを選択してください。', errors: null, success: null };
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);

  const headerCheck = validateCsvHeaders(headers, TIMETABLE_CSV_HEADERS);
  if (!headerCheck.valid) {
    return { error: headerCheck.message!, errors: null, success: null };
  }

  if (rows.length === 0) {
    return { error: 'データ行がありません。', errors: null, success: null };
  }

  const rowErrors = validateTimetableRows(rows);
  if (rowErrors.length > 0) {
    return { error: null, errors: rowErrors, success: null };
  }

  const db = getDb();
  const year = new Date().getFullYear();

  // 時間帯マスターから時限→IDのマッピングを取得
  const timeSlotsSnap = await db.collection('timetable_time_slots').get();
  const periodToTimeSlotId = new Map<number, string>();
  for (const doc of timeSlotsSnap.docs) {
    periodToTimeSlotId.set(doc.data().period, doc.id);
  }

  try {
    const batch = db.batch();

    // 既存の共通時間割を全削除
    const existingSnap = await db
      .collection('timetables')
      .where('is_public', '==', true)
      .get();
    for (const doc of existingSnap.docs) {
      batch.delete(doc.ref);
    }

    // 新規データを登録
    for (const row of rows) {
      const [gradeStr, major, dayStr, periodStr, courseName, classroom, instructor] = row;
      const period = Number(periodStr);
      const ref = db.collection('timetables').doc();
      batch.set(ref, {
        member_id: null,
        day_of_week: DAY_LABEL_TO_NUMBER[dayStr],
        period,
        course_name: courseName.trim(),
        semester: null,
        year,
        is_public: true,
        grade: Number(gradeStr),
        major,
        classroom: classroom?.trim() || null,
        instructor: instructor?.trim() || null,
        time_slot_id: periodToTimeSlotId.get(period) ?? null,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    return { error: `登録に失敗しました: ${(error as Error).message}`, errors: null, success: null };
  }

  revalidatePath('/timetable');
  revalidatePath('/admin/timetables');

  return { error: null, errors: null, success: `${rows.length}件の共通時間割を登録しました。` };
}

export async function uploadTimeSlotsCsvAction(
  _prevState: CsvUploadState,
  formData: FormData
): Promise<CsvUploadState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', errors: null, success: null };
  }

  const file = formData.get('file') as File | null;
  if (!file || !file.name.endsWith('.csv')) {
    return { error: 'CSVファイルを選択してください。', errors: null, success: null };
  }

  const text = await file.text();
  const { headers, rows } = parseCsv(text);

  const headerCheck = validateCsvHeaders(headers, TIME_SLOT_CSV_HEADERS);
  if (!headerCheck.valid) {
    return { error: headerCheck.message!, errors: null, success: null };
  }

  if (rows.length === 0) {
    return { error: 'データ行がありません。', errors: null, success: null };
  }

  const rowErrors = validateTimeSlotRows(rows);
  if (rowErrors.length > 0) {
    return { error: null, errors: rowErrors, success: null };
  }

  const db = getDb();

  try {
    const batch = db.batch();

    // 既存の時間帯マスターを全削除
    const existingSnap = await db.collection('timetable_time_slots').get();
    for (const doc of existingSnap.docs) {
      batch.delete(doc.ref);
    }

    // 新規データを登録
    for (const row of rows) {
      const [periodStr, label, startTime, endTime, isActiveStr] = row;
      const ref = db.collection('timetable_time_slots').doc();
      batch.set(ref, {
        period: Number(periodStr),
        label: label.trim(),
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        is_active: isActiveStr.toLowerCase() === 'true' || isActiveStr === '1',
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
  } catch (error) {
    return { error: `登録に失敗しました: ${(error as Error).message}`, errors: null, success: null };
  }

  revalidatePath('/admin/timetables');

  return { error: null, errors: null, success: `${rows.length}件の時間帯マスターを登録しました。` };
}
