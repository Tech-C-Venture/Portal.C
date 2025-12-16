/**
 * StudentId値オブジェクト
 * 学籍番号のイミュータブル表現
 */

export class StudentId {
  private constructor(private readonly _value: string) {}

  static create(value: string): StudentId {
    if (!value || value.trim().length === 0) {
      throw new Error('StudentId cannot be empty');
    }

    const trimmed = value.trim();

    // 学籍番号は英数字のみを許可（例: S2023001）
    if (!/^[A-Z0-9]+$/.test(trimmed)) {
      throw new Error(`Invalid StudentId format: ${trimmed}`);
    }

    return new StudentId(trimmed);
  }

  get value(): string {
    return this._value;
  }

  equals(other: StudentId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
