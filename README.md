# Folio — Notes App

A type-safe notes application with categories, archive, and trash functionality.

## Tech Stack

| Layer | Technology | Version |
|-------|-------------|---------|
| Backend | NestJS | 10.x |
| Backend ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16 |
| Frontend | React | 18.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Language | TypeScript | 5.x (strict) |

## Requirements

| Tool | Version |
|------|---------|
| Node.js | 20.x |
| npm | 10.x |
| Docker | 24.x |
| Docker Compose | 2.x |

## Quick Start

```bash
# Clone and enter the repository
git clone <repo-url> && cd <repo-name>

# Run the application
./setup.sh
```

This single command will:
1. Start PostgreSQL, Backend, and Frontend containers
2. Create the database schema automatically
3. Seed the database with 12 sample notes and 4 categories

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## Manual Setup

If you prefer running without Docker:

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

## Project Structure

```
backend/           # NestJS backend
  src/
    notes/       # Notes module (controller/service/repository)
    categories/ # Categories module
    seed/        # Database seeder
  seed.sql      # Raw seed data
  Dockerfile    # Docker build file

frontend/         # React + Vite frontend
  src/
    api/         # Axios API client
    components/  # React components
    hooks/       # Custom hooks (useNotes)
    types/       # TypeScript interfaces
  Dockerfile    # Docker build file

docker-compose.yml  # Docker Compose configuration
setup.sh           # One-command setup script
README.md         # This file
```

## Features

- **CRUD**: Create, read, update, delete notes
- **Categories**: Organize notes by category (Product, Design, Engineering, Marketing)
- **Archive**: Archive notes for later reference
- **Trash**: Soft-delete with 30-day auto-expiry
- **Search**: Real-time search across note titles and content

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/notes` | List all notes |
| GET | `/notes?archived=true` | List archived notes |
| GET | `/notes?deleted=true` | List deleted notes |
| GET | `/notes?search=<query>` | Search notes |
| GET | `/notes?categoryId=<id>` | Filter by category |
| GET | `/notes/:id` | Get single note |
| POST | `/notes` | Create note |
| PUT | `/notes/:id` | Update note |
| PATCH | `/notes/:id/archive` | Toggle archive |
| DELETE | `/notes/:id` | Soft delete (move to trash) |
| DELETE | `/notes/trash` | Empty trash |
| PATCH | `/notes/:id/restore` | Restore from trash |
| DELETE | `/notes/:id/permanent` | Hard delete |
| GET | `/categories` | List categories |
| POST | `/categories` | Create category |

## Environment Variables

### Backend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | Environment |
| PORT | 3000 | Server port |
| DB_HOST | localhost | Database host |
| DB_PORT | 5432 | Database port |
| DB_NAME | folio | Database name |
| DB_USER | folio | Database user |
| DB_PASS | folio | Database password |
| FRONTEND_URL | http://localhost:5173 | CORS allowed origin |

### Frontend (.env)

| Variable | Default | Description |
|----------|---------|-------------|
| VITE_API_URL | http://localhost:3000 | Backend API URL |

## Troubleshooting

### Port already in use

```bash
# Stop existing containers
docker compose down

# Or change ports in .env
```

### Database connection failed

```bash
# Check PostgreSQL is running
docker compose ps

# View logs
docker compose logs postgres
```

### Frontend shows "Network Error"

```bash
# Ensure backend is running
docker compose logs backend
```

## License

MIT