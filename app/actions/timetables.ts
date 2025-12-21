'use server';
/* eslint-disable no-restricted-imports */

import { isAdmin } from '@/lib/auth';
import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';
import { revalidatePath } from 'next/cache';

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
  const supabase = DatabaseClient.getAdminClient();
  const { data: timeSlot, error: timeSlotError } = await (supabase as any)
    .from('timetable_time_slots')
    .select('id, period')
    .eq('id', timeSlotId)
    .maybeSingle();

  if (timeSlotError) {
    return { error: `時間帯の取得に失敗しました: ${timeSlotError.message}`, success: null };
  }
  if (!timeSlot) {
    return { error: '選択した時間帯が見つかりませんでした。', success: null };
  }

  const { error } = await (supabase as any).from('timetables').insert({
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
    time_slot_id: timeSlot.id,
  });

  if (error) {
    return { error: `登録に失敗しました: ${error.message}`, success: null };
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

  const supabase = DatabaseClient.getAdminClient();
  const { error } = await (supabase as any)
    .from('timetable_time_slots')
    .insert({
      period,
      label,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
    });

  if (error) {
    return { error: `登録に失敗しました: ${error.message}`, success: null };
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

  const supabase = DatabaseClient.getAdminClient();
  const { error } = await (supabase as any)
    .from('timetable_time_slots')
    .update({
      period,
      label,
      start_time: startTime,
      end_time: endTime,
      is_active: isActive,
    })
    .eq('id', timeSlotId);

  if (error) {
    return { error: `更新に失敗しました: ${error.message}`, success: null };
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

  const supabase = DatabaseClient.getAdminClient();
  const { error } = await (supabase as any)
    .from('timetable_time_slots')
    .delete()
    .eq('id', timeSlotId);

  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`);
  }

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

  const supabase = DatabaseClient.getAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('timetables')
    .delete()
    .eq('id', timetableId)
    .eq('is_public', true);

  if (error) {
    throw new Error(`削除に失敗しました: ${error.message}`);
  }

  revalidatePath('/timetable');
  revalidatePath('/admin/timetables');
}
