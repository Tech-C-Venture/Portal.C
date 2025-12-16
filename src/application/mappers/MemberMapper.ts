/**
 * MemberMapper
 * MemberエンティティとMemberDTOの相互変換
 */

import { Member, calculateGrade } from '@/domain/entities/Member';
import { MemberDTO } from '../dtos/MemberDTO';

export class MemberMapper {
  static toDTO(member: Member): MemberDTO {
    return {
      id: member.id,
      studentId: member.studentId.value,
      name: member.name,
      schoolEmail: member.schoolEmail.value,
      gmailAddress: member.gmailAddress?.value,
      enrollmentYear: member.enrollmentYear,
      isRepeating: member.isRepeating,
      department: member.department,
      skills: [...member.skills],
      interests: [...member.interests],
      currentStatus: member.currentStatus
        ? {
            message: member.currentStatus.message,
            createdAt: member.currentStatus.createdAt.toISOString(),
            expiresAt: member.currentStatus.expiresAt.toISOString(),
          }
        : undefined,
      avatarUrl: member.avatarUrl,
      grade: calculateGrade(member),
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString(),
    };
  }

  static toDTOList(members: Member[]): MemberDTO[] {
    return members.map((member) => this.toDTO(member));
  }
}
