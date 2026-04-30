import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
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
            save: jest.fn(),
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
            findOne: jest.fn(),
            findByIds: jest.fn().mockResolvedValue([]),
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
    notesRepository = module.get(NotesRepository);
  });

  it('create: sets archived=false', async () => {
    const saved = mockNote({ archived: false });
    notesRepository.save.mockResolvedValue(saved);

    const result = await service.create({ title: 'T', content: 'C' });

    expect(notesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ archived: false }),
    );
    expect(result.archived).toBe(false);
  });

  it('toggleArchive: flips false to true', async () => {
    const note = mockNote({ archived: false });
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.toggleArchive.mockResolvedValue({ ...note, archived: true });

    const result = await service.toggleArchive('uuid-1');

    expect(result.archived).toBe(true);
  });

  it('toggleArchive: flips true to false', async () => {
    const note = mockNote({ archived: true });
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.toggleArchive.mockResolvedValue({ ...note, archived: false });

    const result = await service.toggleArchive('uuid-1');

    expect(result.archived).toBe(false);
  });

  it('softDelete: throws NotFoundException when note not found', async () => {
    notesRepository.findById.mockResolvedValue(null);
    await expect(service.softDelete('missing-id')).rejects.toThrow(NotFoundException);
  });

  it('softDelete: calls repo.softDelete not repo.hardDelete', async () => {
    const note = mockNote();
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.softDelete.mockResolvedValue({ ...note, deleted: true, deletedAt: new Date() });

    await service.softDelete('uuid-1');

    expect(notesRepository.softDelete).toHaveBeenCalledWith(note);
    expect(notesRepository.hardDelete).not.toHaveBeenCalled();
  });

  it('restore: sets deleted=false deletedAt=null', async () => {
    const deleted = mockNote({ deleted: true, deletedAt: new Date() });
    const restored = mockNote({ deleted: false, deletedAt: null });
    notesRepository.findById.mockResolvedValue(deleted);
    notesRepository.restore.mockResolvedValue(restored);

    const result = await service.restore('uuid-1');

    expect(result.deleted).toBe(false);
    expect(result.deletedAt).toBeNull();
  });
});
