/**
 * EventDTO
 * Server ComponentsとClient Components間のデータ転送用
 */

export interface EventDTO {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
  location: string;
  onlineUrl?: string;
  onlinePassword?: string;
  capacity: number | 'unlimited';
  participantCount: number;
  remainingCapacity: number | 'unlimited';
  isFull: boolean;
  createdBy: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
