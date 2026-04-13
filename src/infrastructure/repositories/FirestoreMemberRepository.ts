/**
 * FirestoreMemberRepository
 * IMemberRepositoryのFirestore実装
 */

import { IMemberRepository } from '@/application/ports/IMemberRepository';
import { Member, createMember } from '@/domain/entities/Member';
import { Result, success, failure } from '@/application/common/Result';
import { DatastoreClient } from '../database/DatastoreClient';
import { FieldValue, type Firestore, Timestamp } from 'firebase-admin/firestore';

interface MemberDoc {
  zitadel_id: string;
  student_id: string | null;
  name: string;
  school_email: string;
  gmail_address: string | null;
  enrollment_year: number;
  is_repeating: boolean;
  repeat_years: number | null;
  major: string | null;
  onboarding_completed: boolean;
  current_status: string | null;
  status_updated_at: Timestamp | null;
  avatar_url: string | null;
  skills: string[];
  interests: string[];
  roles?: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

export class FirestoreMemberRepository implements IMemberRepository {
  private getClient(): Firestore {
    return DatastoreClient.getClient();
  }

  private collection() {
    return this.getClient().collection('members');
  }

  private tagsCollection() {
    return this.getClient().collection('tags');
  }

  private normalizeTags(values: readonly string[]): string[] {
    const unique = new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    );
    return Array.from(unique);
  }

  private async ensureTagsExist(
    skills: string[],
    interests: string[]
  ): Promise<void> {
    const db = this.getClient();
    const batch = db.batch();

    for (const name of skills) {
      const ref = this.tagsCollection().doc(`skill_${name}`);
      batch.set(ref, { name, category: 'skill', created_at: FieldValue.serverTimestamp() }, { merge: true });
    }
    for (const name of interests) {
      const ref = this.tagsCollection().doc(`interest_${name}`);
      batch.set(ref, { name, category: 'interest', created_at: FieldValue.serverTimestamp() }, { merge: true });
    }

    await batch.commit();
  }

  /**
   * Firestoreドキュメント→ドメインエンティティ変換
   */
  private toDomain(id: string, doc: MemberDoc): Member {
    return createMember({
      id,
      zitadelId: doc.zitadel_id,
      studentId: doc.student_id ?? undefined,
      name: doc.name,
      schoolEmail: doc.school_email,
      gmailAddress: doc.gmail_address ?? undefined,
      enrollmentYear: doc.enrollment_year,
      isRepeating: doc.is_repeating ?? false,
      repeatYears: doc.repeat_years ?? undefined,
      department: doc.major ?? '',
      skills: doc.skills ?? [],
      interests: doc.interests ?? [],
      onboardingCompleted: doc.onboarding_completed ?? false,
      currentStatus: doc.current_status
        ? {
            message: doc.current_status,
            createdAt: doc.status_updated_at?.toDate() ?? new Date(),
          }
        : undefined,
      avatarUrl: doc.avatar_url ?? undefined,
      roles: doc.roles ?? [],
      createdAt: doc.created_at?.toDate() ?? new Date(),
      updatedAt: doc.updated_at?.toDate() ?? new Date(),
    });
  }

  /**
   * ドメインエンティティ→Firestoreドキュメント変換
   */
  private toDoc(member: Member): MemberDoc {
    return {
      zitadel_id: member.zitadelId,
      student_id: member.studentId?.value ?? null,
      name: member.name,
      school_email: member.schoolEmail.value,
      gmail_address: member.gmailAddress?.value ?? null,
      enrollment_year: member.enrollmentYear,
      is_repeating: member.isRepeating,
      repeat_years: member.repeatYears ?? null,
      major: member.department || null,
      onboarding_completed: member.onboardingCompleted,
      current_status: member.currentStatus?.message ?? null,
      status_updated_at: member.currentStatus
        ? Timestamp.fromDate(member.currentStatus.createdAt)
        : null,
      avatar_url: member.avatarUrl ?? null,
      skills: [...member.skills],
      interests: [...member.interests],
      roles: [...member.roles],
      created_at: Timestamp.fromDate(member.createdAt),
      updated_at: Timestamp.fromDate(member.updatedAt),
    };
  }

  async findById(id: string): Promise<Result<Member | null>> {
    try {
      const snap = await this.collection().doc(id).get();
      if (!snap.exists) {
        return success(null);
      }
      return success(this.toDomain(snap.id, snap.data() as MemberDoc));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByZitadelId(zitadelId: string): Promise<Result<Member | null>> {
    try {
      const snap = await this.collection()
        .where('zitadel_id', '==', zitadelId)
        .limit(1)
        .get();

      if (snap.empty) {
        return success(null);
      }

      const doc = snap.docs[0];
      return success(this.toDomain(doc.id, doc.data() as MemberDoc));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findAll(): Promise<Result<Member[]>> {
    try {
      const snap = await this.collection().get();
      const members = snap.docs.map((doc) =>
        this.toDomain(doc.id, doc.data() as MemberDoc)
      );
      return success(members);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByEmail(email: string): Promise<Result<Member | null>> {
    try {
      const snap = await this.collection()
        .where('school_email', '==', email)
        .limit(1)
        .get();

      if (snap.empty) {
        return success(null);
      }

      const doc = snap.docs[0];
      return success(this.toDomain(doc.id, doc.data() as MemberDoc));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByStudentId(studentId: string): Promise<Result<Member | null>> {
    try {
      const snap = await this.collection()
        .where('student_id', '==', studentId)
        .limit(1)
        .get();

      if (snap.empty) {
        return success(null);
      }

      const doc = snap.docs[0];
      return success(this.toDomain(doc.id, doc.data() as MemberDoc));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async create(member: Member): Promise<Result<Member>> {
    try {
      const doc = this.toDoc(member);
      await this.collection().doc(member.id).set(doc);

      const skills = this.normalizeTags(member.skills);
      const interests = this.normalizeTags(member.interests);
      if (skills.length > 0 || interests.length > 0) {
        await this.ensureTagsExist(skills, interests);
      }

      return success(member);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(member: Member): Promise<Result<Member>> {
    try {
      const doc = this.toDoc(member);
      await this.collection().doc(member.id).set(doc, { merge: true });

      const skills = this.normalizeTags(member.skills);
      const interests = this.normalizeTags(member.interests);
      if (skills.length > 0 || interests.length > 0) {
        await this.ensureTagsExist(skills, interests);
      }

      return success(member);
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
