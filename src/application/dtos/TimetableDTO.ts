/**
 * TimetableDTO
 * Server ComponentsとClient Components間のデータ転送用
 */

export interface TimeSlotDTO {
  id: string;
  dayOfWeek: number; // 1-7
  period: number; // 1-6
  courseName: string;
  classroom?: string;
}

export interface TimetableDTO {
  id: string;
  memberId: string;
  grade: number;
  department: string;
  timeSlots: TimeSlotDTO[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
