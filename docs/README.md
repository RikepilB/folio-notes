# Folio
**Your thoughts, structured.**

A full-stack notes app — create, edit, archive, search, and categorize your notes.
SPA frontend (React + Vite) backed by a REST API (NestJS) with PostgreSQL.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Docker Desktop | 4.x+ | `docker --version` |
| Docker Compose | v2+ | `docker compose version` |

> Node.js is only needed for local development without Docker.
> For the standard run, Docker is all you need.

---

## Quick start (one command)

```bash
bash start.sh
```

This will:
1. Build Docker images for the backend and frontend
2. Start PostgreSQL with a health check
3. Start NestJS (waits for DB to be ready)
4. Start the React dev server

**Access the app:**
- Frontend → http://localhost:5173
- API → http://localhost:3000

---

## Local development (without Docker)

**1. Start PostgreSQL** (or use your own):
```bash
docker run -d \
  -e POSTGRES_DB=folio_db \
  -e POSTGRES_USER=folio_user \
  -e POSTGRES_PASSWORD=folio_pass \
  -p 5432:5432 \
  postgres:16-alpine
```

**2. Backend:**
```bash
cd backend
cp .env.example .env   # fill in DB credentials
npm install
npm run start:dev      # runs on :3000
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev            # runs on :5173
```

---

## Tech stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16 |
| Frontend | React + Vite | 18.x / 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Language | TypeScript (both) | 5.x |
| Runtime | Node.js | 20.x |
| Container | Docker Compose | v2 |

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/notes?archived=false` | Active notes |
| GET | `/notes?archived=true` | Archived notes |
| GET | `/notes?deleted=true` | Recently deleted (30-day hold) |
| GET | `/notes?search=:q` | Search title + content |
| GET | `/notes?categoryId=:id` | Filter by category |
| POST | `/notes` | Create note (201) |
| PUT | `/notes/:id` | Edit note |
| PATCH | `/notes/:id/archive` | Toggle archive state |
| DELETE | `/notes/:id` | Soft-delete (moves to trash) |
| PATCH | `/notes/:id/restore` | Restore from trash |
| DELETE | `/notes/:id/permanent` | Permanently delete |
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |
| POST | `/notes/:id/categories/:catId` | Add category to note |
| DELETE | `/notes/:id/categories/:catId` | Remove category from note |

---

## Architecture

```
React SPA (Vite) :5173
     ↓ HTTP/REST Axios
NestJS REST API :3000
  Controller → Service → Repository
     ↓ TypeORM
PostgreSQL :5432
```

Layer separation enforced: controllers handle HTTP only, services hold business logic, repositories own all DB access.

---

## Notes

- **No authentication** — single-user app (auth is optional per exercise spec; see US-12 for planned Clerk integration)
- **Soft delete** — `DELETE /notes/:id` sets `deleted=true` and `deletedAt=now()`. Notes are held 30 days in "Recently Deleted" before hard-expiry.
- **TypeORM synchronize** — `synchronize:true` in development auto-creates tables from entities. Production path: set `synchronize:false` and run `typeorm migration:run`
- All commits authored solely by the developer

---

## Project structure

```
folio/
├── backend/        NestJS REST API
│   └── src/
│       ├── notes/        Controller + Service + Repository + Entity
│       └── categories/   Controller + Service + Entity
├── frontend/       React SPA
│   └── src/
│       ├── api/          Axios calls
│       ├── hooks/        useNotes custom hook
│       └── components/   NoteCard, NoteForm, NoteList, CategoryFilter...
├── docs/           PRD, design system, architecture, user stories
├── docker-compose.yml
├── start.sh
└── README.md
```

