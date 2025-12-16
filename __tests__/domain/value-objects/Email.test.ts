import { Email } from '@/domain/value-objects/Email';

describe('Email', () => {
  describe('create', () => {
    it('should create valid email', () => {
      const email = Email.create('test@example.com');
      expect(email.value).toBe('test@example.com');
    });

    it('should normalize email to lowercase', () => {
      const email = Email.create('Test@Example.COM');
      expect(email.value).toBe('test@example.com');
    });

    it('should trim whitespace', () => {
      const email = Email.create('  test@example.com  ');
      expect(email.value).toBe('test@example.com');
    });

    it('should throw error for empty email', () => {
      expect(() => Email.create('')).toThrow('Email cannot be empty');
    });

    it('should throw error for invalid email format', () => {
      expect(() => Email.create('invalid-email')).toThrow('Invalid email format');
      expect(() => Email.create('test@')).toThrow('Invalid email format');
      expect(() => Email.create('@example.com')).toThrow('Invalid email format');
    });
  });

  describe('isSchoolEmail', () => {
    it('should return true for school email', () => {
      const email = Email.create('student@school.ed.jp');
      expect(email.isSchoolEmail()).toBe(true);
    });

    it('should return false for non-school email', () => {
      const email = Email.create('user@gmail.com');
      expect(email.isSchoolEmail()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different email', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
});
