# Folio

A structured notes SPA with category management, archiving, and soft-delete trash.

## Prerequisites

| Tool | Version |
|------|---------|
| Docker Desktop | 4.x |
| Node.js | 20.x |
| npm | 10.x |

## Quick Start

```bash
bash start.sh
```

- Frontend: http://localhost:5173
- API: http://localhost:3000

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /notes | List notes (query: archived, deleted, search, categoryId) |
| GET | /notes/:id | Get single note |
| POST | /notes | Create note (201) |
| PUT | /notes/:id | Update note |
| PATCH | /notes/:id/archive | Toggle archive |
| DELETE | /notes/:id | Soft delete (204) |
| PATCH | /notes/:id/restore | Restore from trash |
| DELETE | /notes/:id/permanent | Hard delete (204) |
| POST | /notes/:id/categories/:catId | Add category to note |
| DELETE | /notes/:id/categories/:catId | Remove category from note |
| GET | /categories | List categories |
| POST | /categories | Create category (201) |
| DELETE | /categories/:id | Delete category (204) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 10 · TypeORM 0.3 · PostgreSQL 16 |
| Frontend | React 18 · Vite 5 · Tailwind CSS 3.4 |
| Language | TypeScript strict (both ends) |
| Runtime | Node 20 · Docker Compose v2 |

## Architecture

Three-tier: Controller (HTTP only) → Service (business logic) → Repository (DB only).

No TypeORM imports in controllers. No HttpException in services or repositories.

## Soft Delete

`DELETE /notes/:id` moves a note to trash (`deleted: true`). It is never permanently removed from the database unless `DELETE /notes/:id/permanent` is called, which only works when the note is already in the trash. The service calls `repo.save(...)` — never `repo.delete(...)` — on the soft-delete path.

## TypeORM synchronize

`synchronize` is `true` only in non-production environments:

```ts
synchronize: process.env.NODE_ENV !== 'production'
```
