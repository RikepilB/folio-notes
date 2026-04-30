import React, { useState, useCallback } from 'react';
import { useNotes } from './hooks/useNotes';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { CategoryFilter } from './components/CategoryFilter';
import { NoteList } from './components/NoteList';
import { NoteForm } from './components/NoteForm';
import { DeleteConfirm } from './components/DeleteConfirm';
import { RecentlyDeleted } from './components/RecentlyDeleted';
import type { Note, Category, CreateNotePayload } from './types';

type ActiveTab = 'active' | 'archived' | 'deleted';
type SidebarRoute = 'notes' | 'archived' | 'deleted';

function toSidebarRoute(tab: ActiveTab): SidebarRoute {
  return tab === 'active' ? 'notes' : tab;
}

function toActiveTab(route: SidebarRoute): ActiveTab {
  return route === 'notes' ? 'active' : route;
}

function deriveCategories(notes: Note[]): Category[] {
  const seen = new Set<string>();
  const cats: Category[] = [];
  for (const note of notes) {
    for (const cat of note.categories) {
      if (!seen.has(cat.id)) {
        seen.add(cat.id);
        cats.push(cat);
      }
    }
  }
  return cats;
}

export default function App(): React.ReactElement {
  const [activeTab, setActiveTab] = useState<ActiveTab>('active');
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [confirmDeleteNote, setConfirmDeleteNote] = useState<Note | null>(null);

  const {
    notes,
    archivedNotes,
    deletedNotes,
    loading,
    error,
    activeCategory,
    sortBy,
    sortOrder,
    createNote,
    updateNote,
    archiveNote,
    deleteNote,
    restoreNote,
    hardDeleteNote,
    setSearch,
    setCategory,
    setSortBy,
    setSortOrder,
  } = useNotes();

  const handleNavigate = useCallback((route: SidebarRoute): void => {
    setActiveTab(toActiveTab(route));
  }, []);

  const handleNewNote = useCallback((): void => {
    setEditingNote(null);
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((note: Note): void => {
    setEditingNote(note);
    setShowForm(true);
  }, []);

  const handleFormClose = useCallback((): void => {
    setShowForm(false);
    setEditingNote(null);
  }, []);

  const handleSave = useCallback(
    async (payload: CreateNotePayload): Promise<void> => {
      if (editingNote) {
        await updateNote(editingNote.id, payload);
      } else {
        await createNote(payload);
      }
    },
    [editingNote, createNote, updateNote],
  );

  const handleDeleteRequest = useCallback((note: Note): void => {
    setConfirmDeleteNote(note);
  }, []);

  const handleDeleteConfirm = useCallback((): void => {
    if (!confirmDeleteNote) return;
    if (activeTab === 'deleted') {
      void hardDeleteNote(confirmDeleteNote.id);
    } else {
      void deleteNote(confirmDeleteNote.id);
    }
    setConfirmDeleteNote(null);
  }, [confirmDeleteNote, activeTab, hardDeleteNote, deleteNote]);

  const handleDeleteCancel = useCallback((): void => {
    setConfirmDeleteNote(null);
  }, []);

  const handleCategoryChange = useCallback(
    (id: string | undefined): void => {
      setCategory(id ?? null);
    },
    [setCategory],
  );

  const handleSortChange = useCallback(
    (field: typeof sortBy, order: typeof sortOrder): void => {
      setSortBy(field);
      setSortOrder(order);
    },
    [setSortBy, setSortOrder],
  );

  const categories = deriveCategories(notes);
  const counts = { notes: notes.length, archived: archivedNotes.length };

  const activeHandlers = {
    onEdit: handleEdit,
    onToggleArchive: archiveNote,
    onDelete: handleDeleteRequest,
  };

  const archivedHandlers = {
    onEdit: handleEdit,
    onToggleArchive: archiveNote,
    onDelete: handleDeleteRequest,
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        activeRoute={toSidebarRoute(activeTab)}
        counts={counts}
        onNavigate={handleNavigate}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
        <TopBar onSearch={setSearch} onNewNote={handleNewNote} sortOrder={sortOrder} onSortChange={handleSortChange} />

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <h1
            style={{
              margin: '0 0 20px',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 500,
              color: 'var(--text-primary)',
            }}
          >
            {activeTab === 'active'
              ? 'My Notes'
              : activeTab === 'archived'
                ? 'Archived'
                : 'Recently Deleted'}
          </h1>

          {activeTab === 'active' && (
            <>
              {categories.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <CategoryFilter
                    categories={categories}
                    activeId={activeCategory ?? undefined}
                    onChange={handleCategoryChange}
                  />
                </div>
              )}
              <NoteList
                notes={notes}
                loading={loading}
                error={error}
                emptyMessage="No notes yet. Create your first note."
                handlers={activeHandlers}
              />
            </>
          )}

          {activeTab === 'archived' && (
            <NoteList
              notes={archivedNotes}
              loading={loading}
              error={error}
              emptyMessage="No archived notes."
              handlers={archivedHandlers}
            />
          )}

          {activeTab === 'deleted' && (
            <RecentlyDeleted
              notes={deletedNotes}
              loading={loading}
              error={error}
              onRestore={restoreNote}
              onDelete={handleDeleteRequest}
            />
          )}
        </div>
      </div>

      {showForm && (
        <NoteForm note={editingNote} onClose={handleFormClose} onSave={handleSave} />
      )}

      {confirmDeleteNote !== null && (
        <DeleteConfirm
          note={confirmDeleteNote}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
