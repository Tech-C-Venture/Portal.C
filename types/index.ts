// メンバー情報
export interface Member {
  id: string;
  name: string;
  schoolEmail: string; // 学校メールアドレス（公開）
  gmailAddress?: string; // Gmailアドレス（非公開・管理画面のみ）
  enrollmentYear: number; // 入学年度
  grade: number; // 学年（自動計算）
  isRepeating: boolean; // 留年フラグ
  department: string; // 所属専攻
  skills: string[]; // スキルタグ
  interests: string[]; // 興味タグ
  currentStatus?: CurrentStatus; // 今何してる？
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 今何してる？機能（24時間で消える）
export interface CurrentStatus {
  message: string;
  createdAt: Date;
  expiresAt: Date; // 24時間後
}

// イベント情報
export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  capacity?: number; // 定員
  participantIds: string[]; // 参加者ID
  createdBy: string; // 作成者ID
  createdAt: Date;
  updatedAt: Date;
}

// イベント参加情報
export interface Participation {
  id: string;
  eventId: string;
  memberId: string;
  participatedAt: Date;
}

// 時間割情報
export interface Timetable {
  id: string;
  memberId: string;
  grade: number; // 学年
  department: string; // 専攻
  schedule: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

// 時間割のコマ
export interface TimeSlot {
  id: string;
  dayOfWeek: DayOfWeek; // 曜日
  period: number; // 時限（1-6など）
  courseName: string; // 授業名
  room?: string; // 教室
}

export enum DayOfWeek {
  Monday = "月",
  Tuesday = "火",
  Wednesday = "水",
  Thursday = "木",
  Friday = "金",
  Saturday = "土",
  Sunday = "日",
}

// 学年計算ヘルパー
export function calculateGrade(enrollmentYear: number, isRepeating: boolean): number {
  const currentYear = new Date().getFullYear();
  const baseGrade = currentYear - enrollmentYear + 1;
  return isRepeating ? baseGrade - 1 : baseGrade;
}

// ステータスが有効かチェック
export function isStatusValid(status: CurrentStatus): boolean {
  return new Date() < new Date(status.expiresAt);
}
