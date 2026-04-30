# Folio — Notes Application

A production-ready, type-safe notes application with category organization, archive, and trash functionality.

## Overview

Folio is a full-stack notes application built with modern, production-ready technologies:
- **Backend**: NestJS 10 + TypeORM 0.3 + PostgreSQL 16
- **Frontend**: React 18 + Vite 5 + Tailwind CSS 3.4
- **Language**: TypeScript 5.x (strict mode on both layers)
- **Testing**: Vitest (unit) + Playwright (E2E)

## Requirements

### Runtime & Tools

| Tool | Version | Required For |
|------|---------|--------------|
| Node.js | 20.x or 22.x | Local development |
| npm | 10.x or 11.x | Package management |
| Docker | 29.x | Container runtime |
| Docker Compose | 2.x | Multi-container orchestration |
| PostgreSQL | 16.x | Database (via Docker) |

### Detailed Version Information

**Node.js & npm:**
```bash
$ node -v
v22.14.0

$ npm -v
11.2.0
```

**Docker:**
```bash
$ docker --version
Docker version 29.2.0, build 0b9d198

$ docker compose version
Docker Compose version v2.30.3
```

**Backend Dependencies:**
- @nestjs/common: ^10.0.0
- @nestjs/core: ^10.0.0
- @nestjs/platform-express: ^10.0.0
- @nestjs/typeorm: ^10.0.0
- typeorm: ^0.3.17
- pg: ^8.11.0
- class-validator: ^0.14.0
- class-transformer: ^0.5.1

**Frontend Dependencies:**
- react: ^18.2.0
- react-dom: ^18.2.0
- vite: ^5.0.0
- tailwindcss: ^3.4.0
- axios: ^1.6.0

**Testing:**
- vitest: ^1.4.0
- @playwright/test: ^1.42.0
- @testing-library/react: ^15.0.0

## Quick Start

```bash
# Clone the repository
git clone https://github.com/hirelens-challenges/Pillaca-52a4e1.git
cd Pillaca-52a4e1

# Start the application (one-command)
./start.sh
```

The `start.sh` script will:
1. Create `.env` files from `.env.example` templates
2. Build and start all Docker containers (postgres, backend, frontend)
3. Initialize the PostgreSQL schema (via TypeORM synchronize)
4. Seed sample data (12 notes, 4 categories)

**Access Points:**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: See endpoint tables below

## How to Use

### Creating a Note

1. Click the **+ New note** button in the top-right corner
2. Enter a title and content
3. Optionally add categories by typing in the category field and pressing Enter
4. Click **Save note**

### Managing Categories

