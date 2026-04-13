/**
 * MemberDTO
 * Server ComponentsとClient Components間のデータ転送用
 */

export interface MemberDTO {
  id: string;
  studentId: string | null;
  name: string;
  schoolEmail: string;
  gmailAddress?: string;
  enrollmentYear: number;
  isRepeating: boolean;
  repeatYears?: number;
  department: string;
  skills: string[];
  interests: string[];
  onboardingCompleted: boolean;
  currentStatus?: {
    message: string;
    createdAt: string; // ISO string
    expiresAt: string; // ISO string
  };
  avatarUrl?: string;
  isAdmin: boolean;
  grade: number; // 計算済みの学年
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
