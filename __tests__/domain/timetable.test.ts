import {
  createTimeSlot,
  createTimetable,
  addTimeSlot,
  getCourseAt,
  DayOfWeek,
} from '@/domain/entities/Timetable';

describe('Timetable domain entity', () => {
  test('validates day and period range', () => {
    expect(() =>
      createTimeSlot({
        id: 'slot-1',
        dayOfWeek: 0,
        period: 1,
        courseName: 'Math',
      })
    ).toThrow('Day of week must be between 1 and 7');

    expect(() =>
      createTimeSlot({
        id: 'slot-1',
        dayOfWeek: 1,
        period: 0,
        courseName: 'Math',
      })
    ).toThrow('Period must be between 1 and 6');
  });

  test('prevents overlapping time slots', () => {
    const slot = createTimeSlot({
      id: 'slot-1',
      dayOfWeek: DayOfWeek.Monday,
      period: 1,
      courseName: 'Math',
    });
    const timetable = createTimetable({
      id: 'tt-1',
      memberId: 'member-1',
      grade: 2,
      department: 'CS',
      timeSlots: [slot],
    });

    expect(getCourseAt(timetable, DayOfWeek.Monday, 1)).toEqual(slot);
    expect(() =>
      addTimeSlot(
        timetable,
        createTimeSlot({
          id: 'slot-2',
          dayOfWeek: DayOfWeek.Monday,
          period: 1,
          courseName: 'Physics',
        })
      )
    ).toThrow('Time slot already occupied');
  });
});
