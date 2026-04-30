# AGENTS.md — Folio Notes SPA

## Quick Start
```bash
bash start.sh          # Creates .env files, starts Docker
# Frontend: http://localhost:5173
# API: http://localhost:3000
```

## Key Commands

### Backend
```bash
cd backend
npm run build          # Compile TypeScript
npm run start:dev      # Watch mode
npm run test           # Jest unit tests
npm run lint           # ESLint
```

### Frontend
```bash
cd frontend
npm run dev            # Vite dev server
npm run build          # tsc && vite build
npm run lint           # tsc --noEmit (typecheck only)
npm run test           # Vitest unit tests
npm run test:e2e       # Playwright e2e tests
```

## Architecture

Three-tier backend: **Controller → Service → Repository**.
- Controllers: HTTP only, no TypeORM imports
- Services: Business logic, throw NestJS exceptions (NotFoundException, etc.), no HttpException
- Repositories: All DB access, never import HttpException

**Soft delete rule:** Use `repo.save({ deleted: true, deletedAt: new Date() })` — never `repo.delete()`.

## Phase 2 Features (Implemented)

1. **Add/remove tags (categories)** to a note — Use NoteForm to add categories when creating/editing notes
2. **Filter notes by category** — Use CategoryFilter component in the UI
3. **Sort notes** by creation date — Toggle button in TopBar (Newest/Oldest)

Query params: `?sortBy=createdAt&order=ASC|DESC`

## Important Context

- TypeORM `synchronize: true` only in non-production (`NODE_ENV !== 'production'`)
- CORS configured for `http://localhost:5173` in `backend/src/main.ts`
- Search uses ILIKE via QueryBuilder on `title` and `content`
- See `docs/SYSTEM_ARCHITECTURE.md` for layer details
- See `docs/DESIGN.md` for UI tokens (colors, spacing, typography)