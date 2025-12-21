import { SupabaseMemberRepository } from '@/infrastructure/repositories/SupabaseMemberRepository';
import type { Member } from '@/domain/entities/Member';

// insertedMembersData は members テーブルへの insert で挿入されたデータのみを追跡する
let insertedMembersData: any = null;

jest.mock('@/infrastructure/database/DatabaseClient', () => {
  // 各テーブルごとのモックデータを定義
  const mockMemberRow = {
    id: 'member-1',
    zitadel_id: 'S2024001',
    name: 'Alice',
    school_email: 'alice@example.ed.jp',
    gmail_address: null,
    enrollment_year: 2023,
    is_repeating: false,
    major: 'CS',
    current_status: null,
    status_updated_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockTagRows = [
    { member_id: 'member-1', tag: { id: 'tag-1', name: 'TypeScript', category: 'skill' } },
    { member_id: 'member-1', tag: { id: 'tag-2', name: 'React', category: 'skill' } },
    { member_id: 'member-1', tag: { id: 'tag-3', name: 'AI', category: 'interest' } },
  ];

  const mockTagsTableData = [
    { id: 'tag-1', name: 'TypeScript', category: 'skill' },
    { id: 'tag-2', name: 'React', category: 'skill' },
    { id: 'tag-3', name: 'AI', category: 'interest' },
  ];

  // クエリビルダの共通的な挙動を定義するファクトリ関数
  const createMockQueryBuilder = (tableName: string) => {
    let currentSelectSchema: string | undefined;
    let currentFilters: { method: string; args: any[] }[] = [];
    let isInsertOperation = false;

    const chainableMethods = {
      select: jest.fn((schema?: string) => {
        currentSelectSchema = schema;
        return chainableMethods;
      }),
      eq: jest.fn((...args: any[]) => {
        currentFilters.push({ method: 'eq', args });
        return chainableMethods;
      }),
      in: jest.fn((...args: any[]) => {
        currentFilters.push({ method: 'in', args });
        return chainableMethods;
      }),
      single: jest.fn(async () => {
        if (tableName === 'members') {
          if (isInsertOperation) {
            return { data: { ...mockMemberRow, ...insertedMembersData }, error: null };
          }
          return { data: mockMemberRow, error: null };
        }
        return { data: null, error: new Error('Mock: single() called on unexpected table or state') };
      }),
      execute: jest.fn(async () => {
        if (tableName === 'member_tags' && currentSelectSchema === 'member_id, tag:tags(name, category)') {
          return { data: mockTagRows, error: null };
        } else if (tableName === 'tags' && currentSelectSchema === 'id,name,category') {
          return { data: mockTagsTableData, error: null };
        }
        return { data: [], error: new Error('Mock: execute() called on unexpected table or state') };
      }),
      insert: jest.fn((payload: any) => {
        isInsertOperation = true;
        if (tableName === 'member_tags') {
          return Promise.resolve({ error: null }); // member_tagsへのinsertはPromise.resolve({ error: null })を返す
        }
        // membersテーブルへのinsertの場合、selectメソッドを持つオブジェクトを直接返す
        insertedMembersData = payload; // membersテーブルへの挿入のみを記録
        return {
          select: jest.fn((schema?: string) => {
            currentSelectSchema = schema;
            return {
              single: jest.fn(async () => ({ data: { ...mockMemberRow, ...insertedMembersData }, error: null })),
            };
          }),
        };
      }),
      update: jest.fn((payload: any) => {
        return Promise.resolve(chainableMethods);
      }),
      delete: jest.fn(() => {
        const deleteChain = {
          eq: jest.fn(() => Promise.resolve({ error: null })),
        };
        return deleteChain;
      }),
      upsert: jest.fn(() => {
        return Promise.resolve({ error: null });
      }),
    };

    return chainableMethods;
  };

  return {
    DatabaseClient: {
      async getServerClient() {
        return {
          from: jest.fn((tableName: string) => createMockQueryBuilder(tableName)),
        };
      },
      __getInserted: () => insertedMembersData,
      __reset: () => {
        insertedMembersData = null;
      },
    },
  };
});

// DatabaseClient を let で宣言し、beforeEach で再代入できるようにする
let DatabaseClient: any;

describe('SupabaseMemberRepository mappings', () => {
  const repo = new SupabaseMemberRepository();

  beforeEach(() => {
    jest.resetModules(); // 各テストの前にモジュールをリセット
    // 依存関係を再requireする
    ({ DatabaseClient } = jest.requireMock('@/infrastructure/database/DatabaseClient'));
    DatabaseClient.__reset(); // 特定のモック状態をリセット
  });

  test('findById maps DB row to domain entity', async () => {
    const result = await repo.findById('member-1');
    expect(result.success).toBe(true);
    if (result.success && result.value) {
      const member = result.value as Member;
      expect(member.id).toBe('member-1');
      expect(member.schoolEmail.value).toBe('alice@example.ed.jp');
    }
  });

  test('create maps domain entity to insert payload', async () => {
    const memberResult = await repo.findById('member-1');
    if (!memberResult.success || !memberResult.value) {
      throw new Error('failed to setup member');
    }
    const saveResult = await repo.create(memberResult.value);
    expect(saveResult.success).toBe(true);
    const inserted = DatabaseClient.__getInserted();
    expect(inserted).toMatchObject({
      school_email: 'alice@example.ed.jp',
      enrollment_year: 2023,
    });
  });
});
