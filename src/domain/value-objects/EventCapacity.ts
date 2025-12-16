/**
 * EventCapacity値オブジェクト
 * イベント定員のイミュータブル表現
 */

export class EventCapacity {
  private constructor(private readonly _value: number) {}

  static create(value: number): EventCapacity {
    if (!Number.isInteger(value)) {
      throw new Error('Capacity must be an integer');
    }

    if (value < 1) {
      throw new Error('Capacity must be at least 1');
    }

    if (value > 10000) {
      throw new Error('Capacity cannot exceed 10000');
    }

    return new EventCapacity(value);
  }

  static unlimited(): EventCapacity {
    return new EventCapacity(Number.MAX_SAFE_INTEGER);
  }

  get value(): number {
    return this._value;
  }

  isUnlimited(): boolean {
    return this._value === Number.MAX_SAFE_INTEGER;
  }

  isFull(currentCount: number): boolean {
    return currentCount >= this._value;
  }

  remainingSlots(currentCount: number): number {
    if (this.isUnlimited()) {
      return Number.MAX_SAFE_INTEGER;
    }
    return Math.max(0, this._value - currentCount);
  }

  equals(other: EventCapacity): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this.isUnlimited() ? '無制限' : this._value.toString();
  }
}
