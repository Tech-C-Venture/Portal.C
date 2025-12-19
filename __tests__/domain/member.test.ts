import { createMember, calculateGrade, hasValidStatus } from '@/domain/entities/Member';
import { CurrentStatus } from '@/domain/value-objects/CurrentStatus';

describe('Member domain entity', () => {
  const baseParams = {
    id: 'member-1',
    zitadelId: 'zitadel-1',
    studentId: 'S2024001',
    name: 'Alice',
    schoolEmail: 'alice@example.ed.jp',
    enrollmentYear: new Date().getFullYear() - 2,
    department: 'CS',
  };

  test('rejects invalid email', () => {
    expect(() =>
      createMember({
        ...baseParams,
        schoolEmail: 'not-an-email',
      })
    ).toThrow('Invalid email format');
  });

  test('calculates grade with repeating flag', () => {
    const member = createMember(baseParams);
    const grade = calculateGrade(member, new Date(`${new Date().getFullYear()}-04-01`));
    expect(grade).toBe(3);

    const repeating = createMember({ ...baseParams, isRepeating: true });
    const repeatingGrade = calculateGrade(repeating, new Date(`${new Date().getFullYear()}-04-01`));
    expect(repeatingGrade).toBe(2);
  });

  test('validates 24h status window', () => {
    const createdAt = new Date();
    const member = createMember({
      ...baseParams,
      currentStatus: {
        message: 'coding',
        createdAt,
      },
    });

    expect(hasValidStatus(member, new Date(createdAt.getTime() + 1000))).toBe(true);
    expect(hasValidStatus(member, new Date(createdAt.getTime() + 25 * 60 * 60 * 1000))).toBe(false);
  });

  test('status rejects empty message', () => {
    expect(() => CurrentStatus.create('')).toThrow('Status message cannot be empty');
  });
});
