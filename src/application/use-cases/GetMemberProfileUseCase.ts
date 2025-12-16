/**
 * GetMemberProfileUseCase
 * メンバープロフィール取得ユースケース
 */

import { IMemberRepository } from '../ports/IMemberRepository';
import { MemberDTO } from '../dtos/MemberDTO';
import { MemberMapper } from '../mappers/MemberMapper';
import { Result, success, failure } from '../common/Result';

export class GetMemberProfileUseCase {
  constructor(private memberRepository: IMemberRepository) {}

  async execute(memberId: string): Promise<Result<MemberDTO, string>> {
    const result = await this.memberRepository.findById(memberId);

    if (!result.success) {
      return failure(`Failed to fetch member: ${result.error.message}`);
    }

    if (!result.value) {
      return failure(`Member not found: ${memberId}`);
    }

    return success(MemberMapper.toDTO(result.value));
  }
}
