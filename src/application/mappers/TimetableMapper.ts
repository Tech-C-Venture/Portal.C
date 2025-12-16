/**
 * TimetableMapper
 * TimetableエンティティとTimetableDTOの相互変換
 */

import { Timetable } from '@/domain/entities/Timetable';
import { TimetableDTO, TimeSlotDTO } from '../dtos/TimetableDTO';

export class TimetableMapper {
  static toDTO(timetable: Timetable): TimetableDTO {
    return {
      id: timetable.id,
      memberId: timetable.memberId,
      grade: timetable.grade,
      department: timetable.department,
      timeSlots: timetable.timeSlots.map(
        (slot): TimeSlotDTO => ({
          id: slot.id,
          dayOfWeek: slot.dayOfWeek,
          period: slot.period,
          courseName: slot.courseName,
          classroom: slot.classroom,
        })
      ),
      createdAt: timetable.createdAt.toISOString(),
      updatedAt: timetable.updatedAt.toISOString(),
    };
  }
}
