# Docker Guide — Folio

## How it works

```
docker-compose.yml defines 3 services:

postgres  ←─── healthcheck (pg_isready)
               ↓ only starts when healthy
backend   ←─── depends_on postgres (condition: service_healthy)
               ↓ starts after backend
frontend  ←─── depends_on backend
```

The healthcheck prevents the backend from crashing on startup because it tried to connect to Postgres before it was ready — a common race condition that breaks naive Docker setups.

## Common commands

```bash
# Start everything (first run builds images)
bash start.sh

# Start in background (detached)
docker compose up --build -d

# View logs
docker compose logs -f            # all services
docker compose logs -f backend    # backend only
docker compose logs -f postgres   # DB only

# Stop everything
docker compose down

# Stop AND delete volumes (wipes the database)
docker compose down -v

# Rebuild a single service after code changes
docker compose up --build backend

# Open a psql shell to the DB
docker compose exec postgres psql -U folio_user -d folio_db

# Run backend tests inside container
docker compose exec backend npm run test
```

## Environment variables

All env vars are defined in `docker-compose.yml` under `environment:`.
For production or sensitive values, use a `.env` file (excluded from git via `.gitignore`).

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

The `docker-compose.yml` reads values like `${DB_PASS:-folio_pass}` — the `:-` syntax sets a fallback if the variable is not defined. This means the app works out-of-the-box without a `.env` file.

## Volumes

`postgres_data` is a named Docker volume — it persists the database across `docker compose down` restarts.
Running `docker compose down -v` deletes the volume, wiping all data. Only do this when you want a clean slate.

## Troubleshooting

**Port already in use:**
```bash
# Find what's using port 5432
lsof -i :5432
# Kill it, or change the port in docker-compose.yml
```

**Backend crashes on start (DB not ready):**
The healthcheck should prevent this. If it still happens, increase `start_period` in the postgres healthcheck from 10s to 20s.

**"Cannot connect to Docker daemon":**
Docker Desktop is not running. Start it from Applications.

**Frontend shows blank page:**
Check browser console for CORS errors. Verify `FRONTEND_URL=http://localhost:5173` is set in the backend environment and `app.enableCors()` is called in `main.ts`.

