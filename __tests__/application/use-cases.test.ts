import { GetMemberProfileUseCase } from '@/application/use-cases/GetMemberProfileUseCase';
import { RegisterForEventUseCase } from '@/application/use-cases/RegisterForEventUseCase';
import { MemberMapper } from '@/application/mappers/MemberMapper';
import { createMember } from '@/domain/entities/Member';
import { createEvent } from '@/domain/entities/Event';
import type { IMemberRepository } from '@/application/ports/IMemberRepository';
import type { IEventRepository } from '@/application/ports/IEventRepository';
import { success, failure } from '@/application/common/Result';

describe('Application use cases', () => {
  describe('GetMemberProfileUseCase', () => {
    const member = createMember({
      id: 'member-1',
      zitadelId: 'zitadel-1',
      studentId: 'S2024001',
      name: 'Alice',
      schoolEmail: 'alice@example.ed.jp',
      enrollmentYear: 2023,
      department: 'CS',
    });

    const repo: IMemberRepository = {
      findById: jest.fn().mockResolvedValue(success(member)),
      findByZitadelId: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findByStudentId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    test('returns DTO on success', async () => {
      const useCase = new GetMemberProfileUseCase(repo);
      const result = await useCase.execute('member-1');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(MemberMapper.toDTO(member));
      }
    });

    test('fails when repository returns null', async () => {
      (repo.findById as jest.Mock).mockResolvedValueOnce(success(null));
      const useCase = new GetMemberProfileUseCase(repo);
      const result = await useCase.execute('missing');
      expect(result.success).toBe(false);
    });
  });

  describe('RegisterForEventUseCase', () => {
    const baseParams = {
      id: 'event-1',
      title: 'Tech Talk',
      description: 'Deep dive',
      startDate: new Date('2030-01-01T10:00:00Z'),
      endDate: new Date('2030-01-01T12:00:00Z'),
      location: 'Room A',
      capacity: 1,
      participantIds: [] as string[],
      createdBy: 'admin-1',
    };

    const event = createEvent(baseParams);

    const repo: IEventRepository = {
      findById: jest.fn().mockResolvedValue(success(event)),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      registerMember: jest.fn().mockResolvedValue(success(undefined)),
      unregisterMember: jest.fn(),
      getParticipants: jest.fn(),
    };

    test('registers when capacity available', async () => {
      const useCase = new RegisterForEventUseCase(repo);
      const result = await useCase.execute('event-1', 'member-1');
      expect(result.success).toBe(true);
      expect(repo.registerMember).toHaveBeenCalledWith('event-1', 'member-1');
    });

    test('fails when event is full', async () => {
      const fullEvent = createEvent({ ...baseParams, participantIds: ['member-1'] });
      (repo.findById as jest.Mock).mockResolvedValueOnce(success(fullEvent));
      const useCase = new RegisterForEventUseCase(repo);
      const result = await useCase.execute('event-1', 'member-2');
      expect(result.success).toBe(false);
    });

    test('fails when already registered', async () => {
      const alreadyRegistered = createEvent({ ...baseParams, participantIds: ['member-1'] });
      (repo.findById as jest.Mock).mockResolvedValueOnce(success(alreadyRegistered));
      const useCase = new RegisterForEventUseCase(repo);
      const result = await useCase.execute('event-1', 'member-1');
      expect(result.success).toBe(false);
    });
  });
});
