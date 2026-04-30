# Folio — Notes Application

A type-safe notes application with category organization, archive, and trash functionality.

## Overview

Folio is a full-stack notes application built with modern, production-ready technologies. It provides a clean REST API for note management with soft-delete capabilities and a responsive React frontend.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 20.x | LTS recommended |
| npm | 10.x | Comes with Node.js |
| Docker | 24.x | Desktop on macOS/Windows |
| Docker Compose | 2.x | Included with Docker |

## Quick Start

```bash
# Clone and enter the repository
git clone <repository-url>
cdfolio

# Start the application
./start.sh
```

This will:
1. Create the `.env` configuration file
2. Build and start all Docker containers
3. Initialize the PostgreSQL schema
4. Seed sample data (12 notes, 4 categories)

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Project Structure

```
folio/
├── backend/               # NestJS 10 + TypeORM + PostgreSQL
│   ├── src/
│   │   ├── notes/       # Notes module (controller/service/repository)
│   │   ├── categories/ # Categories module
│   │   └── seed/       # Database seeder service
│   ├── seed.sql       # SQL seed data
│   └── Dockerfile
│
├── frontend/             # React 18 + Vite 5 + Tailwind CSS
│   ├── src/
│   │   ├── api/       # Axios API client
│   │   ├── components/ # React components
│   │   ├── hooks/    # Custom React hooks
│   │   └── types/    # TypeScript interfaces
│   └── Dockerfile
│
├── docker-compose.yml    # Docker Compose configuration
├── start.sh            # One-command startup script
└── README.md
```

## Technology Stack

### Backend
- **Runtime**: Node.js 20.x
- **Framework**: NestJS 10.x
- **ORM**: TypeORM 0.3.x
- **Database**: PostgreSQL 16

### Frontend
- **Runtime**: Node.js 20.x
- **Library**: React 18.x
- **Build Tool**: Vite 5.x
- **Styling**: Tailwind CSS 3.4.x
- **Language**: TypeScript 5.x (strict mode)

## Features

- **CRUD Operations**: Create, read, update, delete notes
- **Categories**: Organize notes by category (Product, Design, Engineering, Marketing)
- **Archive**: Archive notes for later reference
- **Trash**: Soft-delete with 30-day auto-expiry
- **Search**: Real-time search across titles and content
- **Type Safety**: Full TypeScript strict mode on both layers

## API Endpoints

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | List all active notes |
| GET | `/notes?archived=true` | List archived notes |
| GET | `/notes?deleted=true` | List deleted notes (trash) |
| GET | `/notes?search=<query>` | Search notes |
| GET | `/notes?categoryId=<id>` | Filter by category |
| GET | `/notes/:id` | Get single note |
| POST | `/notes` | Create note |
| PUT | `/notes/:id` | Update note |
| PATCH | `/notes/:id/archive` | Toggle archive status |
| DELETE | `/notes/:id` | Move to trash |
| DELETE | `/notes/trash` | Empty trash |
| PATCH | `/notes/:id/restore` | Restore from trash |
| DELETE | `/notes/:id/permanent` | Hard delete |

### Categories

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | List all categories |
| POST | `/categories` | Create category |

## Environment Configuration

### Backend (.env)

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

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000
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

## TypeScript Validation

To ensure code quality before submission:

```bash
# Backend
cd backend && npm run build

# Frontend
cd frontend && npm run build
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

## License

MIT