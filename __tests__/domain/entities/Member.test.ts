import {
  createMember,
  calculateGrade,
  hasValidStatus,
  updateMember,
} from '@/domain/entities/Member';
import { CurrentStatus } from '@/domain/value-objects/CurrentStatus';

describe('Member Entity', () => {
  describe('createMember', () => {
    it('should create valid member', () => {
      const member = createMember({
        id: '1',
        studentId: 'S2023001',
        name: '山田太郎',
        schoolEmail: 'yamada@school.ed.jp',
        enrollmentYear: 2023,
        department: '情報システム科',
      });

      expect(member.id).toBe('1');
      expect(member.studentId.value).toBe('S2023001');
      expect(member.name).toBe('山田太郎');
      expect(member.schoolEmail.value).toBe('yamada@school.ed.jp');
      expect(member.enrollmentYear).toBe(2023);
      expect(member.isRepeating).toBe(false);
      expect(member.department).toBe('情報システム科');
    });

    it('should create member with optional fields', () => {
      const member = createMember({
        id: '1',
        studentId: 'S2023001',
        name: '山田太郎',
        schoolEmail: 'yamada@school.ed.jp',
        gmailAddress: 'yamada@gmail.com',
        enrollmentYear: 2023,
        department: '情報システム科',
        skills: ['React', 'TypeScript'],
        interests: ['Web開発'],
        currentStatus: {
          message: '課題中',
          createdAt: new Date(),
        },
      });

      expect(member.gmailAddress?.value).toBe('yamada@gmail.com');
      expect(member.skills).toEqual(['React', 'TypeScript']);
      expect(member.interests).toEqual(['Web開発']);
      expect(member.currentStatus?.message).toBe('課題中');
    });
  });

  describe('calculateGrade', () => {
    it('should calculate correct grade', () => {
      const member = createMember({
        id: '1',
        studentId: 'S2022001',
        name: 'Test',
        schoolEmail: 'test@school.ed.jp',
        enrollmentYear: 2022,
        department: 'IT',
      });

      const grade = calculateGrade(member, new Date('2025-04-01'));
      expect(grade).toBe(4); // 2025 - 2022 + 1 = 4
    });

    it('should adjust grade for repeating students', () => {
      const member = createMember({
        id: '1',
        studentId: 'S2022001',
        name: 'Test',
        schoolEmail: 'test@school.ed.jp',
        enrollmentYear: 2022,
        isRepeating: true,
        department: 'IT',
      });

      const grade = calculateGrade(member, new Date('2025-04-01'));
      expect(grade).toBe(3); // (2025 - 2022 + 1) - 1 = 3
    });
  });

  describe('hasValidStatus', () => {
    it('should return false when no status', () => {
      const member = createMember({
        id: '1',
        studentId: 'S2023001',
        name: 'Test',
        schoolEmail: 'test@school.ed.jp',
        enrollmentYear: 2023,
        department: 'IT',
      });

      expect(hasValidStatus(member)).toBe(false);
    });

    it('should return true for valid status', () => {
      const now = new Date();
      const member = createMember({
        id: '1',
        studentId: 'S2023001',
        name: 'Test',
        schoolEmail: 'test@school.ed.jp',
        enrollmentYear: 2023,
        department: 'IT',
        currentStatus: {
          message: 'Active',
          createdAt: now,
        },
      });

      expect(hasValidStatus(member, now)).toBe(true);
    });

    it('should return false for expired status', () => {
      const createdAt = new Date('2025-01-01T00:00:00Z');
      const now = new Date('2025-01-02T01:00:00Z'); // 25時間後

      const member = createMember({
        id: '1',
        studentId: 'S2023001',
        name: 'Test',
        schoolEmail: 'test@school.ed.jp',
        enrollmentYear: 2023,
        department: 'IT',
        currentStatus: {
          message: 'Expired',
          createdAt,
        },
      });

      expect(hasValidStatus(member, now)).toBe(false);
    });
  });

  describe('updateMember', () => {
    it('should update member immutably', () => {
      const original = createMember({
        id: '1',
        studentId: 'S2023001',
        name: 'Original',
        schoolEmail: 'test@school.ed.jp',
        enrollmentYear: 2023,
        department: 'IT',
      });

      const updated = updateMember(original, { name: 'Updated' });

      expect(original.name).toBe('Original');
      expect(updated.name).toBe('Updated');
      expect(updated.id).toBe(original.id);
    });
  });
});
