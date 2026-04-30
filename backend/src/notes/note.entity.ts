import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('note')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: false })
  archived!: boolean;

  @Column({ default: false })
  deleted!: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  @Column({ default: false })
  isPublic!: boolean;

  @ManyToMany(() => Category, (category) => category.notes, {
    eager: true,
    cascade: true,
  })
  @JoinTable({ name: 'note_categories' })
  categories!: Category[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
