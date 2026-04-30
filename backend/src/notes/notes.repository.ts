import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Note } from './note.entity';
import { Category } from '../categories/category.entity';

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(Note)
    private readonly repo: Repository<Note>,
  ) {}

  findAll(
    archived: boolean,
    deleted: boolean,
    search?: string,
    categoryId?: string,
  ): Promise<Note[]> {
    const qb: SelectQueryBuilder<Note> = this.repo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.categories', 'category')
      .where('note.archived = :archived', { archived })
      .andWhere('note.deleted = :deleted', { deleted });

    if (deleted) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      qb.andWhere('note.deletedAt > :cutoff', { cutoff });
    }

    if (search) {
      qb.andWhere(
        '(note.title ILIKE :search OR note.content ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    return qb.orderBy('note.updatedAt', 'DESC').getMany();
  }

  findById(id: string): Promise<Note | null> {
    return this.repo.findOne({ where: { id }, relations: ['categories'] });
  }

  save(partial: Partial<Note>): Promise<Note> {
    return this.repo.save(partial as Note);
  }

  softDelete(note: Note): Promise<Note> {
    return this.repo.save({ ...note, deleted: true, deletedAt: new Date() });
  }

  restore(note: Note): Promise<Note> {
    return this.repo.save({ ...note, deleted: false, deletedAt: null });
  }

  toggleArchive(note: Note): Promise<Note> {
    return this.repo.save({ ...note, archived: !note.archived });
  }

  async hardDelete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async emptyTrash(): Promise<void> {
    await this.repo.delete({ deleted: true });
  }

  addCategory(note: Note, category: Category): Promise<Note> {
    const alreadyAdded = note.categories.some(c => c.id === category.id);
    if (alreadyAdded) return Promise.resolve(note);
    return this.repo.save({ ...note, categories: [...note.categories, category] });
  }

  removeCategory(note: Note, categoryId: string): Promise<Note> {
    return this.repo.save({
      ...note,
      categories: note.categories.filter(c => c.id !== categoryId),
    });
  }
}
