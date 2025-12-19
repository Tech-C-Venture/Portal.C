/**
 * IMemberRepository
 * メンバーリポジトリのポートインターフェース
 */

import { Member } from '@/domain/entities/Member';
import { Result } from '../common/Result';

export interface IMemberRepository {
  findById(id: string): Promise<Result<Member | null>>;
  findByZitadelId(zitadelId: string): Promise<Result<Member | null>>;
  findAll(): Promise<Result<Member[]>>;
  findByEmail(email: string): Promise<Result<Member | null>>;
  findByStudentId(studentId: string): Promise<Result<Member | null>>;
  create(member: Member): Promise<Result<Member>>;
  update(member: Member): Promise<Result<Member>>;
  delete(id: string): Promise<Result<void>>;
}
