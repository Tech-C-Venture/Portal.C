'use server';
/* eslint-disable no-restricted-imports */

import { isAdmin } from '@/lib/auth';
import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';
import { revalidatePath } from 'next/cache';

export interface PublicTimetableFormState {
  error: string | null;
  success: string | null;
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
  const periodRaw = (formData.get('period') as string | null)?.trim();
  const courseName = (formData.get('courseName') as string | null)?.trim();
  const gradeRaw = (formData.get('grade') as string | null)?.trim();
  const major = (formData.get('major') as string | null)?.trim();
  const classroom = (formData.get('classroom') as string | null)?.trim();
  const instructor = (formData.get('instructor') as string | null)?.trim();

  if (!dayOfWeekRaw || !periodRaw || !courseName || !gradeRaw || !major) {
    return { error: '必須項目を入力してください。', success: null };
  }

  const dayOfWeek = Number(dayOfWeekRaw);
  const period = Number(periodRaw);
  const grade = Number(gradeRaw);

  if (Number.isNaN(dayOfWeek) || Number.isNaN(period) || Number.isNaN(grade)) {
    return { error: '曜日・時限・学年は数字で入力してください。', success: null };
  }

  const year = new Date().getFullYear();
  const supabase = DatabaseClient.getAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('timetables').insert({
    member_id: null,
    day_of_week: dayOfWeek,
    period,
    course_name: courseName,
    semester: null,
    year,
    is_public: true,
    grade,
    major,
    classroom: classroom || null,
    instructor: instructor || null,
  });

  if (error) {
    return { error: `登録に失敗しました: ${error.message}`, success: null };
  }

  revalidatePath('/timetable');
  revalidatePath('/admin/timetables');

  return { error: null, success: '時間割を登録しました。' };
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
