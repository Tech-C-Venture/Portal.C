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
type TagRow = Database['public']['Tables']['tags']['Row'];
type MemberTagInsert = Database['public']['Tables']['member_tags']['Insert'];
type SupabaseDbClient = Awaited<ReturnType<typeof DatabaseClient.getServerClient>>;

export class SupabaseMemberRepository implements IMemberRepository {
  private async getClient() {
    return await DatabaseClient.getServerClient();
  }

  private normalizeTags(values: readonly string[]): string[] {
    const unique = new Set(
      values
        .map((value) => value.trim())
        .filter((value) => value.length > 0)
    );
    return Array.from(unique);
  }

  private async syncMemberTags(
    supabase: SupabaseDbClient,
    memberId: string,
    skills: readonly string[],
    interests: readonly string[]
  ): Promise<Result<{ skills: string[]; interests: string[] }>> {
    const normalizedSkills = this.normalizeTags(skills);
    const normalizedInterests = this.normalizeTags(interests);
    const allNames = Array.from(new Set([...normalizedSkills, ...normalizedInterests]));

    if (allNames.length > 0) {
      const { error: upsertError } = await (supabase as any)
        .from('tags')
        .upsert(
          [
            ...normalizedSkills.map((name) => ({ name, category: 'skill' })),
            ...normalizedInterests.map((name) => ({ name, category: 'interest' })),
          ],
          { onConflict: 'name', ignoreDuplicates: true }
        );

      if (upsertError) {
        return failure(new Error(upsertError.message));
      }
    }

    const { error: deleteError } = await (supabase as any)
      .from('member_tags')
      .delete()
      .eq('member_id', memberId);

    if (deleteError) {
      return failure(new Error(deleteError.message));
    }

    if (allNames.length === 0) {
      return success({ skills: normalizedSkills, interests: normalizedInterests });
    }

    const { data: tags, error: tagsError } = await supabase
      .from('tags')
      .select('id,name,category')
      .in('name', allNames);

    if (tagsError) {
      return failure(new Error(tagsError.message));
    }

    const tagRows = tags as TagRow[];
    const memberTags = tagRows
      .filter((tag) => {
        if (tag.category === 'skill') return normalizedSkills.includes(tag.name);
        if (tag.category === 'interest') return normalizedInterests.includes(tag.name);
        return false;
      })
      .map((tag) => ({
        member_id: memberId,
        tag_id: tag.id,
      })) as MemberTagInsert[];

    if (memberTags.length > 0) {
      const { error: memberTagsError } = await (supabase as any)
        .from('member_tags')
        .insert(memberTags);

      if (memberTagsError) {
        return failure(new Error(memberTagsError.message));
      }
    }

    return success({ skills: normalizedSkills, interests: normalizedInterests });
  }

  private async getTagsByMemberIds(
    supabase: SupabaseDbClient,
    memberIds: string[]
  ): Promise<Map<string, { skills: string[]; interests: string[] }>> {
    const map = new Map<string, { skills: string[]; interests: string[] }>();
    if (memberIds.length === 0) return map;

    const { data, error } = await (supabase as any)
      .from('member_tags')
      .select('member_id, tag:tags(name, category)')
      .in('member_id', memberIds);

    if (error) {
      return map;
    }

    for (const row of data as Array<{
      member_id: string;
      tag: { name: string; category: string } | null;
    }>) {
      if (!row.tag) continue;
      const current = map.get(row.member_id) ?? { skills: [], interests: [] };
      if (row.tag.category === 'skill') {
        current.skills.push(row.tag.name);
      } else if (row.tag.category === 'interest') {
        current.interests.push(row.tag.name);
      }
      map.set(row.member_id, current);
    }

    return map;
  }

  /**
   * DB型→ドメインエンティティ変換
   */
  private toDomain(
    row: MemberRow,
    tags?: { skills: string[]; interests: string[] }
  ): Member {
    return createMember({
      id: row.id,
      zitadelId: row.zitadel_id,
      studentId: row.student_id ?? undefined,
      name: row.name,
      schoolEmail: row.school_email,
      gmailAddress: row.gmail_address ?? undefined,
      enrollmentYear: row.enrollment_year,
      isRepeating: row.is_repeating ?? false,
      repeatYears: row.repeat_years ?? undefined,
      department: row.major ?? '',
      skills: tags?.skills ?? [], // タグテーブルから取得
      interests: tags?.interests ?? [], // タグテーブルから取得
      onboardingCompleted: row.onboarding_completed ?? false,
      currentStatus: row.current_status
        ? {
            message: row.current_status,
            createdAt: new Date(row.status_updated_at!),
          }
        : undefined,
      avatarUrl: row.avatar_url ?? undefined,
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
      zitadel_id: member.zitadelId,
      student_id: member.studentId?.value ?? null,
      name: member.name,
      school_email: member.schoolEmail.value,
      gmail_address: member.gmailAddress?.value,
      enrollment_year: member.enrollmentYear,
      is_repeating: member.isRepeating,
      repeat_years: member.repeatYears ?? null,
      major: member.department,
      onboarding_completed: member.onboardingCompleted,
      current_status: member.currentStatus?.message,
      status_updated_at: member.currentStatus?.createdAt.toISOString(),
      avatar_url: member.avatarUrl ?? null,
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
      student_id: member.studentId?.value ?? null,
      enrollment_year: member.enrollmentYear,
      is_repeating: member.isRepeating,
      repeat_years: member.repeatYears ?? null,
      major: member.department,
      onboarding_completed: member.onboardingCompleted,
      current_status: member.currentStatus?.message,
      status_updated_at: member.currentStatus?.createdAt.toISOString(),
      avatar_url: member.avatarUrl ?? null,
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

      const tagsMap = await this.getTagsByMemberIds(supabase, [data.id]);
      return success(this.toDomain(data, tagsMap.get(data.id)));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByZitadelId(zitadelId: string): Promise<Result<Member | null>> {
    try {
      const supabase = await this.getClient();
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('zitadel_id', zitadelId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return success(null);
        }
        return failure(new Error(error.message));
      }

      const tagsMap = await this.getTagsByMemberIds(supabase, [data.id]);
      return success(this.toDomain(data, tagsMap.get(data.id)));
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

      const tagsMap = await this.getTagsByMemberIds(
        supabase,
        data.map((row) => row.id)
      );
      return success(data.map((row) => this.toDomain(row, tagsMap.get(row.id))));
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
        .eq('student_id', studentId)
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
      const { data, error } = await (supabase as any)
        .from('members')
        .insert(this.toInsert(member))
        .select()
        .single();

      if (error) {
        return failure(new Error(error.message));
      }

      const tagResult = await this.syncMemberTags(
        supabase,
        data.id,
        member.skills,
        member.interests
      );
      if (!tagResult.success) {
        return failure(tagResult.error);
      }

      return success(this.toDomain(data, tagResult.value));
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(member: Member): Promise<Result<Member>> {
    try {
      const supabase = DatabaseClient.getAdminClient();
      const { data, error } = await (supabase as any)
        .from('members')
        .update(this.toUpdate(member))
        .eq('id', member.id)
        .select()
        .single();

      if (error) {
        return failure(new Error(error.message));
      }

      const tagResult = await this.syncMemberTags(
        supabase,
        data.id,
        member.skills,
        member.interests
      );
      if (!tagResult.success) {
        return failure(tagResult.error);
      }

      return success(this.toDomain(data, tagResult.value));
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
