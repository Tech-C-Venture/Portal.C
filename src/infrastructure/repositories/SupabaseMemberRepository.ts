/**
 * SupabaseMemberRepository
 * IMemberRepositoryのSupabase実装
 */

import { IMemberRepository } from '@/application/ports/IMemberRepository';
import { Member, createMember } from '@/domain/entities/Member';
import { Result, success, failure } from '@/application/common/Result';
import { DatabaseClient } from '../database/DatabaseClient';
import type { Database } from '@/types/database.types';

type MemberRow = Database['public']['Tables']['members']['Row'];
type MemberInsert = Database['public']['Tables']['members']['Insert'];
type MemberUpdate = Database['public']['Tables']['members']['Update'];

export class SupabaseMemberRepository implements IMemberRepository {
  private async getClient() {
    return await DatabaseClient.getServerClient();
  }

  /**
   * DB型→ドメインエンティティ変換
   */
  private toDomain(row: MemberRow): Member {
    return createMember({
      id: row.id,
      studentId: row.zitadel_id, // 仮: zitadel_idを学籍番号として使用
      name: row.name,
      schoolEmail: row.school_email,
      gmailAddress: row.gmail_address ?? undefined,
      enrollmentYear: row.enrollment_year,
      isRepeating: row.is_repeating ?? false,
      department: row.major ?? '',
      skills: [], // タグテーブルから取得が必要
      interests: [], // タグテーブルから取得が必要
      currentStatus: row.current_status
        ? {
            message: row.current_status,
            createdAt: new Date(row.status_updated_at!),
          }
        : undefined,
      createdAt: new Date(row.created_at!),
      updatedAt: new Date(row.updated_at!),
    });
  }

  /**
   * ドメインエンティティ→DB型変換（INSERT用）
   */
  private toInsert(member: Member): MemberInsert {
    return {
      id: member.id,
      zitadel_id: member.studentId.value,
      name: member.name,
      school_email: member.schoolEmail.value,
      gmail_address: member.gmailAddress?.value,
      enrollment_year: member.enrollmentYear,
      is_repeating: member.isRepeating,
      major: member.department,
      current_status: member.currentStatus?.message,
      status_updated_at: member.currentStatus?.createdAt.toISOString(),
    };
  }

  /**
   * ドメインエンティティ→DB型変換（UPDATE用）
   */
  private toUpdate(member: Member): MemberUpdate {
    return {
      name: member.name,
      school_email: member.schoolEmail.value,
      gmail_address: member.gmailAddress?.value,
      enrollment_year: member.enrollmentYear,
      is_repeating: member.isRepeating,
      major: member.department,
      current_status: member.currentStatus?.message,
      status_updated_at: member.currentStatus?.createdAt.toISOString(),
      updated_at: member.updatedAt.toISOString(),
    };
  }

  async findById(id: string): Promise<Result<Member | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from('members').select('*').eq('id', id).single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Not found
          return success(null);
        }
        return failure(new Error(error.message));
      }

      return success(this.toDomain(data));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findAll(): Promise<Result<Member[]>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase.from('members').select('*');

      if (error) {
        return failure(new Error(error.message));
      }

      return success(data.map((row) => this.toDomain(row)));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByEmail(email: string): Promise<Result<Member | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('school_email', email)
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

  async findByStudentId(studentId: string): Promise<Result<Member | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('zitadel_id', studentId)
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

  async create(member: Member): Promise<Result<Member>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('members')
        .insert(this.toInsert(member))
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

  async update(member: Member): Promise<Result<Member>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('members')
        .update(this.toUpdate(member))
        .eq('id', member.id)
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
      const { error } = await supabase.from('members').delete().eq('id', id);

      if (error) {
        return failure(new Error(error.message));
      }

      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
