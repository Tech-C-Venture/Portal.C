/**
 * Memberエンティティ
 * Tech.C Ventureのメンバー情報を表現するドメインエンティティ
 */

import { Email } from '../value-objects/Email';
import { StudentId } from '../value-objects/StudentId';
import { CurrentStatus } from '../value-objects/CurrentStatus';

export interface Member {
  readonly id: string;
  readonly studentId: StudentId;
  readonly name: string;
  readonly schoolEmail: Email;
  readonly gmailAddress?: Email;
  readonly enrollmentYear: number;
  readonly isRepeating: boolean;
  readonly department: string;
  readonly skills: readonly string[];
  readonly interests: readonly string[];
  readonly currentStatus?: CurrentStatus;
  readonly avatarUrl?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Memberエンティティのファクトリー関数
 */
export function createMember(params: {
  id: string;
  studentId: string;
  name: string;
  schoolEmail: string;
  gmailAddress?: string;
  enrollmentYear: number;
  isRepeating?: boolean;
  department: string;
  skills?: string[];
  interests?: string[];
  currentStatus?: { message: string; createdAt: Date };
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}): Member {
  return {
    id: params.id,
    studentId: StudentId.create(params.studentId),
    name: params.name,
    schoolEmail: Email.create(params.schoolEmail),
    gmailAddress: params.gmailAddress
      ? Email.create(params.gmailAddress)
      : undefined,
    enrollmentYear: params.enrollmentYear,
    isRepeating: params.isRepeating ?? false,
    department: params.department,
    skills: Object.freeze(params.skills ?? []),
    interests: Object.freeze(params.interests ?? []),
    currentStatus: params.currentStatus
      ? CurrentStatus.create(
          params.currentStatus.message,
          params.currentStatus.createdAt
        )
      : undefined,
    avatarUrl: params.avatarUrl,
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
  };
}

/**
 * 現在の学年を計算する
 */
export function calculateGrade(member: Member, currentDate: Date = new Date()): number {
  const currentYear = currentDate.getFullYear();
  const baseGrade = currentYear - member.enrollmentYear + 1;
  return member.isRepeating ? baseGrade - 1 : baseGrade;
}

/**
 * ステータスが有効かどうかをチェックする
 */
export function hasValidStatus(member: Member, now: Date = new Date()): boolean {
  if (!member.currentStatus) {
    return false;
  }
  return member.currentStatus.isValid(now);
}

/**
 * Memberエンティティを更新する（イミュータブル更新）
 */
export function updateMember(
  member: Member,
  updates: Partial<
    Pick<
      Member,
      | 'name'
      | 'gmailAddress'
      | 'department'
      | 'skills'
      | 'interests'
      | 'currentStatus'
      | 'avatarUrl'
      | 'isRepeating'
    >
  >
): Member {
  return {
    ...member,
    ...updates,
    skills: updates.skills ? Object.freeze([...updates.skills]) : member.skills,
    interests: updates.interests
      ? Object.freeze([...updates.interests])
      : member.interests,
    updatedAt: new Date(),
  };
}
