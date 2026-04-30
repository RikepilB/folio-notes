# Folio Phase 1 — Notes CRUD + Archive + Trash + Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire all Phase 1 user stories (US-01–US-06, US-13, US-14) — CRUD, archive, trash/restore, debounced search with highlight, Empty Trash, and full test coverage (unit + E2E).

**Architecture:** Three-tier NestJS backend (Controller → Service → Repository) over PostgreSQL with TypeORM soft-delete. React 18 frontend with a single `useNotes` hook and view-mode routing through `App.tsx`. Search is client-side debounced at 300 ms with server-side ILIKE filtering.

**Tech Stack:** NestJS 10 · TypeORM 0.3 · PostgreSQL 16 · React 18 · Vite 5 · Tailwind 3.4 · TypeScript strict · Vitest 1 · React Testing Library · Playwright

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `backend/src/notes/notes.repository.ts` | Add `emptyTrash()`, 30-day filter |
| Modify | `backend/src/notes/notes.service.ts` | Add `emptyTrash()` delegation |
| Modify | `backend/src/notes/notes.controller.ts` | Add `DELETE /notes/trash` before `DELETE /notes/:id` |
| Modify | `backend/src/notes/notes.service.spec.ts` | Expand to 11 unit tests including `emptyTrash` |
| Create | `frontend/vitest.config.ts` | Vitest config with jsdom environment |
| Modify | `frontend/tsconfig.json` | Add `"types": ["vitest/globals"]` |
| Modify | `frontend/package.json` | Add vitest, RTL, jsdom, playwright deps + scripts |
| Create | `frontend/src/hooks/useDebounce.ts` | 300 ms debounce hook |
| Create | `frontend/src/hooks/useDebounce.test.ts` | 3 unit tests for useDebounce |
| Modify | `frontend/src/hooks/useNotes.ts` | Fix restoreNote/toggleArchive (filter not map) |
| Modify | `frontend/src/api/notesApi.ts` | Add `emptyTrash()` |
| Create | `frontend/src/utils/highlight.tsx` | highlight() — returns JSX with `<mark>` spans |
| Modify | `frontend/src/components/NoteCard.tsx` | Add view/searchQuery/onRestore/onPermanentDelete props, inline highlight |
| Modify | `frontend/src/components/NoteList.tsx` | Add view/searchQuery/onRestore/onPermanentDelete/onEmptyTrash props, "Empty Trash" button |
| Modify | `frontend/src/App.tsx` | Full wiring: debounce, correct archived filter, trash handlers, empty trash, titled confirm dialogs |
| Create | `frontend/src/components/NoteCard.test.tsx` | 7 unit tests for NoteCard view-mode variants |
| Create | `e2e/notes.spec.ts` | Playwright E2E — CRUD, archive, trash, restore, search |
| Create | `playwright.config.ts` | Playwright config pointing at localhost:5173 |

---

### Task 1: Backend — `DELETE /notes/trash` endpoint (TDD)

**Files:**
- Modify: `backend/src/notes/notes.repository.ts`
- Modify: `backend/src/notes/notes.service.ts`
- Modify: `backend/src/notes/notes.controller.ts`
- Modify: `backend/src/notes/notes.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Add to `backend/src/notes/notes.service.spec.ts` (inside the existing `describe('NotesService')` block, after all existing tests):

```typescript
describe('emptyTrash', () => {
  it('should call repository emptyTrash', async () => {
    mockRepository.emptyTrash = jest.fn().mockResolvedValue(undefined);
    await service.emptyTrash();
    expect(mockRepository.emptyTrash).toHaveBeenCalledTimes(1);
  });
});
```

Also add `emptyTrash: jest.fn()` to the `mockRepository` object at the top of the file.

- [ ] **Step 2: Run test to confirm it fails**

```bash
cd backend && npx jest notes.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: FAIL — `TypeError: service.emptyTrash is not a function`

- [ ] **Step 3: Add `emptyTrash` to the repository**

In `backend/src/notes/notes.repository.ts`, add after the last existing method:

