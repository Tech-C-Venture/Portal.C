/**
 * UpdateMemberProfileUseCase
 * メンバープロフィール更新ユースケース
 */

import { IMemberRepository } from '../ports/IMemberRepository';
import { MemberDTO } from '../dtos/MemberDTO';
import { MemberMapper } from '../mappers/MemberMapper';
import { updateMember } from '@/domain/entities/Member';
import { CurrentStatus } from '@/domain/value-objects/CurrentStatus';
import { Email } from '@/domain/value-objects/Email';
import { StudentId } from '@/domain/value-objects/StudentId';
import { Result, success, failure } from '../common/Result';

interface UpdateMemberInput {
  name?: string;
  studentId?: string;
  gmailAddress?: string;
  department?: string;
  skills?: string[];
  interests?: string[];
  currentStatusMessage?: string;
  avatarUrl?: string;
  isRepeating?: boolean;
  enrollmentYear?: number;
  repeatYears?: number | null;
  onboardingCompleted?: boolean;
}

export class UpdateMemberProfileUseCase {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(memberId: string, input: UpdateMemberInput): Promise<Result<MemberDTO, string>> {
    // 既存メンバー取得
    const memberResult = await this.memberRepository.findById(memberId);
    if (!memberResult.success) {
      return failure(`Failed to fetch member: ${memberResult.error.message}`);
    }

    if (!memberResult.value) {
      return failure(`Member not found: ${memberId}`);
    }

    const member = memberResult.value;

    // 更新データ準備
    const updates: {
      name?: string;
      studentId?: StudentId;
      gmailAddress?: Email;
      department?: string;
      skills?: string[];
      interests?: string[];
      currentStatus?: CurrentStatus;
      avatarUrl?: string;
      isRepeating?: boolean;
      enrollmentYear?: number;
      repeatYears?: number;
      onboardingCompleted?: boolean;
    } = {};

    if (input.name !== undefined) updates.name = input.name;
    if (input.studentId !== undefined) {
      updates.studentId = StudentId.create(input.studentId);
    }
    if (input.gmailAddress !== undefined)
      updates.gmailAddress = Email.create(input.gmailAddress);
    if (input.department !== undefined) updates.department = input.department;
    if (input.skills !== undefined) updates.skills = input.skills;
    if (input.interests !== undefined) updates.interests = input.interests;
    if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;
    if (input.isRepeating !== undefined) updates.isRepeating = input.isRepeating;
    if (input.enrollmentYear !== undefined) updates.enrollmentYear = input.enrollmentYear;
    if (input.repeatYears !== undefined) {
      updates.repeatYears = input.repeatYears ?? undefined;
    }
    if (input.onboardingCompleted !== undefined) {
      updates.onboardingCompleted = input.onboardingCompleted;
    }
    if (input.currentStatusMessage !== undefined) {
      updates.currentStatus = CurrentStatus.create(input.currentStatusMessage);
    }

    // ドメインエンティティ更新
    const updatedMember = updateMember(member, updates);

    // リポジトリに保存
    const saveResult = await this.memberRepository.update(updatedMember);
    if (!saveResult.success) {
      return failure(`Failed to update member: ${saveResult.error.message}`);
    }

    return success(MemberMapper.toDTO(saveResult.value));
  }
}
