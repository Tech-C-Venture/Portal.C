/**
 * IEventRepository
 * イベントリポジトリのポートインターフェース
 */

import { Event } from '@/domain/entities/Event';
import { Member } from '@/domain/entities/Member';
import { Result } from '../common/Result';

export interface IEventRepository {
  findById(id: string): Promise<Result<Event | null>>;
  findAll(): Promise<Result<Event[]>>;
  create(event: Event): Promise<Result<Event>>;
  update(event: Event): Promise<Result<Event>>;
  delete(id: string): Promise<Result<void>>;

  // イベント参加管理
  registerMember(eventId: string, memberId: string): Promise<Result<void>>;
  unregisterMember(eventId: string, memberId: string): Promise<Result<void>>;
  getParticipants(eventId: string): Promise<Result<Member[]>>;
}