```typescript
async emptyTrash(): Promise<void> {
  await this.repo.delete({ deleted: true });
}
```

- [ ] **Step 4: Add `emptyTrash` to the service**

In `backend/src/notes/notes.service.ts`, add after the last existing method:

```typescript
async emptyTrash(): Promise<void> {
  await this.notesRepository.emptyTrash();
}
```

- [ ] **Step 5: Add `DELETE /notes/trash` to the controller**

In `backend/src/notes/notes.controller.ts`, add this block **IMMEDIATELY BEFORE** the `@Delete(':id')` handler (route ordering is critical — NestJS matches routes top-down and `:id` would capture the literal string "trash" if declared first):

```typescript
@Delete('trash')
@HttpCode(HttpStatus.NO_CONTENT)
async emptyTrash(): Promise<void> {
  await this.notesService.emptyTrash();
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
cd backend && npx jest notes.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: PASS — all tests green

- [ ] **Step 7: Commit**

```bash
git add backend/src/notes/notes.repository.ts backend/src/notes/notes.service.ts backend/src/notes/notes.controller.ts backend/src/notes/notes.service.spec.ts
git commit -m "feat(backend): add DELETE /notes/trash endpoint with emptyTrash service + repo method"
```

---

### Task 2: Backend — 30-day trash filter + expanded unit tests

**Files:**
- Modify: `backend/src/notes/notes.repository.ts`
- Modify: `backend/src/notes/notes.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Add to the existing `describe('findAll')` block (or create it) in `backend/src/notes/notes.service.spec.ts`:

```typescript
describe('findAll', () => {
  it('should return all non-deleted, non-archived notes by default', async () => {
    const notes = [{ id: '1', title: 'Test', deleted: false, archived: false }];
    mockRepository.findAll = jest.fn().mockResolvedValue(notes);
    const result = await service.findAll({});
    expect(mockRepository.findAll).toHaveBeenCalledWith({});
    expect(result).toEqual(notes);
  });

  it('should pass deleted=true filter to repository (trash view)', async () => {
    mockRepository.findAll = jest.fn().mockResolvedValue([]);
    await service.findAll({ deleted: true });
    expect(mockRepository.findAll).toHaveBeenCalledWith({ deleted: true });
  });

  it('should pass search query to repository', async () => {
    mockRepository.findAll = jest.fn().mockResolvedValue([]);
    await service.findAll({ search: 'hello' });
    expect(mockRepository.findAll).toHaveBeenCalledWith({ search: 'hello' });
  });
});
```

Also add `findAll: jest.fn()` to `mockRepository` if not already there.

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && npx jest notes.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: some of the new tests fail if `findAll` delegation is missing

- [ ] **Step 3: Add 30-day filter to `notes.repository.ts`**

In `backend/src/notes/notes.repository.ts`, inside `findAll`, add the 30-day cutoff block right after the `deleted` filter branch:

```typescript
if (filters.deleted === true) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  qb.andWhere('note.deletedAt >= :cutoff', { cutoff });
}
```

(Place this block immediately after the existing `if (filters.deleted !== undefined)` block.)

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd backend && npx jest notes.service.spec.ts --no-coverage 2>&1 | tail -20
```

Expected: all tests pass

- [ ] **Step 5: Commit**

```bash
git add backend/src/notes/notes.repository.ts backend/src/notes/notes.service.spec.ts
git commit -m "feat(backend): add 30-day trash filter and expand findAll unit tests"
```

---

### Task 3: Frontend — Set up Vitest + React Testing Library

**Files:**
- Modify: `frontend/package.json`
- Create: `frontend/vitest.config.ts`
- Modify: `frontend/tsconfig.json`

- [ ] **Step 1: Install dependencies**

```bash
cd frontend && npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 2: Add scripts to `frontend/package.json`**

In the `"scripts"` section of `frontend/package.json`, add:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage",
"test:e2e": "playwright test"
```

- [ ] **Step 3: Create `frontend/vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
```

- [ ] **Step 4: Create `frontend/src/test-setup.ts`**

```typescript
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Add vitest types to `frontend/tsconfig.json`**

