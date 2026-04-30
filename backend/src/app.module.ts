import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';
import { Note } from './notes/note.entity';
import { Category } from './categories/category.entity';
import { SeedModule } from './seed/seed.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'] ?? 'localhost',
      port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
      username: process.env['DB_USER'] ?? 'folio',
      password: process.env['DB_PASS'] ?? 'folio',
      database: process.env['DB_NAME'] ?? 'folio',
      entities: [Note, Category],
      synchronize: process.env['NODE_ENV'] !== 'production',
    }),
    NotesModule,
    CategoriesModule,
    SeedModule,
  ],
})
export class AppModule {}