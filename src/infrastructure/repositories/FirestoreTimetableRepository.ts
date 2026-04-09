/**
 * FirestoreTimetableRepository
 * ITimetableRepositoryのFirestore実装
 */

import { ITimetableRepository } from '@/application/ports/ITimetableRepository';
import { Timetable, createTimetable, createTimeSlot } from '@/domain/entities/Timetable';
import { Result, success, failure } from '@/application/common/Result';
import { DatastoreClient } from '../database/DatastoreClient';
import { Timestamp, type Firestore } from 'firebase-admin/firestore';

interface TimetableDoc {
  member_id: string | null;
  day_of_week: number;
  period: number;
  course_name: string;
  semester: string | null;
  year: number;
  is_public: boolean;
  grade: number | null;
  major: string | null;
  classroom: string | null;
  instructor: string | null;
  time_slot_id: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export class FirestoreTimetableRepository implements ITimetableRepository {
  private getClient(): Firestore {
    return DatastoreClient.getClient();
  }

  private collection() {
    return this.getClient().collection('timetables');
  }

  /**
   * Firestoreドキュメント→ドメインエンティティ変換
   */
  private toDomain(id: string, doc: TimetableDoc): Timetable {
    const timeSlots = [
      createTimeSlot({
        id,
        dayOfWeek: doc.day_of_week,
        period: doc.period,
        courseName: doc.course_name,
        classroom: doc.classroom ?? undefined,
      })
    ];

    return createTimetable({
      id,
      memberId: doc.member_id ?? '',
      grade: doc.grade ?? 1,
      department: doc.major ?? '',
      timeSlots,
      createdAt: doc.created_at?.toDate() ?? new Date(),
      updatedAt: doc.updated_at?.toDate() ?? new Date(),
    });
  }

  /**
   * ドメインエンティティ→Firestoreドキュメント変換
   */
  private toDoc(timetable: Timetable): TimetableDoc {
    const firstSlot = timetable.timeSlots[0];
    return {
      member_id: timetable.memberId || null,
      day_of_week: firstSlot?.dayOfWeek ?? 1,
      period: firstSlot?.period ?? 1,
      course_name: firstSlot?.courseName ?? '',
      semester: null,
      year: new Date().getFullYear(),
      is_public: false,
      grade: timetable.grade,
      major: timetable.department || null,
      classroom: firstSlot?.classroom ?? null,
      instructor: null,
      time_slot_id: null,
      created_at: Timestamp.fromDate(timetable.createdAt),
      updated_at: Timestamp.fromDate(timetable.updatedAt),
    };
  }

  async findById(id: string): Promise<Result<Timetable | null>> {
    try {
      const snap = await this.collection().doc(id).get();

      if (!snap.exists) {
        return success(null);
      }

      return success(this.toDomain(snap.id, snap.data() as TimetableDoc));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByMemberId(memberId: string): Promise<Result<Timetable | null>> {
    try {
      const snap = await this.collection()
        .where('member_id', '==', memberId)
        .limit(1)
        .get();

      if (snap.empty) {
        return success(null);
      }

      const doc = snap.docs[0];
      return success(this.toDomain(doc.id, doc.data() as TimetableDoc));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async create(timetable: Timetable): Promise<Result<Timetable>> {
    try {
      const doc = this.toDoc(timetable);
      await this.collection().doc(timetable.id).set(doc);
      return success(timetable);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(timetable: Timetable): Promise<Result<Timetable>> {
    try {
      const doc = this.toDoc(timetable);
      await this.collection().doc(timetable.id).set(doc, { merge: true });
      return success(timetable);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      await this.collection().doc(id).delete();
      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