In `frontend/tsconfig.json`, add `"vitest/globals"` to the `compilerOptions.types` array. If `types` doesn't exist yet, add:

```json
"types": ["vitest/globals"]
```

- [ ] **Step 6: Verify setup works**

```bash
cd frontend && npx vitest run --reporter=verbose 2>&1 | tail -10
```

Expected: "No test files found" (not an error — infrastructure is ready)

- [ ] **Step 7: Commit**

```bash
git add frontend/package.json frontend/vitest.config.ts frontend/tsconfig.json frontend/src/test-setup.ts
git commit -m "chore(frontend): add Vitest + React Testing Library + Playwright test infrastructure"
```

---

### Task 4: Frontend — `useDebounce` hook with unit tests

**Files:**
- Create: `frontend/src/hooks/useDebounce.ts`
- Create: `frontend/src/hooks/useDebounce.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `frontend/src/hooks/useDebounce.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from './useDebounce';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('useDebounce', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('does not update before the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    );
    rerender({ value: 'world' });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('hello');
  });

  it('updates after the delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } }
    );
    rerender({ value: 'world' });
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe('world');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd frontend && npx vitest run hooks/useDebounce.test.ts --reporter=verbose 2>&1 | tail -15
```

Expected: FAIL — `Cannot find module './useDebounce'`

- [ ] **Step 3: Implement `useDebounce`**

Create `frontend/src/hooks/useDebounce.ts`:

```typescript
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd frontend && npx vitest run hooks/useDebounce.test.ts --reporter=verbose 2>&1 | tail -15
```

Expected: PASS — 3 tests green

- [ ] **Step 5: Commit**

```bash
git add frontend/src/hooks/useDebounce.ts frontend/src/hooks/useDebounce.test.ts
git commit -m "feat(frontend): add useDebounce hook with 3 unit tests"
```

---

### Task 5: Frontend — Fix `useNotes.ts` stale-state bug

**Files:**
- Modify: `frontend/src/hooks/useNotes.ts`

The `restoreNote` and `toggleArchive` callbacks currently use `.map()` which leaves the note in the current view after the action. They must use `.filter()` so the note disappears immediately from the active view.

- [ ] **Step 1: Fix `restoreNote`**

In `frontend/src/hooks/useNotes.ts`, replace the body of `restoreNote`:

```typescript
// Before:
setNotes(prev => prev.map(n => (n.id === id ? restored : n)));

// After:
setNotes(prev => prev.filter(n => n.id !== id));
```

- [ ] **Step 2: Fix `toggleArchive`**

In `frontend/src/hooks/useNotes.ts`, replace the body of `toggleArchive`'s `setNotes` call:

```typescript
// Before:
setNotes(prev => prev.map(n => (n.id === id ? updated : n)));

// After:
setNotes(prev => prev.filter(n => n.id !== id));
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/hooks/useNotes.ts
git commit -m "fix(frontend): use filter (not map) in restoreNote/toggleArchive so notes leave view immediately"
```

---

### Task 6: Frontend — Add `emptyTrash` to `notesApi.ts`

**Files:**
- Modify: `frontend/src/api/notesApi.ts`

- [ ] **Step 1: Add `emptyTrash` method**

In `frontend/src/api/notesApi.ts`, add inside the exported object (after `permanentDelete` or at the end):

```typescript
emptyTrash(): Promise<void> {
  return api.delete('/notes/trash').then(() => undefined);
},
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/api/notesApi.ts
git commit -m "feat(frontend): add emptyTrash() to notesApi"
```

---

### Task 7: Frontend — `highlight` utility + update `NoteCard` + `NoteList`

**Files:**
- Create: `frontend/src/utils/highlight.tsx`
- Modify: `frontend/src/components/NoteCard.tsx`
- Modify: `frontend/src/components/NoteList.tsx`
- Create: `frontend/src/components/NoteCard.test.tsx`

- [ ] **Step 1: Write failing NoteCard tests**

Create `frontend/src/components/NoteCard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from './NoteCard';
import type { Note } from '../types/note';

