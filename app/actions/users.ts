'use server';

import { isAdmin } from '@/lib/auth';
import { createZitadelUser, assignUserGrant } from '@/lib/zitadel/admin-api';

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
    return { error: '名（Given Name）を入力してください。', success: null };
  }
  if (!familyName) {
    return { error: '姓（Family Name）を入力してください。', success: null };
  }

  const asciiOnly = /^[a-zA-Z]+$/;
  if (!asciiOnly.test(givenName)) {
    return { error: '名は英字（a-z）のみで入力してください。', success: null };
  }
  if (!asciiOnly.test(familyName)) {
    return { error: '姓は英字（a-z）のみで入力してください。', success: null };
  }

  if (!email) {
    return { error: 'メールアドレスを入力してください。', success: null };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'メールアドレスの形式が正しくありません。', success: null };
  }

  const username = `${givenName.toLowerCase()}.${familyName.toLowerCase()}`;

  let userId: string;
  try {
    const result = await createZitadelUser(givenName, familyName, email, username);
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

  return {
    error: null,
    success: `${familyName} ${givenName}（${email}）を招待しました。認証メールが送信されます。`,
  };
}
