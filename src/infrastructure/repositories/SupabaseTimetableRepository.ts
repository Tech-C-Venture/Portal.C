/**
 * SupabaseTimetableRepository
 * ITimetableRepositoryのSupabase実装
 */

import { ITimetableRepository } from '@/application/ports/ITimetableRepository';
import { Timetable, createTimetable, createTimeSlot } from '@/domain/entities/Timetable';
import { Result, success, failure } from '@/application/common/Result';
import { DatabaseClient } from '../database/DatabaseClient';
import type { Database } from '@/types/database.types';

type TimetableRow = Database['public']['Tables']['timetables']['Row'];
type TimetableInsert = Database['public']['Tables']['timetables']['Insert'];
type TimetableUpdate = Database['public']['Tables']['timetables']['Update'];

export class SupabaseTimetableRepository implements ITimetableRepository {
  private async getClient() {
    return await DatabaseClient.getServerClient();
  }

  /**
   * DB型→ドメインエンティティ変換
   */
  private toDomain(row: TimetableRow): Timetable {
    // scheduleはJSONB型で格納されている想定
    const schedule = row.schedule as any;
    const timeSlots = Array.isArray(schedule)
      ? schedule.map((slot: any) =>
          createTimeSlot({
            id: slot.id || crypto.randomUUID(),
            dayOfWeek: slot.dayOfWeek,
            period: slot.period,
            courseName: slot.courseName,
            classroom: slot.classroom,
          })
        )
      : [];

    return createTimetable({
      id: row.id,
      memberId: row.member_id,
      grade: row.grade,
      department: row.department,
      timeSlots,
      createdAt: new Date(row.created_at!),
      updatedAt: new Date(row.updated_at!),
    });
  }

  /**
   * ドメインエンティティ→DB型変換（INSERT用）
   */
  private toInsert(timetable: Timetable): TimetableInsert {
    return {
      id: timetable.id,
      member_id: timetable.memberId,
      grade: timetable.grade,
      department: timetable.department,
      schedule: timetable.timeSlots as any,
    };
  }

  /**
   * ドメインエンティティ→DB型変換（UPDATE用）
   */
  private toUpdate(timetable: Timetable): TimetableUpdate {
    return {
      grade: timetable.grade,
      department: timetable.department,
      schedule: timetable.timeSlots as any,
      updated_at: timetable.updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<Result<Timetable | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from('timetables').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null);
        }
        return failure(new Error(error.message));
      }

      return success(this.toDomain(data));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByMemberId(memberId: string): Promise<Result<Timetable | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('timetables')
        .select('*')
        .eq('member_id', memberId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null);
        }
        return failure(new Error(error.message));
      }

      return success(this.toDomain(data));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async create(timetable: Timetable): Promise<Result<Timetable>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('timetables')
        .insert(this.toInsert(timetable))
        .select()
        .single();

      if (error) {
        return failure(new Error(error.message));
      }

      return success(this.toDomain(data));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(timetable: Timetable): Promise<Result<Timetable>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('timetables')
        .update(this.toUpdate(timetable))
        .eq('id', timetable.id)
        .select()
        .single();

      if (error) {
        return failure(new Error(error.message));
      }

      return success(this.toDomain(data));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const supabase = await this.getClient();
      const { error } = await supabase.from('timetables').delete().eq('id', id);

      if (error) {
        return failure(new Error(error.message));
      }

      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