const baseNote: Note = {
  id: '1',
  title: 'Hello World',
  content: 'Some content',
  archived: false,
  deleted: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('NoteCard — notes view', () => {
  it('renders title and content', () => {
    render(<NoteCard note={baseNote} view="notes" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows Archive and Delete buttons', () => {
    render(<NoteCard note={baseNote} view="notes" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} />);
    expect(screen.getByText('Archive')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('does not show Restore or Delete Permanently in notes view', () => {
    render(<NoteCard note={baseNote} view="notes" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} />);
    expect(screen.queryByText('Restore')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete Permanently')).not.toBeInTheDocument();
  });
});

describe('NoteCard — trash view', () => {
  const trashedNote = { ...baseNote, deleted: true };

  it('shows Restore and Delete Permanently buttons', () => {
    render(<NoteCard note={trashedNote} view="trash" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} onRestore={vi.fn()} onPermanentDelete={vi.fn()} />);
    expect(screen.getByText('Restore')).toBeInTheDocument();
    expect(screen.getByText('Delete Permanently')).toBeInTheDocument();
  });

  it('calls onRestore when Restore is clicked', () => {
    const onRestore = vi.fn();
    render(<NoteCard note={trashedNote} view="trash" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} onRestore={onRestore} onPermanentDelete={vi.fn()} />);
    fireEvent.click(screen.getByText('Restore'));
    expect(onRestore).toHaveBeenCalledWith('1');
  });

  it('calls onPermanentDelete when Delete Permanently is clicked', () => {
    const onPermanentDelete = vi.fn();
    render(<NoteCard note={trashedNote} view="trash" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} onRestore={vi.fn()} onPermanentDelete={onPermanentDelete} />);
    fireEvent.click(screen.getByText('Delete Permanently'));
    expect(onPermanentDelete).toHaveBeenCalledWith('1');
  });
});

describe('NoteCard — search highlight', () => {
  it('highlights matching text in title', () => {
    render(<NoteCard note={baseNote} view="notes" searchQuery="World" onEdit={vi.fn()} onDelete={vi.fn()} onToggleArchive={vi.fn()} />);
    const mark = document.querySelector('mark');
    expect(mark).toBeInTheDocument();
    expect(mark?.textContent).toBe('World');
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd frontend && npx vitest run components/NoteCard.test.tsx --reporter=verbose 2>&1 | tail -20
```

Expected: FAIL — import errors / missing props

- [ ] **Step 3: Create `highlight.tsx`**

Create `frontend/src/utils/highlight.tsx`:

```typescript
import React from 'react';

export function highlight(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} className="bg-yellow-200 rounded-sm">{part}</mark> : part
  );
}
```

- [ ] **Step 4: Update `NoteCard.tsx`**

Replace the full contents of `frontend/src/components/NoteCard.tsx` with:

```typescript
import React from 'react';
import type { Note } from '../types/note';
import type { ViewMode } from './Sidebar';
import { highlight } from '../utils/highlight';

interface NoteCardProps {
  note: Note;
  view: ViewMode;
  searchQuery?: string;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleArchive: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export function NoteCard({
  note,
  view,
  searchQuery = '',
  onEdit,
  onDelete,
  onToggleArchive,
  onRestore,
  onPermanentDelete,
}: NoteCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col gap-2">
      <h3 className="font-semibold text-lg">{highlight(note.title, searchQuery)}</h3>
      <p className="text-gray-600 text-sm line-clamp-3">{highlight(note.content ?? '', searchQuery)}</p>

      <div className="flex gap-2 mt-2">
        {view === 'trash' ? (
          <>
            <button
              className="text-sm px-3 py-1 rounded bg-green-100 hover:bg-green-200 text-green-800"
              onClick={() => onRestore?.(note.id)}
            >
              Restore
            </button>
            <button
              className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800"
              onClick={() => onPermanentDelete?.(note.id)}
            >
              Delete Permanently
            </button>
          </>
        ) : (
          <>
            <button
              className="text-sm px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
              onClick={() => onEdit(note)}
            >
              Edit
            </button>
            <button
              className="text-sm px-3 py-1 rounded bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
              onClick={() => onToggleArchive(note.id)}
            >
              {note.archived ? 'Unarchive' : 'Archive'}
            </button>
            <button
              className="text-sm px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-800"
              onClick={() => onDelete(note)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Update `NoteList.tsx`**

Replace the full contents of `frontend/src/components/NoteList.tsx` with:

```typescript
import React from 'react';
import type { Note } from '../types/note';
import type { ViewMode } from './Sidebar';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  view: ViewMode;
  searchQuery?: string;
  loading: boolean;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleArchive: (id: string) => void;
  onRestore?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
  onEmptyTrash?: () => void;
}

export function NoteList({
  notes,
  view,
  searchQuery = '',
  loading,
  onEdit,
  onDelete,
  onToggleArchive,
  onRestore,
  onPermanentDelete,
  onEmptyTrash,
}: NoteListProps) {
  if (loading) return <p className="text-gray-500 p-4">Loading…</p>;

  return (
    <div className="flex flex-col gap-4 p-4">
      {view === 'trash' && notes.length > 0 && (
        <div className="flex justify-end">
          <button
            className="text-sm px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            onClick={onEmptyTrash}
          >
            Empty Trash
          </button>
        </div>
      )}
      {notes.length === 0 ? (
        <p className="text-gray-400 text-center mt-8">No notes here.</p>
      ) : (
        notes.map(note => (
          <NoteCard
            key={note.id}
            note={note}
            view={view}
            searchQuery={searchQuery}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleArchive={onToggleArchive}
            onRestore={onRestore}
            onPermanentDelete={onPermanentDelete}
          />
        ))
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run tests to confirm they pass**

```bash
cd frontend && npx vitest run components/NoteCard.test.tsx --reporter=verbose 2>&1 | tail -20
```

Expected: PASS — 7 tests green

- [ ] **Step 7: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors

- [ ] **Step 8: Commit**

```bash
git add frontend/src/utils/highlight.tsx frontend/src/components/NoteCard.tsx frontend/src/components/NoteList.tsx frontend/src/components/NoteCard.test.tsx
git commit -m "feat(frontend): add highlight util, update NoteCard/NoteList for trash view + search highlight"
```

---

### Task 8: Frontend — Full `App.tsx` wiring

**Files:**
- Modify: `frontend/src/App.tsx`

This task wires all Phase 1 features together: debounce, correct `archived` filter, trash handlers, empty trash, titled confirm dialogs.

- [ ] **Step 1: Replace `App.tsx`**

Replace the full contents of `frontend/src/App.tsx` with:

```typescript
import React, { useState, useCallback } from 'react';
import { Sidebar, type ViewMode } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { DeleteConfirm } from './components/DeleteConfirm';
import { useNotes } from './hooks/useNotes';
import { useDebounce } from './hooks/useDebounce';
import type { Note } from './types/note';

export default function App() {
  const [view, setView] = useState<ViewMode>('notes');
  const [searchInput, setSearchInput] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [confirmNote, setConfirmNote] = useState<Note | null>(null);

  const debouncedSearch = useDebounce(searchInput, 300);

  const archivedFilter =
    view === 'archived' ? true : view === 'notes' ? false : undefined;

  const { notes, loading, createNote, updateNote, deleteNote, toggleArchive, restoreNote, permanentDelete, emptyTrash } =
    useNotes({
      archived: archivedFilter,
      deleted: view === 'trash' ? true : false,
      search: debouncedSearch || undefined,
    });

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note);
    setIsEditorOpen(true);
  }, []);

  const handleNew = useCallback(() => {
    setEditingNote(null);
    setIsEditorOpen(true);
  }, []);

  const handleSave = useCallback(
    async (data: { title: string; content: string }) => {
      if (editingNote) {
        await updateNote(editingNote.id, data);
      } else {
        await createNote(data);
      }
      setIsEditorOpen(false);
    },
    [editingNote, createNote, updateNote]
  );

  const handleDeleteRequest = useCallback((note: Note) => {
    setConfirmNote(note);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!confirmNote) return;
    await deleteNote(confirmNote.id);
    setConfirmNote(null);
  }, [confirmNote, deleteNote]);

  const handleRestore = useCallback(
    async (id: string) => {
      await restoreNote(id);
    },
    [restoreNote]
  );

  const handlePermanentDelete = useCallback(
    async (id: string) => {
      const note = notes.find(n => n.id === id);
      if (!note) return;
      setConfirmNote({ ...note, _permanentDelete: true } as Note & { _permanentDelete: boolean });
    },
    [notes]
  );

  const handleConfirmAction = useCallback(async () => {
    if (!confirmNote) return;
    const isPermanent = (confirmNote as Note & { _permanentDelete?: boolean })._permanentDelete;
    if (isPermanent) {
      await permanentDelete(confirmNote.id);
    } else {
      await deleteNote(confirmNote.id);
    }
    setConfirmNote(null);
  }, [confirmNote, deleteNote, permanentDelete]);

  const handleEmptyTrash = useCallback(async () => {
    await emptyTrash();
  }, [emptyTrash]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar view={view} onViewChange={setView} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="p-4 border-b flex items-center gap-4">
          <input
            type="text"
            placeholder="Search notes…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {view === 'notes' && (
            <button
              onClick={handleNew}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              + New Note
            </button>
          )}
        </header>

        <NoteList
          notes={notes}
          view={view}
          searchQuery={debouncedSearch}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          onToggleArchive={toggleArchive}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onEmptyTrash={handleEmptyTrash}
        />
      </main>

      {isEditorOpen && (
        <NoteEditor
          note={editingNote}
          onSave={handleSave}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {confirmNote && (
        <DeleteConfirm
          message={`Delete "${confirmNote.title}"? This action cannot be undone.`}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmNote(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add `emptyTrash` to `useNotes.ts`**

In `frontend/src/hooks/useNotes.ts`, add an `emptyTrash` callback that calls `notesApi.emptyTrash()` and then clears the local `notes` state:

```typescript
const emptyTrash = useCallback(async (): Promise<void> => {
  await notesApi.emptyTrash();
  setNotes([]);
}, []);
```

Make sure `emptyTrash` is included in the return object of `useNotes`.

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd frontend && npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/App.tsx frontend/src/hooks/useNotes.ts
git commit -m "feat(frontend): wire all Phase 1 features in App.tsx — debounce, trash view, empty trash, titled confirm"
```

---

### Task 9: Playwright E2E tests

**Files:**
- Create: `playwright.config.ts` (repo root)
- Create: `e2e/notes.spec.ts`

Prerequisites: backend running on port 3000, frontend on port 5173, database seeded/empty.

- [ ] **Step 1: Create `playwright.config.ts`**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'cd backend && npm run start:dev',
      port: 3000,
      reuseExistingServer: true,
    },
    {
      command: 'cd frontend && npm run dev',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
```

- [ ] **Step 2: Write E2E tests**

Create `e2e/notes.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Notes CRUD (US-01–US-03)', () => {
  test('creates a note and shows it in the list', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("+ New Note")');
    await page.fill('[placeholder="Title"]', 'My First Note');
    await page.fill('[placeholder="Content"]', 'Hello Playwright');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=My First Note')).toBeVisible();
  });

  test('edits a note and shows updated title', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Edit")');
    await page.fill('[placeholder="Title"]', 'Updated Title');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Updated Title')).toBeVisible();
  });

  test('deletes a note with confirm dialog', async ({ page }) => {
    await page.goto('/');
    const title = await page.locator('h3').first().textContent();
    await page.click('button:has-text("Delete")');
    await expect(page.locator(`text=Delete "${title}"`)).toBeVisible();
    await page.click('button:has-text("Confirm")');
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
  });
});

test.describe('Archive (US-04–US-05)', () => {
  test('archives a note — disappears from Notes, appears in Archived', async ({ page }) => {
    await page.goto('/');
    const title = await page.locator('h3').first().textContent();
    await page.click('button:has-text("Archive")');
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
    await page.click('text=Archived');
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test('unarchives a note — disappears from Archived, appears in Notes', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Archived');
    const title = await page.locator('h3').first().textContent();
    await page.click('button:has-text("Unarchive")');
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
    await page.click('text=Notes');
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });
});

test.describe('Trash / Restore (US-06, US-13, US-14)', () => {
  test('soft-deleted note appears in Trash', async ({ page }) => {
    await page.goto('/');
    const title = await page.locator('h3').first().textContent();
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
    await page.click('text=Trash');
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test('restores a note from Trash', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Trash');
    const title = await page.locator('h3').first().textContent();
    await page.click('button:has-text("Restore")');
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
    await page.click('text=Notes');
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });

  test('permanently deletes a note', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Trash');
    const title = await page.locator('h3').first().textContent();
    await page.click('button:has-text("Delete Permanently")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
    await page.click('text=Notes');
    await expect(page.locator(`text=${title}`)).not.toBeVisible();
  });

  test('Empty Trash removes all trashed notes', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Trash');
    await page.click('button:has-text("Empty Trash")');
    await expect(page.locator('text=No notes here.')).toBeVisible();
  });
});

test.describe('Search with debounce (US-14)', () => {
  test('filters notes by search query', async ({ page }) => {
    await page.goto('/');
    await page.fill('[placeholder="Search notes…"]', 'My First');
    await page.waitForTimeout(400);
    const cards = page.locator('h3');
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      const text = await cards.nth(i).textContent();
      expect(text?.toLowerCase()).toContain('my first');
    }
  });

  test('highlights matching text in yellow', async ({ page }) => {
    await page.goto('/');
    await page.fill('[placeholder="Search notes…"]', 'Note');
    await page.waitForTimeout(400);
    await expect(page.locator('mark').first()).toBeVisible();
  });
});
```

- [ ] **Step 3: Commit**

```bash
git add playwright.config.ts e2e/notes.spec.ts
git commit -m "test(e2e): add Playwright E2E tests for CRUD, archive, trash, restore, search"
```

---

### Task 10: Full test suite verification

**Files:** none (verification only)

- [ ] **Step 1: Run backend unit tests**

```bash
cd backend && npx jest --coverage 2>&1 | tail -30
```

Expected: all tests pass, coverage ≥ 80% for notes module

- [ ] **Step 2: Run frontend unit tests**

```bash
cd frontend && npx vitest run --coverage 2>&1 | tail -30
```

Expected: all tests pass (useDebounce × 3, NoteCard × 7)

- [ ] **Step 3: Run E2E tests (both servers must be running)**

In two separate terminals:
```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

Then:
```bash
npx playwright test --reporter=list 2>&1 | tail -40
```

Expected: all E2E tests pass

- [ ] **Step 4: Final TypeScript check**

```bash
cd backend && npx tsc --noEmit && cd ../frontend && npx tsc --noEmit
```

Expected: no errors on either side

- [ ] **Step 5: Final commit**

```bash
git add docs/progress.txt
git commit -m "docs: update progress — Phase 1 complete"
```

---

## Phase 1 Completion Criteria

- [ ] `DELETE /notes/trash` returns 204, permanently deletes all `deleted=true` rows
- [ ] Trash view shows only notes deleted in the last 30 days
- [ ] `restoreNote` and `toggleArchive` immediately remove the note from the current view
- [ ] Search debounce fires 300 ms after the user stops typing
- [ ] Matching text is highlighted with `<mark>` tags in both title and content
- [ ] Delete confirm dialog includes the note title in the message
- [ ] "Empty Trash" button appears only when the trash is non-empty
- [ ] All backend unit tests pass with ≥ 80% coverage
- [ ] All frontend unit tests pass (10 total)
- [ ] All Playwright E2E tests pass
