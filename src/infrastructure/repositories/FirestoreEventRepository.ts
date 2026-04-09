/**
 * FirestoreEventRepository
 * IEventRepositoryのFirestore実装
 */

import { IEventRepository } from '@/application/ports/IEventRepository';
import { Event, createEvent } from '@/domain/entities/Event';
import { Member } from '@/domain/entities/Member';
import { Result, success, failure } from '@/application/common/Result';
import { DatastoreClient } from '../database/DatastoreClient';
import { FirestoreMemberRepository } from './FirestoreMemberRepository';
import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';

interface EventDoc {
  title: string;
  description: string | null;
  event_date: Timestamp;
  location: string | null;
  online_url: string | null;
  online_password: string | null;
  capacity: number | null;
  created_by: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

interface EventParticipantDoc {
  event_id: string;
  member_id: string;
  registered_at: Timestamp;
  participated: boolean;
}

export class FirestoreEventRepository implements IEventRepository {
  private memberRepository = new FirestoreMemberRepository();

  private getClient(): Firestore {
    return DatastoreClient.getClient();
  }

  private collection() {
    return this.getClient().collection('events');
  }

  private participantsCollection() {
    return this.getClient().collection('event_participants');
  }

  /**
   * Firestoreドキュメント→ドメインエンティティ変換
   */
  private toDomain(id: string, doc: EventDoc, participantIds: string[] = []): Event {
    const startDate = doc.event_date.toDate();
    const defaultDurationMs = 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + defaultDurationMs);
    return createEvent({
      id,
      title: doc.title,
      description: doc.description ?? '',
      startDate,
      endDate,
      location: doc.location ?? '',
      onlineUrl: doc.online_url ?? undefined,
      onlinePassword: doc.online_password ?? undefined,
      capacity: doc.capacity ?? undefined,
      participantIds,
      createdBy: doc.created_by ?? 'system',
      createdAt: doc.created_at?.toDate() ?? new Date(),
      updatedAt: doc.updated_at?.toDate() ?? new Date(),
    });
  }

  /**
   * ドメインエンティティ→Firestoreドキュメント変換
   */
  private toDoc(event: Event): EventDoc {
    return {
      title: event.title,
      description: event.description || null,
      event_date: Timestamp.fromDate(event.startDate),
      location: event.location || null,
      online_url: event.onlineUrl ?? null,
      online_password: event.onlinePassword ?? null,
      capacity: event.capacity.isUnlimited() ? null : event.capacity.value,
      created_by: event.createdBy,
      created_at: Timestamp.fromDate(event.createdAt),
      updated_at: Timestamp.fromDate(event.updatedAt),
    };
  }

  /**
   * イベントの参加者IDリストを取得
   */
  private async getParticipantIds(eventId: string): Promise<string[]> {
    try {
      const snap = await this.participantsCollection()
        .where('event_id', '==', eventId)
        .get();

      return snap.docs.map((doc) => (doc.data() as EventParticipantDoc).member_id);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Result<Event | null>> {
    try {
      const snap = await this.collection().doc(id).get();

      if (!snap.exists) {
        return success(null);
      }

      const participantIds = await this.getParticipantIds(id);
      return success(this.toDomain(snap.id, snap.data() as EventDoc, participantIds));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findAll(): Promise<Result<Event[]>> {
    try {
      const snap = await this.collection()
        .orderBy('event_date', 'desc')
        .get();

      const events = await Promise.all(
        snap.docs.map(async (doc) => {
          const participantIds = await this.getParticipantIds(doc.id);
          return this.toDomain(doc.id, doc.data() as EventDoc, participantIds);
        })
      );

      return success(events);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async create(event: Event): Promise<Result<Event>> {
    try {
      const doc = this.toDoc(event);
      await this.collection().doc(event.id).set(doc);
      return success(this.toDomain(event.id, doc, []));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(event: Event): Promise<Result<Event>> {
    try {
      const doc = this.toDoc(event);
      await this.collection().doc(event.id).set(doc, { merge: true });
      const participantIds = await this.getParticipantIds(event.id);
      return success(this.toDomain(event.id, doc, participantIds));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      // 参加者レコードも削除
      const participantSnap = await this.participantsCollection()
        .where('event_id', '==', id)
        .get();

      const db = this.getClient();
      const batch = db.batch();
      participantSnap.docs.forEach((doc) => batch.delete(doc.ref));
      batch.delete(this.collection().doc(id));
      await batch.commit();

      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }

  /**
   * イベントに参加登録
   */
  async registerMember(eventId: string, memberId: string): Promise<Result<void>> {
    try {
      const docId = `${eventId}_${memberId}`;
      await this.participantsCollection().doc(docId).set({
        event_id: eventId,
        member_id: memberId,
        registered_at: FieldValue.serverTimestamp(),
        participated: false,
      });
      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }

  /**
   * イベント参加解除
   */
  async unregisterMember(eventId: string, memberId: string): Promise<Result<void>> {
    try {
      const docId = `${eventId}_${memberId}`;
      await this.participantsCollection().doc(docId).delete();
      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }

  /**
   * イベント参加者を取得
   */
  async getParticipants(eventId: string): Promise<Result<Member[]>> {
    try {
      const participantIds = await this.getParticipantIds(eventId);
      const members: Member[] = [];

      for (const memberId of participantIds) {
        const result = await this.memberRepository.findById(memberId);
        if (result.success && result.value) {
          members.push(result.value);
        }
      }

      return success(members);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
