# Updated PRD — Folio Notes App
**Version:** 2.0  
**Date:** 2026-04-29  
**Changes from v1:** Added search (US-13), Recently Deleted (US-14), Bookmarks (US-10), Public Browse (US-11), Clerk auth (US-12). Renamed app to Folio.

---

## Revised User Stories → Acceptance Criteria Map

### Phase 1 (Mandatory)
- US-01 Create note → form submits, 201, appears in active list
- US-02 Edit note → form pre-fills, 200, list updates
- US-03 Delete note → confirmation dialog names note, 204, moves to Recently Deleted
- US-04 Archive note → moves to archived view, PATCH /archive
- US-05 View active notes → only archived=false, ordered by updatedAt DESC
- US-06 View archived notes → only archived=true, Unarchive available
- US-13 Search by title or content → debounced 300ms, match highlighting, searches both fields
- US-14 Recently Deleted → 30-day soft-delete, Restore, Empty Trash, auto-expiry

### Phase 2 (Extra credit)
- US-07 Add category to note
- US-08 Remove category from note
- US-09 Filter by category
- US-10 Bookmark public note
- US-11 Browse without auth
- US-12 Clerk sign-in/sign-up

---

## Revised DB Schema

### note
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| title | varchar(255) | required |
| content | text | required |
| archived | boolean | default false |
| deleted | boolean | default false — soft delete flag |
| deletedAt | timestamp | null = not deleted; set on soft-delete |
| isPublic | boolean | default false — Phase 2 browse feature |
| userId | varchar | null = anonymous (Phase 2 when Clerk added) |
| createdAt | timestamp | auto |
| updatedAt | timestamp | auto |

### category
| Field | Type | Notes |
|-------|------|-------|
| id | uuid PK | |
| name | varchar(100) | unique |

### note_categories (join table)
| Field | Type |
|-------|------|
| note_id | uuid FK |
| category_id | uuid FK |

### bookmark (Phase 2)
| Field | Type |
|-------|------|
| id | uuid PK |
| userId | varchar |
| noteId | uuid FK |
| createdAt | timestamp |

---

## Revised API Contract

### Notes
| Method | Path | Description | Status |
|--------|------|-------------|--------|
| GET | /notes?archived=false&deleted=false | Active notes | 200 |
| GET | /notes?archived=true&deleted=false | Archived notes | 200 |
| GET | /notes?deleted=true | Recently deleted (within 30 days) | 200 |
| GET | /notes?search=:query | Search title + content | 200 |
| POST | /notes | Create | 201 |
| PUT | /notes/:id | Edit | 200 |
| PATCH | /notes/:id/archive | Toggle archive | 200 |
| DELETE | /notes/:id | Soft-delete (sets deleted=true, deletedAt=now) | 204 |
| PATCH | /notes/:id/restore | Restore from deleted | 200 |
| DELETE | /notes/:id/permanent | Hard delete (only from deleted state) | 204 |

### Categories
| Method | Path | Description |
|--------|------|-------------|
| GET | /categories | List all |
| POST | /categories | Create |
| POST | /notes/:id/categories/:catId | Add to note |
| DELETE | /notes/:id/categories/:catId | Remove from note |

### Search (inline via notes endpoint)
`GET /notes?search=typescript&archived=false` — backend does ILIKE '%typescript%' on both title and content fields.

