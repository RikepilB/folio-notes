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
