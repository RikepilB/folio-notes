# Claude Context Prompt — Folio Notes App

---

## Project Overview

**Folio** is a full-stack notes application (NestJS + React + PostgreSQL) with:
- Phase 1: CRUD, categories, archive, trash, search
- Phase 2: Add/remove categories, filter by category, sort by date

**GitHub**: https://github.com/hirelens-challenges/Pillaca-52a4e1
**Branch**: `main`

---

## Deployment Status

### ✅ Completed

| Component | Service | URL/Status |
|-----------|---------|-------------|
| Backend API | Supabase Edge Functions | `https://ffitssrosgkrzgjozscc.supabase.co/functions/v1/notes-api` |
| Database | Supabase PostgreSQL | Project: `ffitssrosgkrzgjozscc` |
| Frontend | Vercel | **DEPLOYED BUT AUTH ENABLED** |

### ⚠️ Action Required

The Vercel frontend deployment has **password protection enabled**. To resolve:

1. Go to: https://vercel.com/rikepilbs-projects/frontend/settings
2. Find **Authentication** section
3. **Disable** password protection / Vercel Authentication

After disabling, the app will be live at:
- **Frontend**: https://frontend-j8iztte7l-rikepilbs-projects.vercel.app

---

## Credentials (DO NOT COMMIT)

### Supabase
- Project ID: `ffitssrosgkrzgjozscc`
- Project Name: `notes`
- Database Host: `db.ffitssrosgkrzgjozscc.supabase.co`
- Connection: `postgresql://postgres:B/mP$b69,?gB,.b@db.ffitssrosgkrzgjozscc.supabase.co:5432/postgres`

### Vercel
- Account: `rikepilbs-projects`
- Token: `vcp_4DuA001vSTIKUlcfe0FNXKJqb3YMTdwOVg7t4zcdfLyQEyZGDp3PpvSi`

---

## Your Task (for next Claude session)

1. **Verify Vercel auth is disabled** — Check if frontend is accessible
2. **Test the app** — Open the frontend URL and verify:
   - Notes CRUD works
   - Categories can be added/removed
   - Category filtering works
   - Sort toggle works
3. **Update README.md** — Add the live URLs section:
   ```
   ## Live Demo

   - Frontend: https://frontend-[xxx].vercel.app
   - Backend API: https://ffitssrosgkrzgjozscc.supabase.co/functions/v1/notes-api
   - Database: Supabase (ffitssrosgkrzgjozscc)
   ```
4. **Update progress.txt** — Document the final deployment status
5. **Commit and push** all changes

---

## Files Created/Modified for Deployment

- `supabase/config.toml` — Supabase CLI config
- `supabase/migrations/20260430_initial.sql` — Database schema
- `supabase/functions/notes-api/index.ts` — Edge Function (backend)
- `frontend/src/api/notesApi.ts` — Updated to use Supabase URL
- `Dockerfile` — Combined frontend+backend+nginx (for reference)
- `nginx.conf` — Nginx config (for reference)
- `DEPLOYMENT_REPORT.md` — Full deployment report
- `.azure/plan.md` — Azure plan (unused)

---

## Quick Commands

```bash
# Test backend
curl https://ffitssrosgkrzgjozscc.supabase.co/functions/v1/notes-api/categories

# Rebuild frontend (after any changes)
vercel --prod --yes --token=vcp_4DuA001vSTIKUlcfe0FNXKJqb3YMTdwOVg7t4zcdfLyQEyZGDp3PpvSi
```

---

**Status**: Awaiting Vercel authentication to be disabled