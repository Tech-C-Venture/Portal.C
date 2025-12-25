/**
 * SupabaseEventRepository
 * IEventRepositoryのSupabase実装
 */

import { IEventRepository } from '@/application/ports/IEventRepository';
import { Event, createEvent } from '@/domain/entities/Event';
import { Member } from '@/domain/entities/Member';
import { Result, success, failure } from '@/application/common/Result';
import { DatabaseClient } from '../database/DatabaseClient';
import { SupabaseMemberRepository } from './SupabaseMemberRepository';
import type { Database } from '@/types/database.types';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventInsert = Database['public']['Tables']['events']['Insert'];
type EventUpdate = Database['public']['Tables']['events']['Update'];

export class SupabaseEventRepository implements IEventRepository {
  private memberRepository = new SupabaseMemberRepository();

  private async getClient() {
    return await DatabaseClient.getServerClient();
  }

  /**
   * DB型→ドメインエンティティ変換
   */
  private toDomain(row: EventRow, participantIds: string[] = []): Event {
    const startDate = new Date(row.event_date);
    const defaultDurationMs = 60 * 60 * 1000;
    const endDate = new Date(startDate.getTime() + defaultDurationMs);
    return createEvent({
      id: row.id,
      title: row.title,
      description: row.description ?? '',
      startDate,
      endDate,
      location: row.location ?? '',
      onlineUrl: row.online_url ?? undefined,
      onlinePassword: row.online_password ?? undefined,
      capacity: row.capacity ?? undefined,
      participantIds,
      createdBy: row.created_by ?? 'system',
      createdAt: new Date(row.created_at!),
      updatedAt: new Date(row.updated_at!),
    });
  }

  /**
   * ドメインエンティティ→DB型変換（INSERT用）
   */
  private toInsert(event: Event): EventInsert {
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      event_date: event.startDate.toISOString(),
      location: event.location,
      capacity: event.capacity.isUnlimited() ? null : event.capacity.value,
      online_url: event.onlineUrl ?? null,
      online_password: event.onlinePassword ?? null,
      created_by: event.createdBy,
    };
  }

  /**
   * ドメインエンティティ→DB型変換（UPDATE用）
   */
  private toUpdate(event: Event): EventUpdate {
    return {
      title: event.title,
      description: event.description,
      event_date: event.startDate.toISOString(),
      location: event.location,
      capacity: event.capacity.isUnlimited() ? null : event.capacity.value,
      online_url: event.onlineUrl ?? null,
      online_password: event.onlinePassword ?? null,
      updated_at: event.updatedAt.toISOString(),
    };
  }

  /**
   * イベントの参加者IDリストを取得
   */
  private async getParticipantIds(eventId: string): Promise<string[]> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('event_participants')
        .select('member_id')
        .eq('event_id', eventId);

      if (error || !data) {
        return [];
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data.map((row: any) => row.member_id);
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<Result<Event | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null);
        }
        return failure(new Error(error.message));
      }

      const participantIds = await this.getParticipantIds(id);
      return success(this.toDomain(data, participantIds));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findAll(): Promise<Result<Event[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from('events').select('*').order('event_date', { ascending: false });

      if (error) {
        return failure(new Error(error.message));
      }

      const eventsWithParticipants = await Promise.all(
        data.map(async (row: EventRow) => {
          const participantIds = await this.getParticipantIds(row.id);
          return this.toDomain(row, participantIds);
        })
      );

      return success(eventsWithParticipants);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async create(event: Event): Promise<Result<Event>> {
    try {
      const supabase = await this.getClient();
      const insertData = this.toInsert(event);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('events')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        return failure(new Error(error.message));
      }

      return success(this.toDomain(data, []));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(event: Event): Promise<Result<Event>> {
    try {
      const supabase = await this.getClient();
      const updateData = this.toUpdate(event);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('events')
        .update(updateData)
        .eq('id', event.id)
        .select()
        .single();

      if (error) {
        return failure(new Error(error.message));
      }

      const participantIds = await this.getParticipantIds(event.id);
      return success(this.toDomain(data, participantIds));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.from('events').delete().eq('id', id);

      if (error) {
        return failure(new Error(error.message));
      }

      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }

  /**
   * イベントに参加登録（PostgreSQL関数経由）
   */
  async registerMember(eventId: string, memberId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc('register_for_event', {
        p_event_id: eventId,
        p_member_id: memberId,
      });

      if (error) {
        return failure(new Error(error.message));
      }

      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }

  /**
   * イベント参加解除（PostgreSQL関数経由）
   */
  async unregisterMember(eventId: string, memberId: string): Promise<Result<void>> {
    try {
      const supabase = await this.getClient();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc('unregister_from_event', {
        p_event_id: eventId,
        p_member_id: memberId,
      });

      if (error) {
        return failure(new Error(error.message));
      }

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
