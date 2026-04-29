# Folio — Initial Project Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the complete Folio notes SPA (NestJS backend + React/Vite frontend + PostgreSQL + Docker Compose) and make the initial git commit.

**Architecture:** Three-layer backend (Controller → Service → Repository) with NestJS 10/TypeORM 0.3/PostgreSQL 16; React 18/Vite 5/Tailwind 3.4 frontend communicating via Axios; both services defined in Docker Compose with a health-checked Postgres.

**Tech Stack:** NestJS 10, TypeORM 0.3, PostgreSQL 16, React 18, Vite 5, Tailwind CSS 3.4, Axios, TypeScript strict, Docker Compose v2, Node 20.

---

## File Map

```
project-root/  (current template dir)
├── backend/
│   ├── src/
│   │   ├── notes/
│   │   │   ├── note.entity.ts
│   │   │   ├── notes.controller.ts
│   │   │   ├── notes.service.ts
│   │   │   ├── notes.repository.ts
│   │   │   ├── notes.module.ts
│   │   │   ├── notes.service.spec.ts
│   │   │   └── dto/
│   │   │       ├── create-note.dto.ts
│   │   │       └── update-note.dto.ts
│   │   ├── categories/
│   │   │   ├── category.entity.ts
│   │   │   ├── categories.controller.ts
│   │   │   ├── categories.service.ts
│   │   │   ├── categories.module.ts
│   │   │   └── dto/create-category.dto.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── Dockerfile
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/
│   ├── src/
│   │   ├── api/notesApi.ts
│   │   ├── hooks/useNotes.ts
│   │   ├── components/
│   │   │   ├── NoteCard.tsx
│   │   │   ├── NoteList.tsx
│   │   │   ├── NoteForm.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── DeleteConfirm.tsx
│   │   ├── types/index.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── tsconfig.node.json
├── docs/
│   ├── DESIGN_SYSTEM.md
│   ├── USER_STORIES.md
│   ├── SYSTEM_ARCHITECTURE.md
│   └── ERD.md
├── docker-compose.yml
├── start.sh
├── .gitignore
└── README.md
```

---

## Task 1: Root infrastructure files

**Files:**
- Create: `.gitignore`
- Create: `start.sh`
- Create: `docker-compose.yml`
- Create: `README.md`

- [ ] **Step 1: Create `.gitignore`**

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
*.js.map

# Environment files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Coverage
coverage/

# Private files
DEVLOG.md
claude.md
.claude/
```

- [ ] **Step 2: Create `start.sh`**

```bash
#!/bin/bash
set -e
docker compose up --build
```

Run: `chmod +x start.sh`

- [ ] **Step 3: Create `docker-compose.yml`**

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: folio
      POSTGRES_PASSWORD: folio_password
      POSTGRES_DB: folio_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U folio -d folio_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    ports:
      - "3000:3000"
    env_file:
      - ./backend/.env.example
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: "5432"
      DB_USERNAME: folio
      DB_PASSWORD: folio_password
      DB_NAME: folio_db
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend

volumes:
  postgres_data:
```

- [ ] **Step 4: Create `README.md`**

```markdown
# Folio

A notes SPA with category management, archiving, and trash.

## Stack

- **Backend**: NestJS 10 · TypeORM 0.3 · PostgreSQL 16 · TypeScript strict
- **Frontend**: React 18 · Vite 5 · Tailwind CSS 3.4 · TypeScript strict
- **Runtime**: Node 20 · Docker Compose v2

## Quick Start

```bash
cp backend/.env.example backend/.env
./start.sh
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

## Development

```bash
# Backend
cd backend && npm install && npm run start:dev

# Frontend
cd frontend && npm install && npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /notes | List notes (query: archived, deleted, search, categoryId) |
| POST | /notes | Create note |
| PUT | /notes/:id | Update note |
| PATCH | /notes/:id/archive | Toggle archive |
| DELETE | /notes/:id | Soft delete |
| PATCH | /notes/:id/restore | Restore from trash |
| DELETE | /notes/:id/permanent | Hard delete |
| GET | /categories | List categories |
| POST | /categories | Create category |
| POST | /notes/:id/categories/:catId | Add category to note |
| DELETE | /notes/:id/categories/:catId | Remove category from note |
```

