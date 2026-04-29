import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Note } from './note.entity';
import { Category } from '../categories/category.entity';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

export interface FindNotesOptions {
  archived?: boolean;
  deleted?: boolean;
  search?: string;
  categoryId?: string;
}

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(Note)
    private readonly repo: Repository<Note>,
  ) {}

  async findAll(options: FindNotesOptions): Promise<Note[]> {
    const qb: SelectQueryBuilder<Note> = this.repo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category');

    if (options.archived !== undefined) {
      qb.andWhere('note.archived = :archived', { archived: options.archived });
    }
    if (options.deleted !== undefined) {
      qb.andWhere('note.deleted = :deleted', { deleted: options.deleted });
    }
    if (options.search) {
      qb.andWhere(
        '(note.title ILIKE :search OR note.content ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }
    if (options.categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId: options.categoryId });
    }

    return qb.getMany();
  }

  async findById(id: string): Promise<Note | null> {
    return this.repo.findOne({ where: { id }, relations: ['categories'] });
  }

  async create(dto: CreateNoteDto, categories: Category[]): Promise<Note> {
    const note = this.repo.create({
      title: dto.title,
      content: dto.content,
      isPublic: dto.isPublic ?? false,
      categories,
    });
    return this.repo.save(note);
  }

  async update(note: Note, dto: UpdateNoteDto, categories?: Category[]): Promise<Note> {
    const updated: Note = { ...note, ...dto };
    if (categories !== undefined) {
      updated.categories = categories;
    }
    return this.repo.save(updated);
  }

  async softDelete(note: Note): Promise<Note> {
    return this.repo.save({ ...note, deleted: true, deletedAt: new Date() });
  }

  async restore(note: Note): Promise<Note> {
    return this.repo.save({ ...note, deleted: false, deletedAt: null });
  }

  async toggleArchive(note: Note): Promise<Note> {
    return this.repo.save({ ...note, archived: !note.archived });
  }

  async hardDelete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async addCategory(note: Note, category: Category): Promise<Note> {
    const alreadyAdded = note.categories.some(c => c.id === category.id);
    if (alreadyAdded) return note;
    return this.repo.save({ ...note, categories: [...note.categories, category] });
  }

  async removeCategory(note: Note, categoryId: string): Promise<Note> {
    return this.repo.save({
      ...note,
      categories: note.categories.filter(c => c.id !== categoryId),
    });
  }
}
