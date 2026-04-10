'use server';

import { isAdmin } from '@/lib/auth';
import { createZitadelUser, assignUserGrant, sendPasswordResetEmail } from '@/lib/zitadel/admin-api';

export interface InviteUserFormState {
  error: string | null;
  success: string | null;
}

export async function inviteUserAction(
  _prevState: InviteUserFormState,
  formData: FormData
): Promise<InviteUserFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const givenName = (formData.get('givenName') as string | null)?.trim();
  const familyName = (formData.get('familyName') as string | null)?.trim();
  const email = (formData.get('email') as string | null)?.trim();

  if (!givenName) {
    return { error: '名（givenName）を入力してください。', success: null };
  }
  if (!familyName) {
    return { error: '姓（familyName）を入力してください。', success: null };
  }
  if (!email) {
    return { error: 'メールアドレスを入力してください。', success: null };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'メールアドレスの形式が正しくありません。', success: null };
  }

  let userId: string;
  try {
    const result = await createZitadelUser(givenName, familyName, email);
    userId = result.userId;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ユーザー作成に失敗しました。';
    return { error: `ユーザー作成エラー: ${message}`, success: null };
  }

  try {
    await assignUserGrant(userId, ['member']);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'ロール付与に失敗しました。';
    return {
      error: null,
      success: `ユーザー（${email}）を作成しましたが、memberロールの付与に失敗しました: ${message}。ZITADELコンソールで手動設定してください。`,
    };
  }

  try {
    await sendPasswordResetEmail(userId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'メール送信に失敗しました。';
    return {
      error: null,
      success: `ユーザー（${email}）を作成・ロール付与しましたが、パスワード設定メールの送信に失敗しました: ${message}。ZITADELコンソールから手動で再送してください。`,
    };
  }

  return {
    error: null,
    success: `${familyName} ${givenName}（${email}）を招待しました。パスワード設定メールが送信されます。`,
  };
}