- [ ] **Step 5: Validate docker-compose**

Run: `docker compose config`
Expected: Prints valid config with no errors.

---

## Task 2: Backend config files

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nest-cli.json`
- Create: `backend/.env.example`
- Create: `backend/Dockerfile`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "folio-backend",
  "version": "0.1.0",
  "description": "Folio notes app backend",
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage"
  },
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/mapped-types": "^2.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "pg": "^8.11.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "typeorm": "^0.3.17"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.0",
    "@types/node": "^20.3.1",
    "jest": "^29.5.0",
    "ts-jest": "^29.1.0",
    "typescript": "^5.1.3"
  },
  "jest": {
    "moduleFileExtensions": ["js", "json", "ts"],
    "rootDir": "src",
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": ["**/*.(t|j)s"],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

- [ ] **Step 3: Create `backend/nest-cli.json`**

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true
  }
}
```

- [ ] **Step 4: Create `backend/.env.example`**

```
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=folio
DB_PASSWORD=folio_password
DB_NAME=folio_db
PORT=3000
```

- [ ] **Step 5: Create `backend/Dockerfile`**

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/main"]
```

---

## Task 3: Backend entities

**Files:**
- Create: `backend/src/notes/note.entity.ts`
- Create: `backend/src/categories/category.entity.ts`

- [ ] **Step 1: Create `backend/src/categories/category.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;
}
```

- [ ] **Step 2: Create `backend/src/notes/note.entity.ts`**

```typescript
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

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  archived: boolean;

  @Column({ default: false })
  deleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ default: false })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Category, { eager: true })
  @JoinTable({
    name: 'note_categories',
    joinColumn: { name: 'note_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: Category[];
}
```

---

## Task 4: Backend DTOs

**Files:**
- Create: `backend/src/notes/dto/create-note.dto.ts`
- Create: `backend/src/notes/dto/update-note.dto.ts`
- Create: `backend/src/categories/dto/create-category.dto.ts`

- [ ] **Step 1: Create `backend/src/notes/dto/create-note.dto.ts`**

```typescript
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsArray,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  categoryIds?: string[];
}
```

- [ ] **Step 2: Create `backend/src/notes/dto/update-note.dto.ts`**

```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateNoteDto } from './create-note.dto';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}
```

- [ ] **Step 3: Create `backend/src/categories/dto/create-category.dto.ts`**

```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;
}
```

---

## Task 5: Backend repository (notes)

**Files:**
- Create: `backend/src/notes/notes.repository.ts`

- [ ] **Step 1: Create `backend/src/notes/notes.repository.ts`**

```typescript
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
```

---

## Task 6: Backend services

**Files:**
- Create: `backend/src/categories/categories.service.ts`
- Create: `backend/src/notes/notes.service.ts`

- [ ] **Step 1: Create `backend/src/categories/categories.service.ts`**

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.repo.find();
  }

  findById(id: string): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.repo.findOne({ where: { name: dto.name } });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    const category = this.repo.create({ name: dto.name });
    return this.repo.save(category);
  }
}
```

- [ ] **Step 2: Create `backend/src/notes/notes.service.ts`**

```typescript
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
```

---

## Task 7: Backend controllers

**Files:**
- Create: `backend/src/categories/categories.controller.ts`
- Create: `backend/src/notes/notes.controller.ts`

- [ ] **Step 1: Create `backend/src/categories/categories.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category } from './category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }
}
```

