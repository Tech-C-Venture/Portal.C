'use server';
/* eslint-disable no-restricted-imports */

import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getDb } from '@/lib/firebase/admin';
import { createEvent } from '@/domain/entities/Event';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export interface CreateEventFormState {
  error: string | null;
  success: string | null;
}

export interface RegisterEventFormState {
  error: string | null;
  success: string | null;
}

export interface UnregisterEventFormState {
  error: string | null;
  success: string | null;
}

export interface UpdateEventFormState {
  error: string | null;
  success: string | null;
}

export async function createEventAction(
  _prevState: CreateEventFormState,
  formData: FormData
): Promise<CreateEventFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const startDateRaw = (formData.get('startDate') as string | null)?.trim();
  const location = (formData.get('location') as string | null)?.trim() ?? '';
  const capacityRaw = (formData.get('capacity') as string | null)?.trim();
  const onlineUrlRaw = (formData.get('onlineUrl') as string | null)?.trim();
  const onlinePasswordRaw = (formData.get('onlinePassword') as string | null)?.trim();

  if (!title) {
    return { error: 'イベント名を入力してください。', success: null };
  }
  if (!startDateRaw) {
    return { error: '日時を入力してください。', success: null };
  }

  const startDate = new Date(startDateRaw);
  if (Number.isNaN(startDate.getTime())) {
    return { error: '日時の形式が正しくありません。', success: null };
  }

  const capacity = capacityRaw ? Number(capacityRaw) : undefined;
  if (capacityRaw && Number.isNaN(capacity)) {
    return { error: '定員は数字で入力してください。', success: null };
  }

  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: 'ユーザー情報を取得できませんでした。', success: null };
  }

  const memberRepository = container.resolve<IMemberRepository>(
    REPOSITORY_KEYS.MEMBER
  );
  const memberResult = await memberRepository.findByZitadelId(user.id);
  if (!memberResult.success || !memberResult.value) {
    return { error: 'メンバー情報を取得できませんでした。', success: null };
  }

  const createdBy = memberResult.value.id;

  const defaultDurationMs = 60 * 60 * 1000;
  const endDate = new Date(startDate.getTime() + defaultDurationMs);
  const onlineUrl = onlineUrlRaw || undefined;
  const onlinePassword = onlinePasswordRaw || undefined;

  let eventId = '';
  try {
    const event = createEvent({
      id: crypto.randomUUID(),
      title,
      description,
      startDate,
      endDate,
      location,
      onlineUrl,
      onlinePassword,
      capacity,
      createdBy,
    });
    eventId = event.id;
  } catch (error) {
    return { error: (error as Error).message, success: null };
  }

  const db = getDb();
  try {
    await db.collection('events').doc(eventId).set({
      title,
      description: description || null,
      event_date: Timestamp.fromDate(startDate),
      location: location || null,
      capacity: capacity ?? null,
      online_url: onlineUrl ?? null,
      online_password: onlinePassword ?? null,
      created_by: createdBy,
      created_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    return { error: `Failed to create event: ${(error as Error).message}`, success: null };
  }

  revalidatePath('/admin');
  revalidatePath('/events');

  redirect('/admin/events/participants');
}

export async function registerForEventAction(
  _prevState: RegisterEventFormState,
  formData: FormData
): Promise<RegisterEventFormState> {
  const eventId = (formData.get('eventId') as string | null)?.trim();
  if (!eventId) {
    return { error: 'イベントIDが取得できませんでした。', success: null };
  }

  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: 'ログインが必要です。', success: null };
  }

  const memberRepository = container.resolve<IMemberRepository>(
    REPOSITORY_KEYS.MEMBER
  );
  const memberResult = await memberRepository.findByZitadelId(user.id);
  if (!memberResult.success || !memberResult.value) {
    return { error: 'メンバー情報が見つかりませんでした。', success: null };
  }

  const memberId = memberResult.value.id;
  const db = getDb();

  // イベントの定員チェック
  const eventSnap = await db.collection('events').doc(eventId).get();
  if (!eventSnap.exists) {
    return { error: 'イベントが見つかりませんでした。', success: null };
  }
  const eventData = eventSnap.data()!;

  if (eventData.capacity !== null && eventData.capacity !== undefined) {
    const participantsSnap = await db
      .collection('event_participants')
      .where('event_id', '==', eventId)
      .get();
    if (participantsSnap.size >= eventData.capacity) {
      return { error: 'このイベントは満員です。', success: null };
    }
  }

  // 重複チェック
  const docId = `${eventId}_${memberId}`;
  const existingSnap = await db.collection('event_participants').doc(docId).get();
  if (existingSnap.exists) {
    return { error: 'すでに参加登録済みです。', success: null };
  }

  await db.collection('event_participants').doc(docId).set({
    event_id: eventId,
    member_id: memberId,
    registered_at: FieldValue.serverTimestamp(),
    participated: false,
  });

  revalidatePath('/events');
  revalidatePath('/admin');

  return { error: null, success: '参加登録しました。' };
}

