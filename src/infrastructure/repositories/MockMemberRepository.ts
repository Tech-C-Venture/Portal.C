/**
 * MockMemberRepository
 * IMemberRepositoryのモック実装（開発・テスト用）
 */

import { IMemberRepository } from '@/application/ports/IMemberRepository';
import { Member, createMember } from '@/domain/entities/Member';
import { Result, success, failure } from '@/application/common/Result';

export class MockMemberRepository implements IMemberRepository {
  private members: Map<string, Member>;

  constructor() {
    // モックデータの初期化
    this.members = new Map();
    this.initializeMockData();
  }

  /**
   * モックデータの初期化
   */
  private initializeMockData(): void {
    const mockMembers: Member[] = [
      createMember({
        id: 'mock-1',
        studentId: 'S2021001',
        name: '山田太郎',
        schoolEmail: 'yamada@example.ac.jp',
        gmailAddress: 'yamada.taro@gmail.com',
        enrollmentYear: 2021,
        isRepeating: false,
        department: '情報工学科',
        skills: ['TypeScript', 'React', 'Node.js'],
        interests: ['Web開発', 'AI'],
        currentStatus: {
          message: 'プロジェクト進行中！',
          createdAt: new Date('2025-01-15'),
        },
        createdAt: new Date('2021-04-01'),
        updatedAt: new Date('2025-01-15'),
      }),
      createMember({
        id: 'mock-2',
        studentId: 'S2022002',
        name: '佐藤花子',
        schoolEmail: 'sato@example.ac.jp',
        gmailAddress: 'sato.hanako@gmail.com',
        enrollmentYear: 2022,
        isRepeating: false,
        department: '情報工学科',
        skills: ['Python', 'Django', 'PostgreSQL'],
        interests: ['バックエンド開発', 'データベース設計'],
        currentStatus: {
          message: '新機能実装中',
          createdAt: new Date('2025-01-14'),
        },
        createdAt: new Date('2022-04-01'),
        updatedAt: new Date('2025-01-14'),
      }),
      createMember({
        id: 'mock-3',
        studentId: 'S2023003',
        name: '鈴木一郎',
        schoolEmail: 'suzuki@example.ac.jp',
        enrollmentYear: 2023,
        isRepeating: false,
        department: 'デザイン学科',
        skills: ['Figma', 'Adobe XD', 'UI/UX'],
        interests: ['UI/UXデザイン', 'プロトタイピング'],
        createdAt: new Date('2023-04-01'),
        updatedAt: new Date('2025-01-10'),
      }),
    ];

    mockMembers.forEach((member) => {
      this.members.set(member.id, member);
    });
  }

  async findById(id: string): Promise<Result<Member | null>> {
    try {
      const member = this.members.get(id);
      return success(member ?? null);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findAll(): Promise<Result<Member[]>> {
    try {
      const members = Array.from(this.members.values());
      return success(members);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByEmail(email: string): Promise<Result<Member | null>> {
    try {
      const member = Array.from(this.members.values()).find(
        (m) => m.schoolEmail.value === email
      );
      return success(member ?? null);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async findByStudentId(studentId: string): Promise<Result<Member | null>> {
    try {
      const member = Array.from(this.members.values()).find(
        (m) => m.studentId.value === studentId
      );
      return success(member ?? null);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async create(member: Member): Promise<Result<Member>> {
    try {
      // IDの重複チェック
      if (this.members.has(member.id)) {
        return failure(new Error(`Member with id ${member.id} already exists`));
      }

      // 学籍番号の重複チェック
      const existingByStudentId = Array.from(this.members.values()).find(
        (m) => m.studentId.value === member.studentId.value
      );
      if (existingByStudentId) {
        return failure(
          new Error(`Member with studentId ${member.studentId.value} already exists`)
        );
      }

      // メールアドレスの重複チェック
      const existingByEmail = Array.from(this.members.values()).find(
        (m) => m.schoolEmail.value === member.schoolEmail.value
      );
      if (existingByEmail) {
        return failure(
          new Error(`Member with email ${member.schoolEmail.value} already exists`)
        );
      }

      this.members.set(member.id, member);
      return success(member);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async update(member: Member): Promise<Result<Member>> {
    try {
      // 存在チェック
      if (!this.members.has(member.id)) {
        return failure(new Error(`Member with id ${member.id} not found`));
      }

      this.members.set(member.id, member);
      return success(member);
    } catch (error) {
      return failure(error as Error);
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      // 存在チェック
      if (!this.members.has(id)) {
        return failure(new Error(`Member with id ${id} not found`));
      }

      this.members.delete(id);
      return success(undefined);
    } catch (error) {
      return failure(error as Error);
    }
  }
}
