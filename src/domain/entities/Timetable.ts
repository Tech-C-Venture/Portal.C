/**
 * Timetableエンティティ
 * メンバーの時間割情報を表現するドメインエンティティ
 */

export enum DayOfWeek {
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
  Sunday = 7,
}

export interface TimeSlot {
  readonly id: string;
  readonly dayOfWeek: DayOfWeek;
  readonly period: number; // 時限（1-6など）
  readonly courseName: string;
  readonly classroom?: string;
}

export interface Timetable {
  readonly id: string;
  readonly memberId: string;
  readonly grade: number;
  readonly department: string;
  readonly timeSlots: readonly TimeSlot[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * TimeSlotのファクトリー関数
 */
export function createTimeSlot(params: {
  id: string;
  dayOfWeek: number;
  period: number;
  courseName: string;
  classroom?: string;
}): TimeSlot {
  // 曜日のバリデーション（1-7）
  if (params.dayOfWeek < 1 || params.dayOfWeek > 7) {
    throw new Error('Day of week must be between 1 and 7');
  }

  // 時限のバリデーション（1-6）
  if (params.period < 1 || params.period > 6) {
    throw new Error('Period must be between 1 and 6');
  }

  if (!params.courseName || params.courseName.trim().length === 0) {
    throw new Error('Course name cannot be empty');
  }

  return {
    id: params.id,
    dayOfWeek: params.dayOfWeek as DayOfWeek,
    period: params.period,
    courseName: params.courseName.trim(),
    classroom: params.classroom?.trim(),
  };
}

/**
 * Timetableエンティティのファクトリー関数
 */
export function createTimetable(params: {
  id: string;
  memberId: string;
  grade: number;
  department: string;
  timeSlots?: TimeSlot[];
  createdAt?: Date;
  updatedAt?: Date;
}): Timetable {
  if (params.grade < 1 || params.grade > 6) {
    throw new Error('Grade must be between 1 and 6');
  }

  return {
    id: params.id,
    memberId: params.memberId,
    grade: params.grade,
    department: params.department,
    timeSlots: Object.freeze(params.timeSlots ?? []),
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date(),
  };
}

/**
 * 特定の曜日・時限の授業を取得
 */
export function getCourseAt(
  timetable: Timetable,
  dayOfWeek: DayOfWeek,
  period: number
): TimeSlot | undefined {
  return timetable.timeSlots.find(
    (slot) => slot.dayOfWeek === dayOfWeek && slot.period === period
  );
}

/**
 * 特定の曜日の全授業を取得
 */
export function getCoursesByDay(
  timetable: Timetable,
  dayOfWeek: DayOfWeek
): readonly TimeSlot[] {
  return timetable.timeSlots
    .filter((slot) => slot.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.period - b.period);
}

/**
 * 時間割に授業を追加する（イミュータブル更新）
 */
export function addTimeSlot(timetable: Timetable, timeSlot: TimeSlot): Timetable {
  // 同じ曜日・時限に既に授業がある場合はエラー
  const existing = getCourseAt(timetable, timeSlot.dayOfWeek, timeSlot.period);
  if (existing) {
    throw new Error(
      `Time slot already occupied: ${timeSlot.dayOfWeek} period ${timeSlot.period}`
    );
  }

  const newTimeSlots = Object.freeze([...timetable.timeSlots, timeSlot]);

  return {
    ...timetable,
    timeSlots: newTimeSlots,
    updatedAt: new Date(),
  };
}

/**
 * 時間割から授業を削除する（イミュータブル更新）
 */
export function removeTimeSlot(timetable: Timetable, timeSlotId: string): Timetable {
  const newTimeSlots = Object.freeze(
    timetable.timeSlots.filter((slot) => slot.id !== timeSlotId)
  );

  return {
    ...timetable,
    timeSlots: newTimeSlots,
    updatedAt: new Date(),
  };
}

/**
 * Timetableエンティティを更新する（イミュータブル更新）
 */
export function updateTimetable(
  timetable: Timetable,
  updates: Partial<Pick<Timetable, 'grade' | 'department' | 'timeSlots'>>
): Timetable {
  const updated = {
    ...timetable,
    ...updates,
    timeSlots: updates.timeSlots
      ? Object.freeze([...updates.timeSlots])
      : timetable.timeSlots,
    updatedAt: new Date(),
  };

  // 学年のバリデーション
  if (updated.grade < 1 || updated.grade > 6) {
    throw new Error('Grade must be between 1 and 6');
  }

  return updated;
}
