import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { NotesRepository, FindNotesOptions } from './notes.repository';
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

  findAll(options: FindNotesOptions): Promise<Note[]> {
    return this.notesRepository.findAll(options);
  }

  async findById(id: string): Promise<Note> {
    const note = await this.notesRepository.findById(id);
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  private async resolveCategories(ids: string[]): Promise<Category[]> {
    const results = await Promise.all(
      ids.map(id => this.categoriesService.findById(id)),
    );
    return results.filter((c): c is Category => c !== null);
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    const categories = dto.categoryIds
      ? await this.resolveCategories(dto.categoryIds)
      : [];
    return this.notesRepository.create(dto, categories);
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.findById(id);
    const categories = dto.categoryIds
      ? await this.resolveCategories(dto.categoryIds)
      : undefined;
    return this.notesRepository.update(note, dto, categories);
  }

  async softDelete(id: string): Promise<Note> {
    const note = await this.findById(id);
    return this.notesRepository.softDelete(note);
  }

  async restore(id: string): Promise<Note> {
    const note = await this.findById(id);
    if (!note.deleted) {
      throw new BadRequestException('Note is not in trash');
    }
    return this.notesRepository.restore(note);
  }

  async toggleArchive(id: string): Promise<Note> {
    const note = await this.findById(id);
    return this.notesRepository.toggleArchive(note);
  }

  async hardDelete(id: string): Promise<void> {
    const note = await this.findById(id);
    if (!note.deleted) {
      throw new BadRequestException('Note must be soft-deleted before permanent deletion');
    }
    await this.notesRepository.hardDelete(id);
  }

  async addCategory(noteId: string, categoryId: string): Promise<Note> {
    const note = await this.findById(noteId);
    const category = await this.categoriesService.findById(categoryId);
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);
    return this.notesRepository.addCategory(note, category);
  }

  async removeCategory(noteId: string, categoryId: string): Promise<Note> {
    const note = await this.findById(noteId);
    return this.notesRepository.removeCategory(note, categoryId);
  }
}
