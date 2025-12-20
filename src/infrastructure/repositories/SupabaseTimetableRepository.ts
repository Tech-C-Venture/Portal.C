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
    // 各行は単一のタイムスロットを表す
    const timeSlots = [
      createTimeSlot({
        id: row.id,
        dayOfWeek: row.day_of_week,
        period: row.period,
        courseName: row.course_name,
        classroom: '',  // classroom field doesn't exist in current schema
      })
    ];

    return createTimetable({
      id: row.id,
      memberId: row.member_id,
      grade: 1,  // grade field doesn't exist in current schema
      department: '',  // department field doesn't exist in current schema
      timeSlots,
      createdAt: new Date(row.created_at!),
      updatedAt: new Date(row.updated_at!),
    });
  }

  /**
   * ドメインエンティティ→DB型変換（INSERT用）
   */
  private toInsert(timetable: Timetable): TimetableInsert {
    // Take the first timeslot from the timetable
    const firstSlot = timetable.timeSlots[0];
    return {
      id: timetable.id,
      member_id: timetable.memberId,
      day_of_week: firstSlot?.dayOfWeek ?? 1,
      period: firstSlot?.period ?? 1,
      course_name: firstSlot?.courseName ?? '',
      semester: null,  // TODO: add semester logic
      year: new Date().getFullYear(),
    };
  }

  /**
   * ドメインエンティティ→DB型変換（UPDATE用）
   */
  private toUpdate(timetable: Timetable): TimetableUpdate {
    const firstSlot = timetable.timeSlots[0];
    return {
      day_of_week: firstSlot?.dayOfWeek,
      period: firstSlot?.period,
      course_name: firstSlot?.courseName,
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
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
