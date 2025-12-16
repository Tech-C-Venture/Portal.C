/**
 * Email値オブジェクト
 * イミュータブルなメールアドレス表現
 */

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export class Email {
  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    if (!value || value.trim().length === 0) {
      throw new Error('Email cannot be empty');
    }

    const trimmed = value.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email format: ${trimmed}`);
    }

    return new Email(trimmed.toLowerCase());
  }

  get value(): string {
    return this._value;
  }

  /**
   * 学校メールアドレスかどうかを判定
   */
  isSchoolEmail(): boolean {
    return this._value.endsWith('.ed.jp');
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