- [ ] **Step 2: Create `backend/src/notes/notes.controller.ts`**

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Note } from './note.entity';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  findAll(
    @Query('archived') archived?: string,
    @Query('deleted') deleted?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
  ): Promise<Note[]> {
    return this.notesService.findAll({
      archived: archived !== undefined ? archived === 'true' : undefined,
      deleted: deleted !== undefined ? deleted === 'true' : false,
      search,
      categoryId,
    });
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateNoteDto): Promise<Note> {
    return this.notesService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNoteDto): Promise<Note> {
    return this.notesService.update(id, dto);
  }

  @Patch(':id/archive')
  toggleArchive(@Param('id') id: string): Promise<Note> {
    return this.notesService.toggleArchive(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async softDelete(@Param('id') id: string): Promise<void> {
    await this.notesService.softDelete(id);
  }

  @Patch(':id/restore')
  restore(@Param('id') id: string): Promise<Note> {
    return this.notesService.restore(id);
  }

  @Delete(':id/permanent')
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string): Promise<void> {
    await this.notesService.hardDelete(id);
  }

  @Post(':id/categories/:catId')
  addCategory(
    @Param('id') noteId: string,
    @Param('catId') catId: string,
  ): Promise<Note> {
    return this.notesService.addCategory(noteId, catId);
  }

  @Delete(':id/categories/:catId')
  removeCategory(
    @Param('id') noteId: string,
    @Param('catId') catId: string,
  ): Promise<Note> {
    return this.notesService.removeCategory(noteId, catId);
  }
}
```

---

## Task 8: Backend modules + entry

**Files:**
- Create: `backend/src/categories/categories.module.ts`
- Create: `backend/src/notes/notes.module.ts`
- Create: `backend/src/app.module.ts`
- Create: `backend/src/main.ts`

- [ ] **Step 1: Create `backend/src/categories/categories.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category } from './category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category])],
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
```

- [ ] **Step 2: Create `backend/src/notes/notes.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { NotesRepository } from './notes.repository';
import { Note } from './note.entity';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [TypeOrmModule.forFeature([Note]), CategoriesModule],
  controllers: [NotesController],
  providers: [NotesService, NotesRepository],
})
export class NotesModule {}
```

- [ ] **Step 3: Create `backend/src/app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { CategoriesModule } from './categories/categories.module';
import { Note } from './notes/note.entity';
import { Category } from './categories/category.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env['DB_HOST'] ?? 'localhost',
      port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
      username: process.env['DB_USERNAME'] ?? 'folio',
      password: process.env['DB_PASSWORD'] ?? 'folio_password',
      database: process.env['DB_NAME'] ?? 'folio_db',
      entities: [Note, Category],
      synchronize: process.env['NODE_ENV'] !== 'production',
    }),
    NotesModule,
    CategoriesModule,
  ],
})
export class AppModule {}
```

- [ ] **Step 4: Create `backend/src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env['PORT'] ?? 3000;
  await app.listen(port);
}

bootstrap();
```

---

## Task 9: Backend unit test

**Files:**
- Create: `backend/src/notes/notes.service.spec.ts`

- [ ] **Step 1: Create `backend/src/notes/notes.service.spec.ts`**

```typescript
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
```

- [ ] **Step 2: Verify test structure is correct (no run yet — DB not available)**

Confirm the file has no TypeScript syntax errors by reviewing the imports. All mocked methods match the actual `NotesRepository` interface defined in Task 5.

---

## Task 10: Frontend config files

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/tsconfig.node.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/Dockerfile`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "folio-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create `frontend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 3: Create `frontend/tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 4: Create `frontend/vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
```

- [ ] **Step 5: Create `frontend/tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange: 'var(--brand-orange)',
          violet: 'var(--brand-violet)',
          'violet-light': 'var(--brand-violet-light)',
          'violet-dark': 'var(--brand-violet-dark)',
        },
        surface: 'var(--surface)',
        surf2: 'var(--surf2)',
        border: 'var(--border)',
        border2: 'var(--border2)',
        'text-muted': 'var(--text-muted)',
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create `frontend/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

---

## Task 11: Frontend entry files

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/src/index.css`
- Create: `frontend/src/main.tsx`

- [ ] **Step 1: Create `frontend/index.html`**

