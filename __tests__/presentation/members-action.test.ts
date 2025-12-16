jest.mock('@/infrastructure/di/setup', () => {
  const resolve = jest.fn();
  return {
    container: { resolve },
  };
});

import { getMemberListAction } from '@/app/actions/members';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import { createMember } from '@/domain/entities/Member';
import { success, failure } from '@/application/common/Result';
import { container } from '@/infrastructure/di/setup';

describe('getMemberListAction', () => {
  const member = createMember({
    id: 'member-1',
    studentId: 'S2024001',
    name: 'Alice',
    schoolEmail: 'alice@example.ed.jp',
    enrollmentYear: 2023,
    department: 'CS',
  });

  const repo: IMemberRepository = {
    findById: jest.fn(),
    findAll: jest.fn().mockResolvedValue(success([member])),
    findByEmail: jest.fn(),
    findByStudentId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(() => {
    (container.resolve as jest.Mock).mockReturnValue(repo);
  });

  test('returns DTO list on success', async () => {
    const result = await getMemberListAction();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 'member-1', name: 'Alice' });
  });

  test('throws on repository failure', async () => {
    (repo.findAll as jest.Mock).mockResolvedValueOnce(failure(new Error('db down')));
    await expect(getMemberListAction()).rejects.toThrow('Failed to fetch members');
  });
});
