'use server';

import { revalidatePath } from 'next/cache';
import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';
import { getCurrentUser } from '@/lib/auth';

/**
 * 公開されている時間割を自分のプライベート時間割に追加するサーバーアクション
 * @param timetableId 追加する公開時間割のID
 */
export async function addCourseToMyTimetable(timetableId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 1. 現在のユーザー情報を取得
    const user = await getCurrentUser();
    if (!user?.id) {
      return { success: false, message: 'ログインしていません。' };
    }

    // 2. ZITADEL IDからメンバーIDを取得
    const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
    const memberResult = await memberRepository.findByZitadelId(user.id);

    if (!memberResult.success || !memberResult.value) {
      return { success: false, message: 'メンバー情報が見つかりません。' };
    }
    const memberId = memberResult.value.id;

    // 3. Supabaseクライアントでprivate_timetablesテーブルにデータを挿入
    const supabase = await DatabaseClient.getServerClient();

    // 既に登録済みでないか確認
    const { data: existing, error: existingError } = await supabase
      .from('private_timetables')
      .select('id')
      .eq('member_id', memberId)
      .eq('timetable_id', timetableId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') { // PGRST116は行がない場合のエラーコード
      throw new Error(`既存データの確認中にエラーが発生しました: ${existingError.message}`);
    }
    if (existing) {
      return { success: false, message: 'すでに追加されています。' };
    }

    // データ挿入
    const { error: insertError } = await supabase
      .from('private_timetables')
      .insert({
        member_id: memberId,
        timetable_id: timetableId,
      });

    if (insertError) {
      throw new Error(`時間割の追加に失敗しました: ${insertError.message}`);
    }

    // 4. キャッシュを再検証してUIを更新
    revalidatePath('/timetable');
    
    return { success: true, message: 'マイ時間割に追加しました！' };

  } catch (error) {
    console.error('addCourseToMyTimetable error:', error);
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました。';
    return { success: false, message: errorMessage };
  }
}