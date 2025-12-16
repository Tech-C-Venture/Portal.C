import { SupabaseMemberRepository } from '@/infrastructure/repositories/SupabaseMemberRepository';
import type { Member } from '@/domain/entities/Member';

jest.mock('@/infrastructure/database/DatabaseClient', () => {
  let inserted: any = null;

  const table = {
    row: {
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
    },
  };

  const query = {
    data: table.row,
    error: null,
    select() {
      return this;
    },
    eq() {
      return this;
    },
    single: async () => ({ data: table.row, error: null }),
    insert: (payload: any) => {
      inserted = payload;
      return query;
    },
    update: () => query,
    delete: () => query,
  };

  return {
    DatabaseClient: {
      async getServerClient() {
        return {
          from: () => query,
        };
      },
      __getInserted: () => inserted,
      __reset: () => {
        inserted = null;
      },
    },
  };
});

const { DatabaseClient } = jest.requireMock('@/infrastructure/database/DatabaseClient');

describe('SupabaseMemberRepository mappings', () => {
  const repo = new SupabaseMemberRepository();

  beforeEach(() => {
    DatabaseClient.__reset();
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
