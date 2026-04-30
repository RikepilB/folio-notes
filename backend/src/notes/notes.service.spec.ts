import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { CategoriesService } from '../categories/categories.service';
import { Note } from './note.entity';
import { Category } from '../categories/category.entity';

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

const mockCategory = (overrides: Partial<Category> = {}): Category =>
  ({ id: 'cat-1', name: 'Work', color: '#ff0000', notes: [], ...overrides } as Category);

describe('NotesService', () => {
  let service: NotesService;
  let notesRepository: jest.Mocked<NotesRepository>;
  let categoriesService: jest.Mocked<CategoriesService>;

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
            emptyTrash: jest.fn(),
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
    categoriesService = module.get(CategoriesService);
  });

  // --- findAll ---

  it('findAll: delegates to repository with correct flags', async () => {
    notesRepository.findAll.mockResolvedValue([]);
    await service.findAll(false, false, 'hello', 'cat-1');
    expect(notesRepository.findAll).toHaveBeenCalledWith(false, false, 'hello', 'cat-1');
  });

  // --- findById ---

  it('findById: throws NotFoundException when note missing', async () => {
    notesRepository.findById.mockResolvedValue(null);
    await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
  });

  it('findById: returns note when found', async () => {
    const note = mockNote();
    notesRepository.findById.mockResolvedValue(note);
    const result = await service.findById('uuid-1');
    expect(result).toBe(note);
  });

  // --- create ---

  it('create: sets archived=false', async () => {
    const saved = mockNote({ archived: false });
    notesRepository.save.mockResolvedValue(saved);

    const result = await service.create({ title: 'T', content: 'C' });

    expect(notesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ archived: false }),
    );
    expect(result.archived).toBe(false);
  });

  it('create: resolves categoryIds when provided', async () => {
    const cat = mockCategory();
    categoriesService.findByIds.mockResolvedValue([cat]);
    notesRepository.save.mockResolvedValue(mockNote({ categories: [cat] }));

    await service.create({ title: 'T', content: 'C', categoryIds: ['cat-1'] });

    expect(categoriesService.findByIds).toHaveBeenCalledWith(['cat-1']);
    expect(notesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ categories: [cat] }),
    );
  });

  // --- update ---

  it('update: merges dto fields onto existing note', async () => {
    const note = mockNote();
    const updated = mockNote({ title: 'New Title' });
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(updated);

    const result = await service.update('uuid-1', { title: 'New Title' });

    expect(notesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Title' }),
    );
    expect(result.title).toBe('New Title');
  });

  it('update: throws NotFoundException when note missing', async () => {
    notesRepository.findById.mockResolvedValue(null);
    await expect(service.update('missing', { title: 'X' })).rejects.toThrow(NotFoundException);
  });

  // --- toggleArchive ---

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

  // --- softDelete ---

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

  // --- restore ---

  it('restore: sets deleted=false deletedAt=null', async () => {
    const deleted = mockNote({ deleted: true, deletedAt: new Date() });
    const restored = mockNote({ deleted: false, deletedAt: null });
    notesRepository.findById.mockResolvedValue(deleted);
    notesRepository.restore.mockResolvedValue(restored);

    const result = await service.restore('uuid-1');

    expect(result.deleted).toBe(false);
    expect(result.deletedAt).toBeNull();
  });

  it('restore: throws BadRequestException when note is not in trash', async () => {
    notesRepository.findById.mockResolvedValue(mockNote({ deleted: false }));
    await expect(service.restore('uuid-1')).rejects.toThrow(BadRequestException);
  });

  // --- hardDelete ---

  it('hardDelete: calls repo.hardDelete when note is in trash', async () => {
    const deleted = mockNote({ deleted: true });
    notesRepository.findById.mockResolvedValue(deleted);
    notesRepository.hardDelete.mockResolvedValue(undefined);

    await service.hardDelete('uuid-1');

    expect(notesRepository.hardDelete).toHaveBeenCalledWith('uuid-1');
  });

  it('hardDelete: throws BadRequestException when note is not in trash', async () => {
    notesRepository.findById.mockResolvedValue(mockNote({ deleted: false }));
    await expect(service.hardDelete('uuid-1')).rejects.toThrow(BadRequestException);
  });

  // --- emptyTrash ---

  it('emptyTrash: delegates to repository', async () => {
    notesRepository.emptyTrash.mockResolvedValue(undefined);
    await service.emptyTrash();
    expect(notesRepository.emptyTrash).toHaveBeenCalledTimes(1);
  });

  // --- addCategory ---

  it('addCategory: attaches category to note', async () => {
    const note = mockNote();
    const cat = mockCategory();
    const updated = mockNote({ categories: [cat] });
    notesRepository.findById.mockResolvedValue(note);
    categoriesService.findOne.mockResolvedValue(cat);
    notesRepository.save.mockResolvedValue(updated);

    const result = await service.addCategory('uuid-1', 'cat-1');

    expect(result.categories).toContain(cat);
  });

  it('addCategory: throws NotFoundException when category missing', async () => {
    notesRepository.findById.mockResolvedValue(mockNote());
    categoriesService.findOne.mockResolvedValue(null);
    await expect(service.addCategory('uuid-1', 'cat-missing')).rejects.toThrow(NotFoundException);
  });

  it('addCategory: returns note unchanged when category already attached', async () => {
    const cat = mockCategory();
    const note = mockNote({ categories: [cat] });
    notesRepository.findById.mockResolvedValue(note);
    categoriesService.findOne.mockResolvedValue(cat);

    const result = await service.addCategory('uuid-1', 'cat-1');

    expect(notesRepository.save).not.toHaveBeenCalled();
    expect(result).toBe(note);
  });

  // --- removeCategory ---

  it('removeCategory: strips category from note', async () => {
    const cat = mockCategory();
    const note = mockNote({ categories: [cat] });
    const updated = mockNote({ categories: [] });
    notesRepository.findById.mockResolvedValue(note);
    notesRepository.save.mockResolvedValue(updated);

    const result = await service.removeCategory('uuid-1', 'cat-1');

    expect(notesRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ categories: [] }),
    );
    expect(result.categories).toHaveLength(0);
  });
});
