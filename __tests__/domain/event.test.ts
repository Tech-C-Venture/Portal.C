import {
  createEvent,
  addParticipant,
  isEventFull,
  getRemainingCapacity,
} from '@/domain/entities/Event';

describe('Event domain entity', () => {
  const baseParams = {
    id: 'event-1',
    title: 'Tech Talk',
    description: 'Deep dive',
    startDate: new Date('2030-01-01T10:00:00Z'),
    endDate: new Date('2030-01-01T12:00:00Z'),
    location: 'Room A',
    capacity: 2,
    participantIds: ['member-1'],
    createdBy: 'admin-1',
  };

  test('rejects invalid date order', () => {
    expect(() =>
      createEvent({
        ...baseParams,
        startDate: new Date('2030-01-02T12:00:00Z'),
        endDate: new Date('2030-01-01T12:00:00Z'),
      })
    ).toThrow('Start date must be before end date');
  });

  test('enforces capacity on addParticipant', () => {
    const event = createEvent(baseParams);
    const updated = addParticipant(event, 'member-2');
    expect(updated.participantCount).toBe(2);
    expect(isEventFull(updated)).toBe(true);
    expect(getRemainingCapacity(updated)).toBe(0);
    expect(() => addParticipant(updated, 'member-3')).toThrow('Event is full');
  });

  test('prevents duplicate registration', () => {
    const event = createEvent(baseParams);
    expect(() => addParticipant(event, 'member-1')).toThrow(
      'Member is already registered for this event'
    );
  });
});
