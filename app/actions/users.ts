'use server';

import { isAdmin } from '@/lib/auth';
import { createZitadelUser, assignUserGrant } from '@/lib/zitadel/admin-api';
import { parseCsv, validateCsvHeaders, type CsvRowError, type CsvUploadState } from '@/lib/csv';

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

const CSV_INVITE_HEADERS = ['姓', '名', 'メールアドレス', 'ロール'];

interface InviteRow {
  familyName: string;
  givenName: string;
  email: string;
  role: 'admin' | 'member';
  rowNumber: number;
}

export async function inviteMembersCsvAction(
  _prevState: CsvUploadState,
  formData: FormData
): Promise<CsvUploadState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', errors: null, success: null };
  }

  const file = formData.get('file') as File | null;
  if (!file || file.size === 0) {
    return { error: 'CSVファイルを選択してください。', errors: null, success: null };
  }

  const csvText = await file.text();
  const { headers, rows } = parseCsv(csvText);

  const headerCheck = validateCsvHeaders(headers, CSV_INVITE_HEADERS);
  if (!headerCheck.valid) {
    return { error: headerCheck.message ?? 'ヘッダーが不正です。', errors: null, success: null };
  }

  if (rows.length === 0) {
    return { error: 'データ行がありません。', errors: null, success: null };
  }

  // Validate all rows first
  const validationErrors: CsvRowError[] = [];
  const parsed: InviteRow[] = [];
  const asciiOnly = /^[a-zA-Z]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const seenEmails = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // 1-indexed header=1, data starts at 2

    if (row.length < 3) {
      validationErrors.push({ row: rowNum, message: 'カラム数が不足しています。' });
      continue;
    }

    const familyName = row[0].trim();
    const givenName = row[1].trim();
    const email = row[2].trim();
    const roleRaw = (row[3] ?? '').trim().toLowerCase();

    if (!familyName) {
      validationErrors.push({ row: rowNum, message: '姓が空です。' });
    } else if (!asciiOnly.test(familyName)) {
      validationErrors.push({ row: rowNum, message: '姓は英字（a-z）のみで入力してください。' });
    }

    if (!givenName) {
      validationErrors.push({ row: rowNum, message: '名が空です。' });
    } else if (!asciiOnly.test(givenName)) {
      validationErrors.push({ row: rowNum, message: '名は英字（a-z）のみで入力してください。' });
    }

    if (!email) {
      validationErrors.push({ row: rowNum, message: 'メールアドレスが空です。' });
    } else if (!emailRegex.test(email)) {
      validationErrors.push({ row: rowNum, message: 'メールアドレスの形式が正しくありません。' });
    } else if (seenEmails.has(email.toLowerCase())) {
      validationErrors.push({ row: rowNum, message: `メールアドレスが重複しています: ${email}` });
    }

    if (validationErrors.length === 0 || validationErrors[validationErrors.length - 1]?.row !== rowNum) {
      seenEmails.add(email.toLowerCase());
      parsed.push({
        familyName,
        givenName,
        email,
        role: roleRaw === 'admin' ? 'admin' : 'member',
        rowNumber: rowNum,
      });
    }
  }

  if (validationErrors.length > 0) {
    return { error: null, errors: validationErrors, success: null };
  }

  // Process invitations
  const succeeded: string[] = [];
  const errors: CsvRowError[] = [];

  for (const entry of parsed) {
    const username = `${entry.givenName.toLowerCase()}.${entry.familyName.toLowerCase()}`;
    let userId: string;
    try {
      const result = await createZitadelUser(entry.givenName, entry.familyName, entry.email, username);
      userId = result.userId;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ユーザー作成に失敗しました。';
      errors.push({ row: entry.rowNumber, message: `ユーザー作成エラー: ${message}` });
      continue;
    }

    const roleKeys = entry.role === 'admin' ? ['admin', 'member'] : ['member'];
    try {
      await assignUserGrant(userId, roleKeys);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ロール付与に失敗しました。';
      errors.push({
        row: entry.rowNumber,
        message: `${entry.email} を作成しましたが、ロール付与に失敗しました: ${message}`,
      });
      succeeded.push(`${entry.familyName} ${entry.givenName}（${entry.email}）※ロール手動設定要`);
      continue;
    }

    const roleLabel = entry.role === 'admin' ? 'admin' : 'member';
    succeeded.push(`${entry.familyName} ${entry.givenName}（${entry.email}, ${roleLabel}）`);
  }

  const successMsg = succeeded.length > 0
    ? `${succeeded.length}名を招待しました:\n${succeeded.join('\n')}`
    : null;

  return {
    error: null,
    errors: errors.length > 0 ? errors : null,
    success: successMsg,
  };
}
