/**
 * CurrentStatus値オブジェクト
 * 24時間限定のステータスメッセージ
 */

export class CurrentStatus {
  private static readonly EXPIRATION_HOURS = 24;

  private constructor(
    private readonly _message: string,
    private readonly _createdAt: Date,
    private readonly _expiresAt: Date
  ) {}

  static create(message: string, createdAt: Date = new Date()): CurrentStatus {
    if (!message || message.trim().length === 0) {
      throw new Error('Status message cannot be empty');
    }

    if (message.length > 200) {
      throw new Error('Status message cannot exceed 200 characters');
    }

    const expiresAt = new Date(
      createdAt.getTime() + this.EXPIRATION_HOURS * 60 * 60 * 1000
    );

    return new CurrentStatus(message.trim(), createdAt, expiresAt);
  }

  get message(): string {
    return this._message;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  /**
   * ステータスが有効かどうかを判定
   */
  isValid(now: Date = new Date()): boolean {
    return now < this._expiresAt;
  }

  /**
   * 有効期限までの残り時間（ミリ秒）
   */
  remainingTime(now: Date = new Date()): number {
    return Math.max(0, this._expiresAt.getTime() - now.getTime());
  }

  equals(other: CurrentStatus): boolean {
    return (
      this._message === other._message &&
      this._createdAt.getTime() === other._createdAt.getTime()
    );
  }
}
