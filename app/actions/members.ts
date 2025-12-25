'use server';
/* eslint-disable no-restricted-imports */

import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import { MemberMapper } from '@/application/mappers/MemberMapper';
import type { MemberDTO } from '@/application/dtos/MemberDTO';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { getCurrentUser } from '@/lib/auth';
import { USE_CASE_KEYS } from '@/infrastructure/di/keys';
import type { UpdateMemberProfileUseCase } from '@/application/use-cases/UpdateMemberProfileUseCase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import { DatabaseClient } from '@/infrastructure/database/DatabaseClient';
import { Email } from '@/domain/value-objects/Email';

export interface MemberProfileFormState {
  error: string | null;
  success: string | null;
  avatarUrl: string | null;
}

export interface AdminGmailFormState {
  error: string | null;
  success: string | null;
}

async function signAvatarUrl(
  avatarUrl: string | null | undefined
): Promise<string | undefined> {
  if (!avatarUrl) return undefined;

  try {
    const url = new URL(avatarUrl);
    const publicPrefix = '/storage/v1/object/public/';
    const signedPrefix = '/storage/v1/object/sign/';
    const prefix = url.pathname.startsWith(publicPrefix)
      ? publicPrefix
      : url.pathname.startsWith(signedPrefix)
        ? signedPrefix
        : null;

    if (!prefix) return avatarUrl;

    const rest = url.pathname.slice(prefix.length);
    const [bucket, ...pathParts] = rest.split('/');
    if (!bucket || pathParts.length === 0) return avatarUrl;

    const path = pathParts.join('/');
    const supabase = DatabaseClient.getAdminClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (error || !data?.signedUrl) return avatarUrl;

    return data.signedUrl;
  } catch {
    return avatarUrl;
  }
}

export async function getMemberListAction(): Promise<MemberDTO[]> {
  const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
  const result = await memberRepository.findAll();

  if (!result.success) {
    throw new Error(`Failed to fetch members: ${result.error.message}`);
  }

  const dtos = MemberMapper.toDTOList(result.value);
  const signedDtos = await Promise.all(
    dtos.map(async (member) => ({
      ...member,
      avatarUrl: await signAvatarUrl(member.avatarUrl),
    }))
  );
  return signedDtos;
}

export async function getCurrentMemberProfileAction(): Promise<MemberDTO> {
  const user = await getCurrentUser();
  if (!user?.id) {
    throw new Error('Not authenticated');
  }

  const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
  const result = await memberRepository.findByZitadelId(user.id);

  if (!result.success) {
    throw new Error(`Failed to fetch member: ${result.error.message}`);
  }

  if (!result.value) {
    throw new Error(`Member not found for zitadel_id: ${user.id}`);
  }

  const dto = MemberMapper.toDTO(result.value);
  return { ...dto, avatarUrl: await signAvatarUrl(dto.avatarUrl) };
}

