import {
  createEvent,
  isEventFull,
  getRemainingCapacity,
  addParticipant,
  removeParticipant,
} from '@/domain/entities/Event';

describe('Event Entity', () => {
  describe('createEvent', () => {
    it('should create valid event', () => {
      const startDate = new Date('2025-06-01T10:00:00Z');
      const endDate = new Date('2025-06-01T12:00:00Z');

      const event = createEvent({
        id: '1',
        title: 'Tech Talk',
        description: 'A tech event',
        startDate,
        endDate,
        location: 'Online',
        capacity: 50,
        createdBy: 'admin',
      });

      expect(event.id).toBe('1');
      expect(event.title).toBe('Tech Talk');
      expect(event.capacity.value).toBe(50);
      expect(event.participantCount).toBe(0);
    });

    it('should throw error when start date is after end date', () => {
      const startDate = new Date('2025-06-01T12:00:00Z');
      const endDate = new Date('2025-06-01T10:00:00Z');

      expect(() =>
        createEvent({
          id: '1',
          title: 'Event',
          description: 'Description',
          startDate,
          endDate,
          location: 'Location',
          createdBy: 'admin',
        })
      ).toThrow('Start date must be before end date');
    });

    it('should create event with unlimited capacity when not specified', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        createdBy: 'admin',
      });

      expect(event.capacity.isUnlimited()).toBe(true);
    });
  });

  describe('isEventFull', () => {
    it('should return false when event has capacity', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 5,
        participantIds: ['1', '2'],
        createdBy: 'admin',
      });

      expect(isEventFull(event)).toBe(false);
    });

    it('should return true when event is full', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 2,
        participantIds: ['1', '2'],
        createdBy: 'admin',
      });

      expect(isEventFull(event)).toBe(true);
    });
  });

  describe('addParticipant', () => {
    it('should add participant to event', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 5,
        createdBy: 'admin',
      });

      const updated = addParticipant(event, 'member1');

      expect(updated.participantIds).toContain('member1');
      expect(updated.participantCount).toBe(1);
      expect(event.participantCount).toBe(0); // Immutable
    });

    it('should throw error when adding duplicate participant', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 5,
        participantIds: ['member1'],
        createdBy: 'admin',
      });

      expect(() => addParticipant(event, 'member1')).toThrow(
        'Member is already registered for this event'
      );
    });

    it('should throw error when event is full', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 1,
        participantIds: ['member1'],
        createdBy: 'admin',
      });

      expect(() => addParticipant(event, 'member2')).toThrow('Event is full');
    });
  });

  describe('removeParticipant', () => {
    it('should remove participant from event', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 5,
        participantIds: ['member1', 'member2'],
        createdBy: 'admin',
      });

      const updated = removeParticipant(event, 'member1');

      expect(updated.participantIds).not.toContain('member1');
      expect(updated.participantIds).toContain('member2');
      expect(updated.participantCount).toBe(1);
    });

    it('should throw error when removing non-registered participant', () => {
      const event = createEvent({
        id: '1',
        title: 'Event',
        description: 'Description',
        startDate: new Date('2025-06-01T10:00:00Z'),
        endDate: new Date('2025-06-01T12:00:00Z'),
        location: 'Location',
        capacity: 5,
        participantIds: ['member1'],
        createdBy: 'admin',
      });

      expect(() => removeParticipant(event, 'member2')).toThrow(
        'Member is not registered for this event'
      );
    });
  });
});