**Add Category to Note:**
- Create or edit a note
- Type a category name in the "Categories" field
- Press Enter to add it (category is created if it doesn't exist)

**Filter Notes by Category:**
- Click on any category pill below the "My Notes" header
- Active notes will be filtered to show only notes with that category

### Sorting Notes

- Click the **Newest/Oldest** toggle button in the top bar
- Notes can be sorted by creation date (ascending or descending)

### Archiving Notes

1. Hover over any note card
2. Click the **Archive** button
3. Archived notes appear in the "Archived" view (via sidebar)

### Trash & Restoration

1. Click **Delete** on a note to move it to trash
2. Navigate to "Recently Deleted" via sidebar
3. **Restore**: Click the restore button to move back to active notes
4. **Permanent Delete**: Click delete to permanently remove

The trash auto-expires notes after 30 days.

### Searching

Type in the search bar at the top to filter notes by title or content (case-insensitive).

## API Endpoints

### Notes

| Method | Endpoint | Query Params | Description |
|--------|----------|--------------|-------------|
| GET | `/notes` | `archived`, `deleted`, `search`, `categoryId`, `sortBy`, `order` | List notes |
| GET | `/notes/:id` | — | Get single note |
| POST | `/notes` | — | Create note |
| PUT | `/notes/:id` | — | Update note |
| PATCH | `/notes/:id/archive` | — | Toggle archive |
| DELETE | `/notes/:id` | — | Move to trash |
| DELETE | `/notes/trash` | — | Empty trash |
| PATCH | `/notes/:id/restore` | — | Restore from trash |
| DELETE | `/notes/:id/permanent` | — | Hard delete |
| POST | `/notes/:id/categories/:catId` | — | Add category |
| DELETE | `/notes/:id/categories/:catId` | — | Remove category |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |
| DELETE | `/categories/:id` | Delete category |

## Project Structure

```
folio/
├── backend/               # NestJS API
│   ├── src/
│   │   ├── notes/        # Notes module
│   │   │   ├── notes.controller.ts   # HTTP handlers
│   │   │   ├── notes.service.ts      # Business logic
│   │   │   ├── notes.repository.ts   # Data access
│   │   │   ├── note.entity.ts        # TypeORM entity
│   │   │   └── dto/                  # Validation DTOs
│   │   ├── categories/              # Categories module
│   │   └── main.ts                   # App entry point
│   ├── package.json
│   └── Dockerfile
│
├── frontend/              # React SPA
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── App.tsx           # Root component
│   │   │   ├── NoteCard.tsx      # Note display
│   │   │   ├── NoteForm.tsx      # Create/edit form
│   │   │   ├── NoteList.tsx      # Note grid
│   │   │   ├── CategoryFilter.tsx # Category pills
│   │   │   ├── TopBar.tsx        # Search + actions
│   │   │   ├── Sidebar.tsx       # Navigation
│   │   │   └── DeleteConfirm.tsx # Delete modal
│   │   ├── api/           # Axios client
│   │   ├── hooks/         # Custom hooks (useNotes.ts)
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Utilities
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── docker-compose.yml     # Container orchestration
├── start.sh              # One-command startup
└── README.md
```

## Testing

### Unit Tests (Backend)

```bash
cd backend
npm test
```

### Unit Tests (Frontend)

```bash
cd frontend
npm run test
```

### E2E Tests (Playwright)

```bash
cd frontend
npm run test:e2e
```

> **Note**: E2E tests require the application to be running.

### Type Checking

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run lint
```

## Features Demonstrated

### Phase 1 — Core Features

- ✅ CRUD operations (create, read, update, delete notes)
- ✅ Category organization
- ✅ Archive functionality
- ✅ Soft-delete trash with 30-day expiry
- ✅ Real-time search
- ✅ Type-safe TypeScript throughout

### Phase 2 — Extra Credit

- ✅ Add/remove categories on notes
- ✅ Filter notes by category
- ✅ Sort notes by creation date (asc/desc)

## Environment Configuration

### Root .env
```
DB_NAME=folio
DB_USER=folio
DB_PASS=folio
DB_PORT=5432
PORT=3000
VITE_API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### Backend .env
```
NODE_ENV=development
PORT=3000
DB_HOST=postgres
DB_PORT=5432
DB_NAME=folio
DB_USER=folio
DB_PASS=folio
FRONTEND_URL=http://localhost:5173
```

## Manual Setup (Without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Troubleshooting

### Port Already in Use

```bash
docker compose down
```

### Database Connection Failed

```bash
docker compose logs postgres
```

### Frontend Shows Network Error

Ensure the backend is running:
```bash
docker compose logs backend
```

### Reset Database

```bash
docker compose down -v  # Remove volumes
docker compose up -d     # Fresh start
```

## Architecture

**Three-tier architecture:**
- **Controller**: HTTP only, delegates to service
- **Service**: Business logic, throws domain exceptions (NotFoundException, BadRequestException)
- **Repository**: All TypeORM/DB access

**Soft delete rule:** Use `repo.save({ deleted: true, deletedAt: new Date() })` — never `repo.delete()`.

---

Built with NestJS 10, React 18, TypeScript, Docker, PostgreSQL