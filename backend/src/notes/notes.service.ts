import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { CategoriesService } from '../categories/categories.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class NotesService {
  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAll(
    archived: boolean,
    deleted: boolean,
    search?: string,
    categoryId?: string,
    sortBy?: string,
    order?: string,
  ): Promise<Note[]> {
    return this.notesRepository.findAll(archived, deleted, search, categoryId, sortBy, order);
  }

  async findById(id: string): Promise<Note> {
    const note = await this.notesRepository.findById(id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  private resolveCategories(ids: string[]): Promise<Category[]> {
    return this.categoriesService.findByIds(ids);
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    const categories = dto.categoryIds
      ? await this.resolveCategories(dto.categoryIds)
      : [];
    return this.notesRepository.save({
      title: dto.title,
      content: dto.content,
      archived: false,
      deleted: false,
      isPublic: false,
      categories,
    });
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findById(id);
    const categories = dto.categoryIds
      ? await this.resolveCategories(dto.categoryIds)
      : note.categories;
    return this.notesRepository.save({
      ...note,
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.content !== undefined && { content: dto.content }),
      categories,
    });
  }

  async toggleArchive(id: string): Promise<Note> {
    const note = await this.findById(id);
    return this.notesRepository.toggleArchive(note);
  }

  async softDelete(id: string): Promise<Note> {
    const note = await this.findById(id);
    return this.notesRepository.softDelete(note);
  }

  async restore(id: string): Promise<Note> {
    const note = await this.findById(id);
    if (!note.deleted) throw new BadRequestException('Note is not in trash');
    return this.notesRepository.restore(note);
  }

  async hardDelete(id: string): Promise<void> {
    const note = await this.findById(id);
    if (!note.deleted) {
      throw new BadRequestException('Note must be in trash before permanent deletion');
    }
    return this.notesRepository.hardDelete(id);
  }

  emptyTrash(): Promise<void> {
    return this.notesRepository.emptyTrash();
  }

  async addCategory(noteId: string, categoryId: string): Promise<Note> {
    const note = await this.findById(noteId);
    const category = await this.categoriesService.findOne(categoryId);
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);
    if (note.categories.some((c) => c.id === categoryId)) return note;
    return this.notesRepository.save({
      ...note,
      categories: [...note.categories, category],
    });
  }

  async removeCategory(noteId: string, categoryId: string): Promise<Note> {
    const note = await this.findById(noteId);
    return this.notesRepository.save({
      ...note,
      categories: note.categories.filter((c) => c.id !== categoryId),
    });
  }
}
