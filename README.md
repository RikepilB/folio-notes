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
