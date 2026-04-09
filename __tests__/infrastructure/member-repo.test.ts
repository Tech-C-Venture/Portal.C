import { FirestoreMemberRepository } from '@/infrastructure/repositories/FirestoreMemberRepository';
import type { Member } from '@/domain/entities/Member';

const mockMemberDoc = {
  zitadel_id: 'S2024001',
  student_id: null,
  name: 'Alice',
  school_email: 'alice@example.ed.jp',
  gmail_address: null,
  enrollment_year: 2023,
  is_repeating: false,
  repeat_years: null,
  major: 'CS',
  onboarding_completed: false,
  current_status: null,
  status_updated_at: null,
  avatar_url: null,
  skills: [],
  interests: [],
  created_at: { toDate: () => new Date() },
  updated_at: { toDate: () => new Date() },
};

let lastSetData: any = null;

jest.mock('@/lib/firebase/admin', () => {
  const mockDoc = {
    id: 'member-1',
    exists: true,
    data: () => ({ ...mockMemberDoc }),
    ref: { update: jest.fn() },
  };

  const mockCollection = {
    doc: (id: string) => ({
      get: async () => mockDoc,
      set: async (data: any) => { lastSetData = data; },
      delete: async () => {},
    }),
    where: () => ({
      limit: () => ({
        get: async () => ({
          empty: false,
          docs: [mockDoc],
        }),
      }),
      get: async () => ({
        empty: false,
        docs: [mockDoc],
      }),
    }),
    get: async () => ({
      docs: [mockDoc],
    }),
    add: async (data: any) => { lastSetData = data; return { id: 'new-id' }; },
  };

  return {
    getDb: () => ({
      collection: () => mockCollection,
      batch: () => ({
        set: jest.fn(),
        delete: jest.fn(),
        commit: async () => {},
      }),
    }),
    getFirebaseStorage: () => ({}),
  };
});

describe('FirestoreMemberRepository mappings', () => {
  const repo = new FirestoreMemberRepository();

  beforeEach(() => {
    lastSetData = null;
  });

  test('findById maps Firestore doc to domain entity', async () => {
    const result = await repo.findById('member-1');
    expect(result.success).toBe(true);
    if (result.success && result.value) {
      const member = result.value as Member;
      expect(member.id).toBe('member-1');
      expect(member.schoolEmail.value).toBe('alice@example.ed.jp');
    }
  });

  test('create maps domain entity to Firestore document', async () => {
    const memberResult = await repo.findById('member-1');
    if (!memberResult.success || !memberResult.value) {
      throw new Error('failed to setup member');
    }
    const saveResult = await repo.create(memberResult.value);
    expect(saveResult.success).toBe(true);
    expect(lastSetData).toMatchObject({
      school_email: 'alice@example.ed.jp',
      enrollment_year: 2023,
    });
  });
});