export async function updateCurrentMemberProfileAction(
  _prevState: MemberProfileFormState,
  formData: FormData
): Promise<MemberProfileFormState> {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: '認証が必要です。再ログインしてください。', success: null, avatarUrl: null };
  }

  const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
  const memberResult = await memberRepository.findByZitadelId(user.id);
  if (!memberResult.success) {
    return {
      error: `メンバー取得に失敗しました: ${memberResult.error.message}`,
      success: null,
      avatarUrl: null,
    };
  }
  if (!memberResult.value) {
    return { error: 'メンバー情報が見つかりませんでした。', success: null, avatarUrl: null };
  }

  let avatarUrl = memberResult.value.avatarUrl ?? null;

  const mode = formData.get('mode');
  const lockedName = memberResult.value.name?.trim();
  const studentId = (formData.get('studentId') as string | null)?.trim();
  const department = (formData.get('department') as string | null)?.trim();
  const enrollmentYearRaw = (formData.get('enrollmentYear') as string | null)?.trim();
  const currentStatusMessage = (formData.get('currentStatusMessage') as string | null)?.trim();
  const gmailAddress = (formData.get('gmailAddress') as string | null)?.trim();
  const skillsRaw = (formData.get('skills') as string | null) ?? '';
  const interestsRaw = (formData.get('interests') as string | null) ?? '';
  const isRepeating = formData.get('isRepeating') === 'on';
  const repeatYearsRaw = (formData.get('repeatYears') as string | null)?.trim();
  const avatarFile = formData.get('avatar');

  const enrollmentYear = enrollmentYearRaw ? Number(enrollmentYearRaw) : undefined;
  if (enrollmentYearRaw && Number.isNaN(enrollmentYear)) {
    return { error: '入学年度は数字で入力してください。', success: null, avatarUrl };
  }

  const repeatYearsParsed = repeatYearsRaw ? Number(repeatYearsRaw) : undefined;
  if (repeatYearsRaw && Number.isNaN(repeatYearsParsed)) {
    return { error: '留年年数は数字で入力してください。', success: null, avatarUrl };
  }
  const repeatYears = isRepeating ? repeatYearsParsed : null;

  const skills = skillsRaw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const interests = interestsRaw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
  const hasNewAvatar = avatarFile instanceof File && avatarFile.size > 0;

  if (mode === 'onboarding') {
    if (!lockedName) {
      return {
        error: '名前が取得できませんでした。再ログインしてください。',
        success: null,
        avatarUrl,
      };
    }
    if (!studentId) return { error: '学籍番号を入力してください。', success: null, avatarUrl };
    if (!gmailAddress) {
      return { error: '私用Gmailアドレスを入力してください。', success: null, avatarUrl };
    }
    if (!department) return { error: '所属専攻を入力してください。', success: null, avatarUrl };
    if (!enrollmentYear) {
      return { error: '入学年度を入力してください。', success: null, avatarUrl };
    }
    if (skills.length === 0) {
      return { error: 'スキルタグを1つ以上入力してください。', success: null, avatarUrl };
    }
    if (interests.length === 0) {
      return { error: '興味タグを1つ以上入力してください。', success: null, avatarUrl };
    }
    if (isRepeating && !repeatYears) {
      return { error: '留年年数を入力してください。', success: null, avatarUrl };
    }
    if (!avatarUrl && !hasNewAvatar) {
      return { error: 'アイコン画像を登録してください。', success: null, avatarUrl };
    }
  }

  if (hasNewAvatar) {
    const supabase = await DatabaseClient.getServerClient();
    const fileExtension =
      ((avatarFile as File).name?.split('.').pop() ||
        (avatarFile as File).type?.split('/').pop() ||
        'png')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '') || 'png';
    const storagePath = `avatars/${memberResult.value.id}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from('TCV-images')
      .upload(storagePath, avatarFile as File, {
        upsert: true,
        contentType: (avatarFile as File).type || undefined,
      });

    if (uploadError) {
      return {
        error: `アイコンのアップロードに失敗しました: ${uploadError.message}`,
        success: null,
        avatarUrl,
      };
    }

    const { data } = supabase.storage.from('TCV-images').getPublicUrl(storagePath);
    avatarUrl = data.publicUrl;
  }

  const useCase = container.resolve<UpdateMemberProfileUseCase>(
    USE_CASE_KEYS.UPDATE_MEMBER_PROFILE
  );

  const result = await useCase.execute(memberResult.value.id, {
    studentId: mode === 'onboarding' ? studentId || undefined : undefined,
    gmailAddress: gmailAddress || undefined,
    department: department || undefined,
    enrollmentYear,
    currentStatusMessage: currentStatusMessage || undefined,
    skills,
    interests,
    isRepeating,
    repeatYears,
    onboardingCompleted: mode === 'onboarding' ? true : undefined,
    avatarUrl: avatarUrl ?? undefined,
  });

  if (!result.success) {
    return { error: result.error, success: null, avatarUrl };
  }

  const nextAvatarUrl = result.value.avatarUrl ?? avatarUrl ?? null;
  const signedAvatarUrl = await signAvatarUrl(nextAvatarUrl);

  revalidatePath('/profile');
  revalidatePath('/onboarding');
  revalidatePath('/');

  const redirectTo = formData.get('redirectTo');
  if (redirectTo && typeof redirectTo === 'string') {
    redirect(redirectTo);
  }

  return { error: null, success: '保存しました。', avatarUrl: signedAvatarUrl ?? null };
}

export async function updateMemberGmailAction(
  _prevState: AdminGmailFormState,
  formData: FormData
): Promise<AdminGmailFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const schoolEmailRaw = (formData.get('schoolEmail') as string | null)?.trim();
  const gmailRaw = (formData.get('gmailAddress') as string | null)?.trim();

  if (!schoolEmailRaw) {
    return { error: '学校メールアドレスを入力してください。', success: null };
  }
  if (!gmailRaw) {
    return { error: '私用Gmailアドレスを入力してください。', success: null };
  }

  try {
    Email.create(schoolEmailRaw);
    Email.create(gmailRaw);
  } catch (error) {
    return { error: (error as Error).message, success: null };
  }

  const supabase = DatabaseClient.getAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('members')
    .update({ gmail_address: gmailRaw.toLowerCase() })
    .eq('school_email', schoolEmailRaw.toLowerCase())
    .select('id');

  if (error) {
    return { error: `更新に失敗しました: ${error.message}`, success: null };
  }

  const updatedCount = Array.isArray(data) ? data.length : 0;
  if (updatedCount === 0) {
    return { error: '該当するメンバーが見つかりませんでした。', success: null };
  }

  return { error: null, success: `私用Gmailを更新しました（${updatedCount}件）。` };
}