```html
<!DOCTYPE html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Folio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Create `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --brand-orange: #F8612D;
  --brand-violet: #5F44C5;
  --brand-violet-light: #BB5BFF;
  --brand-violet-dark: #3E1544;
  --surface: #111010;
  --surf2: #1A1820;
  --border: #2A2830;
  --border2: #3A3648;
  --text-muted: #7A7974;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background-color: var(--surface);
  color: #ffffff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 3: Create `frontend/src/main.tsx`**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in DOM');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

---

## Task 12: Frontend types and API layer

**Files:**
- Create: `frontend/src/types/index.ts`
- Create: `frontend/src/api/notesApi.ts`

- [ ] **Step 1: Create `frontend/src/types/index.ts`**

```typescript
export interface Category {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  archived: boolean;
  deleted: boolean;
  deletedAt: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface CreateNotePayload {
  title: string;
  content: string;
  isPublic?: boolean;
  categoryIds?: string[];
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  isPublic?: boolean;
  categoryIds?: string[];
}

export interface CreateCategoryPayload {
  name: string;
}
```

- [ ] **Step 2: Create `frontend/src/api/notesApi.ts`**

```typescript
import axios from 'axios';
import type {
  Note,
  Category,
  CreateNotePayload,
  UpdateNotePayload,
  CreateCategoryPayload,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface FetchNotesParams {
  archived?: boolean;
  deleted?: boolean;
  search?: string;
  categoryId?: string;
}

export const notesApi = {
  fetchNotes(params?: FetchNotesParams): Promise<Note[]> {
    return api.get<Note[]>('/notes', { params }).then(r => r.data);
  },

  createNote(payload: CreateNotePayload): Promise<Note> {
    return api.post<Note>('/notes', payload).then(r => r.data);
  },

  updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
    return api.put<Note>(`/notes/${id}`, payload).then(r => r.data);
  },

  toggleArchive(id: string): Promise<Note> {
    return api.patch<Note>(`/notes/${id}/archive`).then(r => r.data);
  },

  deleteNote(id: string): Promise<void> {
    return api.delete(`/notes/${id}`).then(() => undefined);
  },

  restoreNote(id: string): Promise<Note> {
    return api.patch<Note>(`/notes/${id}/restore`).then(r => r.data);
  },

  permanentDelete(id: string): Promise<void> {
    return api.delete(`/notes/${id}/permanent`).then(() => undefined);
  },

  fetchCategories(): Promise<Category[]> {
    return api.get<Category[]>('/categories').then(r => r.data);
  },

  createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return api.post<Category>('/categories', payload).then(r => r.data);
  },

  addCategory(noteId: string, catId: string): Promise<Note> {
    return api.post<Note>(`/notes/${noteId}/categories/${catId}`).then(r => r.data);
  },

  removeCategory(noteId: string, catId: string): Promise<Note> {
    return api.delete<Note>(`/notes/${noteId}/categories/${catId}`).then(r => r.data);
  },
};
```

---

## Task 13: Frontend hook

**Files:**
- Create: `frontend/src/hooks/useNotes.ts`

- [ ] **Step 1: Create `frontend/src/hooks/useNotes.ts`**

```typescript
import { useState, useEffect, useCallback, useRef } from 'react';
import { notesApi } from '../api/notesApi';
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
} from '../types';

export interface FetchNotesParams {
  archived?: boolean;
  deleted?: boolean;
  search?: string;
  categoryId?: string;
}

export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (payload: CreateNotePayload) => Promise<Note>;
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<Note>;
  permanentDelete: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<Note>;
  refetch: () => void;
}

export function useNotes(params?: FetchNotesParams): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsKey = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    notesApi
      .fetchNotes(paramsRef.current)
      .then(setNotes)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load notes';
        setError(message);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createNote = useCallback(async (payload: CreateNotePayload): Promise<Note> => {
    const note = await notesApi.createNote(payload);
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    const updated = await notesApi.updateNote(id, payload);
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    await notesApi.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const restoreNote = useCallback(async (id: string): Promise<Note> => {
    const restored = await notesApi.restoreNote(id);
    setNotes(prev => prev.map(n => (n.id === id ? restored : n)));
    return restored;
  }, []);

  const permanentDelete = useCallback(async (id: string): Promise<void> => {
    await notesApi.permanentDelete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleArchive = useCallback(async (id: string): Promise<Note> => {
    const updated = await notesApi.toggleArchive(id);
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentDelete,
    toggleArchive,
    refetch: fetch,
  };
}
```

