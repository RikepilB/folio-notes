import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { CategoriesService } from '../categories/categories.service';
import { Note } from './note.entity';

const mockNote = (overrides: Partial<Note> = {}): Note =>
  ({
    id: 'uuid-1',
    title: 'Test Note',
    content: 'Test content',
    archived: false,
    deleted: false,
    deletedAt: null,
    isPublic: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    categories: [],
    ...overrides,
  } as Note);

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: jest.Mocked<NotesRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: NotesRepository,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            softDelete: jest.fn(),
            restore: jest.fn(),
            toggleArchive: jest.fn(),
            hardDelete: jest.fn(),
            addCategory: jest.fn(),
            removeCategory: jest.fn(),
          },
        },
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    notesRepository = module.get(NotesRepository);
  });

  describe('findById', () => {
    it('returns note when found', async () => {
      const note = mockNote();
      notesRepository.findById.mockResolvedValue(note);
      const result = await service.findById('uuid-1');
      expect(result).toBe(note);
    });

    it('throws NotFoundException when note does not exist', async () => {
      notesRepository.findById.mockResolvedValue(null);
      await expect(service.findById('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('calls repository softDelete (not hardDelete)', async () => {
      const note = mockNote();
      notesRepository.findById.mockResolvedValue(note);
      notesRepository.softDelete.mockResolvedValue({ ...note, deleted: true, deletedAt: new Date() });

      await service.softDelete('uuid-1');

      expect(notesRepository.softDelete).toHaveBeenCalledWith(note);
      expect(notesRepository.hardDelete).not.toHaveBeenCalled();
    });
  });

  describe('restore', () => {
    it('throws BadRequestException when note is not deleted', async () => {
      notesRepository.findById.mockResolvedValue(mockNote({ deleted: false }));
      await expect(service.restore('uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('restores a soft-deleted note', async () => {
      const deleted = mockNote({ deleted: true, deletedAt: new Date() });
      const restored = mockNote({ deleted: false, deletedAt: null });
      notesRepository.findById.mockResolvedValue(deleted);
      notesRepository.restore.mockResolvedValue(restored);

      const result = await service.restore('uuid-1');

      expect(notesRepository.restore).toHaveBeenCalledWith(deleted);
      expect(result.deleted).toBe(false);
    });
  });

  describe('hardDelete', () => {
    it('throws BadRequestException when note is not soft-deleted', async () => {
      notesRepository.findById.mockResolvedValue(mockNote({ deleted: false }));
      await expect(service.hardDelete('uuid-1')).rejects.toThrow(BadRequestException);
    });

    it('calls hardDelete on a soft-deleted note', async () => {
      const note = mockNote({ deleted: true });
      notesRepository.findById.mockResolvedValue(note);
      notesRepository.hardDelete.mockResolvedValue(undefined);

      await service.hardDelete('uuid-1');

      expect(notesRepository.hardDelete).toHaveBeenCalledWith('uuid-1');
    });
  });

  describe('toggleArchive', () => {
    it('toggles archived from false to true', async () => {
      const note = mockNote({ archived: false });
      notesRepository.findById.mockResolvedValue(note);
      notesRepository.toggleArchive.mockResolvedValue({ ...note, archived: true });

      const result = await service.toggleArchive('uuid-1');

      expect(result.archived).toBe(true);
    });
  });
});
