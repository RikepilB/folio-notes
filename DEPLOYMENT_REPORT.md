# Folio Deployment Report

## Project: Folio — Notes SPA

**Date**: 2026-04-30
**Status**: Phase 2 Complete, Deployment in Progress

---

## What Was Built

### Phase 1 — Core Features (Complete)
- CRUD operations for notes
- Category organization
- Archive functionality
- Soft-delete trash with 30-day expiry
- Real-time search (case-insensitive)
- Type-safe TypeScript (strict mode)

### Phase 2 — Extra Credit (Complete)
- Add/remove categories on notes
- Filter notes by category
- Sort notes by creation date (asc/desc)
- AGENTS.md for developer guidance

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Backend | NestJS | 10.x |
| ORM | TypeORM | 0.3.x |
| Database | PostgreSQL | 16.x |
| Frontend | React | 18.x |
| Build Tool | Vite | 5.x |
| Styling | Tailwind CSS | 3.4.x |
| Language | TypeScript | 5.x |
| Container | Docker | 29.x |

---

## Repository

**GitHub**: https://github.com/hirelens-challenges/Pillaca-52a4e1

**Branches**:
- `main` — Production branch with all features
- `feature/phase-1-notes` — Feature branch

**Recent Commits**:
- `979bfe5` — docs: enhance README with detailed usage, versions, and features
- `e5b09c8` — feat: implement Phase 2 - add/remove categories, filter by category, sort by date

---

## Deployment Strategy

### Current: Vercel + Supabase (In Progress)

| Component | Service | Status | URL |
|-----------|---------|--------|-----|
| Frontend | Vercel | Deployed | https://frontend-lyart-five-96.vercel.app |
| Backend | Supabase Edge Functions | To Do | TBD |
| Database | Supabase PostgreSQL | Ready | db.ffitssrosgkrzgjozscc.supabase.co |

### Previous Attempts
1. ❌ Azure — Cost estimate ~$45/month (not free)
2. ❌ Render + private repo — GitHub connection not available
3. ❌ Docker image — Requires container registry

---

## Supabase Configuration

**Project**: notes
**Project ID**: ffitssrosgkrzgjozscc
**Region**: (auto-detected)
**Plan**: Supabase Free Plan

### Database Connection
```
Host: db.ffitssrosgkrzgjozscc.supabase.co
Port: 5432
Database: postgres
User: postgres
Password: B/mP$b69,?gB,.b
```

### Environment Variables for Backend
```
DATABASE_URL=postgresql://postgres:B/mP$b69,?gB,.b@db.ffitssrosgkrzgjozscc.supabase.co:5432/postgres
```

---

## Vercel Configuration

**Account**: Richards Projects
**Token**: vcp_4g56fHdzn48l5zvfYb67CiAq... (original)
**New Token**: vcp_4DuA001vSTIKUlcfe0FNXKJqb3YMTdwOVg7t4zcdfLyQEyZGDp3PpvSi

### Frontend Deployment
- **Root Directory**: frontend
- **Build Command**: npm run build
- **Output Directory**: dist
- **Framework**: Vite

---

## Files Created/Modified

### Core Application
- `backend/` — NestJS API (controller/service/repository layers)
- `frontend/` — React SPA with Vite + Tailwind
- `docker-compose.yml` — Local development
- `start.sh` — One-command startup

### Documentation
- `README.md` — Complete usage guide with versions
- `docs/SYSTEM_ARCHITECTURE.md` — Architecture documentation
- `docs/DESIGN.md` — UI/UX design tokens
- `docs/ERD.md` — Entity relationship diagram

### Infrastructure
- `Dockerfile` — Multi-stage build (frontend + backend + nginx)
- `nginx.conf` — Reverse proxy configuration
- `.azure/plan.md` — Azure deployment plan (not used)

---

## API Endpoints

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notes | List notes (filter: archived, deleted, search, categoryId, sortBy, order) |
| GET | /notes/:id | Get single note |
| POST | /notes | Create note |
| PUT | /notes/:id | Update note |
| PATCH | /notes/:id/archive | Toggle archive |
| DELETE | /notes/:id | Soft delete |
| DELETE | /notes/trash | Empty trash |
| PATCH | /notes/:id/restore | Restore from trash |
| DELETE | /notes/:id/permanent | Hard delete |
| POST | /notes/:id/categories/:catId | Add category |
| DELETE | /notes/:id/categories/:catId | Remove category |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /categories | List categories |
| POST | /categories | Create category |
| DELETE | /categories/:id | Delete category |

---

## Next Steps

1. **Deploy Backend to Supabase Edge Functions**
   - Convert NestJS controllers to Edge Function handlers
   - Deploy to Supabase
   - Update frontend API URL

2. **Update README**
   - Add live URLs once deployment complete

3. **Verify All Features**
   - Test CRUD, categories, archive, trash
   - Test search and sorting

---

## Contact

**Owner**: Richards Projects
**GitHub**: https://github.com/hirelens-challenges/Pillaca-52a4e1
**Supabase**: https://supabase.com/dashboard/project/ffitssrosgkrzgjozscc