---

## Task 14: Frontend components

**Files:**
- Create: `frontend/src/components/NoteCard.tsx`
- Create: `frontend/src/components/NoteList.tsx`
- Create: `frontend/src/components/NoteForm.tsx`
- Create: `frontend/src/components/CategoryFilter.tsx`
- Create: `frontend/src/components/Sidebar.tsx`
- Create: `frontend/src/components/TopBar.tsx`
- Create: `frontend/src/components/DeleteConfirm.tsx`

- [ ] **Step 1: Create `frontend/src/components/NoteCard.tsx`**

```typescript
import React from 'react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleArchive,
}: NoteCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white truncate">{note.title}</h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onToggleArchive(note.id)}
            className="text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--border)]"
          >
            {note.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={() => onEdit(note)}
            className="text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--border)]"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-[var(--border)]"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)] line-clamp-3">{note.content}</p>
      {note.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.categories.map(cat => (
            <span
              key={cat.id}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-violet-dark)] text-[var(--brand-violet-light)]"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `frontend/src/components/NoteList.tsx`**

```typescript
import React from 'react';
import type { Note } from '../types';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

export function NoteList({
  notes,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleArchive,
}: NoteListProps): React.ReactElement {
  if (loading) {
    return (
      <p className="text-[var(--text-muted)] text-center py-8">Loading notes…</p>
    );
  }
  if (error) {
    return <p className="text-red-400 text-center py-8">{error}</p>;
  }
  if (notes.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-center py-8">No notes found.</p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleArchive={onToggleArchive}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Create `frontend/src/components/NoteForm.tsx`**

```typescript
import React, { useState, useEffect } from 'react';
import type { Note, Category, CreateNotePayload } from '../types';

interface NoteFormProps {
  note?: Note;
  categories: Category[];
  onSubmit: (payload: CreateNotePayload) => Promise<void>;
  onCancel: () => void;
}

export function NoteForm({
  note,
  categories,
  onSubmit,
  onCancel,
}: NoteFormProps): React.ReactElement {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [isPublic, setIsPublic] = useState(note?.isPublic ?? false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    note?.categories.map(c => c.id) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setIsPublic(note?.isPublic ?? false);
    setSelectedCategoryIds(note?.categories.map(c => c.id) ?? []);
  }, [note]);

  const toggleCategory = (id: string): void => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, content, isPublic, categoryIds: selectedCategoryIds });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        maxLength={255}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-violet)]"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        rows={6}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-violet)] resize-none"
      />
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedCategoryIds.includes(cat.id)
                  ? 'bg-[var(--brand-violet)] border-[var(--brand-violet)] text-white'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-violet)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="rounded"
        />
        Make public
      </label>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-[var(--brand-orange)] text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : note ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create `frontend/src/components/CategoryFilter.tsx`**

```typescript
import React from 'react';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(undefined)}
        className={`text-sm px-3 py-1 rounded-full border transition-colors ${
          selectedId === undefined
            ? 'bg-[var(--brand-violet)] border-[var(--brand-violet)] text-white'
            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-violet)]'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            selectedId === cat.id
              ? 'bg-[var(--brand-violet)] border-[var(--brand-violet)] text-white'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-violet)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Create `frontend/src/components/Sidebar.tsx`**

```typescript
import React from 'react';

export type ViewMode = 'notes' | 'archived' | 'trash';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const NAV_ITEMS: { label: string; view: ViewMode }[] = [
  { label: 'Notes', view: 'notes' },
  { label: 'Archived', view: 'archived' },
  { label: 'Trash', view: 'trash' },
];

export function Sidebar({
  currentView,
  onViewChange,
}: SidebarProps): React.ReactElement {
  return (
    <aside className="w-48 shrink-0 border-r border-[var(--border)] h-full flex flex-col p-4 gap-1">
      <span className="text-lg font-bold text-white mb-4">Folio</span>
      {NAV_ITEMS.map(item => (
        <button
          key={item.view}
          onClick={() => onViewChange(item.view)}
          className={`text-left px-3 py-2 rounded text-sm transition-colors ${
            currentView === item.view
              ? 'bg-[var(--brand-violet)] text-white'
              : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--border)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
```

- [ ] **Step 6: Create `frontend/src/components/TopBar.tsx`**

```typescript
import React from 'react';

interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onNewNote: () => void;
}

export function TopBar({
  search,
  onSearchChange,
  onNewNote,
}: TopBarProps): React.ReactElement {
  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-[var(--border)] bg-[var(--surf2)]">
      <input
        type="text"
        placeholder="Search notes…"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="flex-1 max-w-sm rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-violet)]"
      />
      <button
        onClick={onNewNote}
        className="px-4 py-2 rounded bg-[var(--brand-orange)] text-white text-sm font-medium hover:opacity-90"
      >
        + New Note
      </button>
    </header>
  );
}
```

- [ ] **Step 7: Create `frontend/src/components/DeleteConfirm.tsx`**

```typescript
import React from 'react';

interface DeleteConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-6 max-w-sm w-full mx-4">
        <p className="text-white mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## Task 15: Frontend App component

**Files:**
- Create: `frontend/src/App.tsx`

- [ ] **Step 1: Create `frontend/src/App.tsx`**

```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ViewMode } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { NoteList } from './components/NoteList';
import { NoteForm } from './components/NoteForm';
import { CategoryFilter } from './components/CategoryFilter';
import { DeleteConfirm } from './components/DeleteConfirm';
import { useNotes } from './hooks/useNotes';
import { notesApi } from './api/notesApi';
import type { Note, Category, CreateNotePayload, UpdateNotePayload } from './types';

export default function App(): React.ReactElement {
  const [view, setView] = useState<ViewMode>('notes');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);

  const notesParams = {
    archived: view === 'archived' ? true : undefined,
    deleted: view === 'trash' ? true : false,
    search: search || undefined,
    categoryId: selectedCategoryId,
  };

  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
  } = useNotes(notesParams);

  useEffect(() => {
    notesApi
      .fetchCategories()
      .then(setCategories)
      .catch((err: unknown) => console.error('Failed to load categories', err));
  }, []);

  const handleNewNote = useCallback((): void => {
    setEditingNote(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((note: Note): void => {
    setEditingNote(note);
    setIsFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (payload: CreateNotePayload): Promise<void> => {
      if (editingNote) {
        await updateNote(editingNote.id, payload as UpdateNotePayload);
      } else {
        await createNote(payload);
      }
      setIsFormOpen(false);
      setEditingNote(undefined);
    },
    [editingNote, updateNote, createNote],
  );

  const handleCancelForm = useCallback((): void => {
    setIsFormOpen(false);
    setEditingNote(undefined);
  }, []);

  const handleDeleteRequest = useCallback((id: string): void => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!deleteId) return;
    await deleteNote(deleteId);
    setDeleteId(undefined);
  }, [deleteId, deleteNote]);

  const handleDeleteCancel = useCallback((): void => {
    setDeleteId(undefined);
  }, []);

  const handleToggleArchive = useCallback(
    (id: string): void => {
      void toggleArchive(id);
    },
    [toggleArchive],
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={view} onViewChange={setView} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          search={search}
          onSearchChange={setSearch}
          onNewNote={handleNewNote}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <CategoryFilter
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>
          {isFormOpen ? (
            <div className="max-w-xl">
              <NoteForm
                note={editingNote}
                categories={categories}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            </div>
          ) : (
            <NoteList
              notes={notes}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onToggleArchive={handleToggleArchive}
            />
          )}
        </main>
      </div>
      {deleteId !== undefined && (
        <DeleteConfirm
          message="Move this note to trash?"
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
```

---

## Task 16: Docs stubs

**Files:**
- Create: `docs/DESIGN_SYSTEM.md`
- Create: `docs/USER_STORIES.md`
- Create: `docs/SYSTEM_ARCHITECTURE.md`
- Create: `docs/ERD.md`

- [ ] **Step 1: Create `docs/DESIGN_SYSTEM.md`**

```markdown
# Folio Design System

## Color Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--brand-orange` | `#F8612D` | Primary CTA buttons |
| `--brand-violet` | `#5F44C5` | Active states, selection |
| `--brand-violet-light` | `#BB5BFF` | Category badges text |
| `--brand-violet-dark` | `#3E1544` | Category badge background |
| `--surface` | `#111010` | App background |
| `--surf2` | `#1A1820` | Card/panel background |
| `--border` | `#2A2830` | Default borders |
| `--border2` | `#3A3648` | Elevated borders |
| `--text-muted` | `#7A7974` | Secondary text |

## Dark Mode

Dark mode is the default and only mode. `<html class="dark">` is set statically in `index.html`.

## Typography

System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

## Spacing

Tailwind defaults. Component-level spacing uses `gap-*` utilities.
```

- [ ] **Step 2: Create `docs/USER_STORIES.md`**

```markdown
# Folio User Stories

## Note Management

- As a user, I can create a note with a title and content.
- As a user, I can edit a note's title, content, and categories.
- As a user, I can archive a note to hide it from the main view.
- As a user, I can move a note to trash (soft delete).
- As a user, I can restore a note from trash.
- As a user, I can permanently delete a trashed note.
- As a user, I can search notes by title or content.

## Category Management

- As a user, I can create categories.
- As a user, I can filter notes by category.
- As a user, I can assign one or more categories to a note.
- As a user, I can remove a category from a note.

## Navigation

- As a user, I can switch between Notes, Archived, and Trash views.
```

- [ ] **Step 3: Create `docs/SYSTEM_ARCHITECTURE.md`**

```markdown
# Folio System Architecture

## Overview

Three-tier architecture: React SPA → NestJS REST API → PostgreSQL.

## Backend Layers

```
HTTP Request
    │
    ▼
Controller      — validates HTTP, delegates to service, returns response
    │
    ▼
Service         — business logic, throws domain exceptions (NotFoundException, etc.)
    │
    ▼
Repository      — all TypeORM/DB access, never imports HttpException
    │
    ▼
PostgreSQL
```

## Key Rules

1. Controllers never access the database directly.
2. Services never import `HttpException` — they throw NestJS exceptions.
3. Repositories never import `HttpException`.
4. Soft delete uses `repo.save()` with `{ deleted: true, deletedAt: new Date() }`.
5. Search uses ILIKE via QueryBuilder on both `title` and `content`.
6. CORS is enabled for `http://localhost:5173` before any routes in `main.ts`.
7. `synchronize: true` is only active when `NODE_ENV !== 'production'`.

## Frontend Architecture

```
App.tsx                 — state orchestration, routing between views
  ├── Sidebar           — view navigation (notes / archived / trash)
  ├── TopBar            — search input + new note button
  ├── CategoryFilter    — horizontal category pill filter
  ├── NoteList          — grid of NoteCard components
  ├── NoteForm          — create/edit form (replaces NoteList when open)
  └── DeleteConfirm     — modal overlay for destructive actions

hooks/useNotes.ts       — fetches + caches notes, exposes CRUD actions
api/notesApi.ts         — axios wrapper for all API calls
```
```

- [ ] **Step 4: Create `docs/ERD.md`**

```markdown
# Folio Entity Relationship Diagram

## Entities

### notes
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, generated |
| title | varchar(255) | NOT NULL |
| content | text | NOT NULL |
| archived | boolean | DEFAULT false |
| deleted | boolean | DEFAULT false |
| deletedAt | timestamp | NULLABLE |
| isPublic | boolean | DEFAULT false |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### categories
| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | PK, generated |
| name | varchar(100) | UNIQUE, NOT NULL |

### note_categories (join table)
| Column | Type | Constraints |
|--------|------|-------------|
| note_id | uuid | FK → notes.id |
| category_id | uuid | FK → categories.id |

## Relationships

- `Note` ManyToMany `Category` via `note_categories` join table
- Join table is auto-managed by TypeORM `@JoinTable` decorator on `Note.categories`
```

---

## Task 17: Git init and initial commit

- [ ] **Step 1: Initialize git**

```bash
git init
```

Expected: `Initialized empty Git repository in .git/`

- [ ] **Step 2: Configure git identity**

```bash
git config user.name "YOUR_NAME_HERE"
git config user.email "YOUR_EMAIL_HERE"
```

> Replace `YOUR_NAME_HERE` and `YOUR_EMAIL_HERE` with actual values.

- [ ] **Step 3: Stage all files**

```bash
git add .gitignore start.sh docker-compose.yml README.md \
  backend/ frontend/ docs/
```

- [ ] **Step 4: Verify staging**

```bash
git status
```

Expected: All new files listed under "Changes to be committed". No `.env` files staged.

- [ ] **Step 5: Create initial commit**

```bash
git commit -m "feat: initial project scaffold — Folio notes app"
```

Expected: `[main (root-commit) xxxxxxx] feat: initial project scaffold — Folio notes app`

- [ ] **Step 6: Create develop and feature branches**

```bash
git checkout -b develop
git checkout -b feature/phase-1-notes
git checkout main
```

Expected: Currently on `main` branch.

---

## Task 18: Verify scaffold

- [ ] **Step 1: Verify backend install**

```bash
cd backend && npm install
```

Expected: No errors. `node_modules/` created. Packages: `@nestjs/common`, `typeorm`, `pg`, `class-validator` present.

- [ ] **Step 2: Verify frontend install**

```bash
cd ../frontend && npm install
```

Expected: No errors. `node_modules/` created. Packages: `react`, `axios`, `tailwindcss`, `vite` present.

- [ ] **Step 3: Validate docker-compose**

```bash
cd .. && docker compose config
```

Expected: Valid YAML printed. Services: `postgres`, `backend`, `frontend`. `healthcheck` present on postgres. `depends_on` with `service_healthy` on backend.

- [ ] **Step 4: Confirm no `.env` in git**

```bash
git ls-files | grep "\.env"
```

Expected: Only `.env.example` listed. No `.env` files tracked.

---

## Self-Review Checklist

**Spec coverage:**
- [x] All 11 API endpoints implemented in controller
- [x] Soft delete uses `repo.save()` not `repo.delete()` (Task 5, `softDelete` method)
- [x] Search uses ILIKE QueryBuilder on title + content (Task 5, `findAll`)
- [x] CORS enabled before routes in `main.ts` (Task 8)
- [x] ValidationPipe with whitelist/forbidNonWhitelisted/transform (Task 8)
- [x] synchronize only when NODE_ENV !== 'production' (Task 8, `app.module.ts`)
- [x] All DTOs use class-validator decorators (Tasks 4)
- [x] strict TypeScript in both tsconfigs (Tasks 2, 10)
- [x] No `any` types used anywhere
- [x] Docker Compose: postgres health check, backend condition: service_healthy (Task 1)
- [x] start.sh with #!/bin/bash + chmod +x (Task 1)
- [x] .gitignore excludes node_modules, .env, dist, DEVLOG.md, claude.md, .claude/ (Task 1)
- [x] All 7 frontend components created (Task 14)
- [x] Design tokens in index.css as CSS vars (Task 11)
- [x] Tailwind config maps CSS vars to utility classes (Task 10)
- [x] ManyToMany via note_categories with @JoinTable (Task 3)
- [x] Branches: develop and feature/phase-1-notes created (Task 17)

**Type consistency:**
- `Note` type in `types/index.ts` matches `note.entity.ts` field names exactly
- `FetchNotesParams` exported from both `notesApi.ts` and `useNotes.ts` (same shape)
- `ViewMode` exported from `Sidebar.tsx` and used in `App.tsx`
- `NotesRepository` method signatures in spec match what `NotesService` calls
