'use server';
/* eslint-disable no-restricted-imports */

import { container } from '@/infrastructure/di/setup';
import { REPOSITORY_KEYS } from '@/infrastructure/di/keys';
import { MemberMapper } from '@/application/mappers/MemberMapper';
import type { MemberDTO } from '@/application/dtos/MemberDTO';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';

export async function getMemberListAction(): Promise<MemberDTO[]> {
  const memberRepository = container.resolve<IMemberRepository>(REPOSITORY_KEYS.MEMBER);
  const result = await memberRepository.findAll();

  if (!result.success) {
    throw new Error(`Failed to fetch members: ${result.error.message}`);
  }

  return MemberMapper.toDTOList(result.value);
}