export async function unregisterFromEventAction(
  _prevState: UnregisterEventFormState,
  formData: FormData
): Promise<UnregisterEventFormState> {
  const eventId = (formData.get('eventId') as string | null)?.trim();
  if (!eventId) {
    return { error: 'イベントIDが取得できませんでした。', success: null };
  }

  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: 'ログインが必要です。', success: null };
  }

  const memberRepository = container.resolve<IMemberRepository>(
    REPOSITORY_KEYS.MEMBER
  );
  const memberResult = await memberRepository.findByZitadelId(user.id);
  if (!memberResult.success || !memberResult.value) {
    return { error: 'メンバー情報が見つかりませんでした。', success: null };
  }

  const memberId = memberResult.value.id;
  const db = getDb();
  const docId = `${eventId}_${memberId}`;
  const existingSnap = await db.collection('event_participants').doc(docId).get();

  if (!existingSnap.exists) {
    return { error: '参加登録が見つかりませんでした。', success: null };
  }

  await db.collection('event_participants').doc(docId).delete();

  revalidatePath('/events');
  revalidatePath('/admin');

  return { error: null, success: '参加をキャンセルしました。' };
}

export async function updateEventAction(
  _prevState: UpdateEventFormState,
  formData: FormData
): Promise<UpdateEventFormState> {
  const admin = await isAdmin();
  if (!admin) {
    return { error: '管理者権限が必要です。', success: null };
  }

  const eventId = (formData.get('eventId') as string | null)?.trim();
  const title = (formData.get('title') as string | null)?.trim();
  const description = (formData.get('description') as string | null)?.trim() ?? '';
  const startDateRaw = (formData.get('startDate') as string | null)?.trim();
  const location = (formData.get('location') as string | null)?.trim() ?? '';
  const capacityRaw = (formData.get('capacity') as string | null)?.trim();
  const onlineUrlRaw = (formData.get('onlineUrl') as string | null)?.trim();
  const onlinePasswordRaw = (formData.get('onlinePassword') as string | null)?.trim();

  if (!eventId) {
    return { error: 'イベントIDが取得できませんでした。', success: null };
  }
  if (!title) {
    return { error: 'イベント名を入力してください。', success: null };
  }
  if (!startDateRaw) {
    return { error: '日時を入力してください。', success: null };
  }

  const startDate = new Date(startDateRaw);
  if (Number.isNaN(startDate.getTime())) {
    return { error: '日時の形式が正しくありません。', success: null };
  }

  const capacity = capacityRaw ? Number(capacityRaw) : undefined;
  if (capacityRaw && Number.isNaN(capacity)) {
    return { error: '定員は数字で入力してください。', success: null };
  }

  const defaultDurationMs = 60 * 60 * 1000;
  const endDate = new Date(startDate.getTime() + defaultDurationMs);
  const onlineUrl = onlineUrlRaw || undefined;
  const onlinePassword = onlinePasswordRaw || undefined;

  try {
    createEvent({
      id: eventId,
      title,
      description,
      startDate,
      endDate,
      location,
      onlineUrl,
      onlinePassword,
      capacity,
      createdBy: 'system',
    });
  } catch (error) {
    return { error: (error as Error).message, success: null };
  }

  const db = getDb();
  try {
    await db.collection('events').doc(eventId).update({
      title,
      description: description || null,
      event_date: Timestamp.fromDate(startDate),
      location: location || null,
      capacity: capacity ?? null,
      online_url: onlineUrl ?? null,
      online_password: onlinePassword ?? null,
      updated_at: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    return { error: `更新に失敗しました: ${(error as Error).message}`, success: null };
  }

  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath(`/events/${eventId}`);

  redirect(`/admin/events/${eventId}/participants`);
}

export async function deleteEventAction(
  formData: FormData
): Promise<void> {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('管理者権限が必要です。');
  }

  const eventId = (formData.get('eventId') as string | null)?.trim();
  if (!eventId) {
    throw new Error('イベントIDが取得できませんでした。');
  }

  const db = getDb();

  // 参加者レコードも削除
  const participantSnap = await db
    .collection('event_participants')
    .where('event_id', '==', eventId)
    .get();

  const batch = db.batch();
  participantSnap.docs.forEach((doc) => batch.delete(doc.ref));
  batch.delete(db.collection('events').doc(eventId));
  await batch.commit();

  revalidatePath('/events');
  revalidatePath('/admin');
  revalidatePath('/admin/events');
  revalidatePath('/admin/events/edit');

  redirect('/admin/events/participants');
}
