import React, { useState, useCallback, useEffect } from 'react';
import { NoteList } from './components/NoteList';
import { NoteForm } from './components/NoteForm';
import { CategoryFilter } from './components/CategoryFilter';
import { DeleteConfirm } from './components/DeleteConfirm';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { useNotes } from './hooks/useNotes';
import { getCategories } from './api/notesApi';
import type { Note, Category, CreateNotePayload } from './types';

type ActiveView = 'active' | 'archived' | 'deleted';

export default function App(): React.ReactElement {
  const [activeView, setActiveView] = useState<ActiveView>('active');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Note | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    notes,
    archivedNotes,
    deletedNotes,
    searchQuery,
    activeCategory,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    archiveNote,
    deleteNote,
    restoreNote,
    hardDeleteNote,
    setSearch,
    setCategory,
  } = useNotes();

  // Determine which note list to show based on active view
  const visibleNotes =
    activeView === 'archived'
      ? archivedNotes
      : activeView === 'deleted'
      ? deletedNotes
      : notes;

  const emptyMessage =
    activeView === 'archived'
      ? 'Nothing archived'
      : activeView === 'deleted'
      ? 'Recently deleted is empty'
      : 'No active notes yet';

  // Load categories once on mount
  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((err: unknown) => {
        void err;
      });
  }, []);

  // --- Handlers ---

  const handleNewNote = useCallback((): void => {
    setEditingNote(null);
    setShowCreateForm(true);
  }, []);

  const handleEdit = useCallback((note: Note): void => {
    setShowCreateForm(false);
    setEditingNote(note);
  }, []);

  const handleFormSave = useCallback(
    async (payload: CreateNotePayload): Promise<void> => {
      if (editingNote !== null) {
        await updateNote(editingNote.id, payload);
      } else {
        await createNote(payload);
      }
      setEditingNote(null);
      setShowCreateForm(false);
    },
    [editingNote, updateNote, createNote],
  );

  const handleCancelForm = useCallback((): void => {
    setEditingNote(null);
    setShowCreateForm(false);
  }, []);

  // Archive handler — when in deleted view, calls restoreNote instead
  const handleArchive = useCallback(
    async (id: string): Promise<void> => {
      if (activeView === 'deleted') {
        await restoreNote(id);
      } else {
        await archiveNote(id);
      }
    },
    [activeView, restoreNote, archiveNote],
  );

  // Delete handler — shows confirm dialog
  const handleDeleteRequest = useCallback((note: Note): void => {
    setShowDeleteConfirm(note);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (showDeleteConfirm === null) return;
    if (activeView === 'deleted') {
      await hardDeleteNote(showDeleteConfirm.id);
    } else {
      await deleteNote(showDeleteConfirm.id);
    }
    setShowDeleteConfirm(null);
  }, [showDeleteConfirm, activeView, hardDeleteNote, deleteNote]);

  const handleDeleteCancel = useCallback((): void => {
    setShowDeleteConfirm(null);
  }, []);

  const showForm = editingNote !== null || showCreateForm;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--brand-black)] text-white">
      {/* Left panel — 240px fixed width */}
      <div className="w-60 shrink-0">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          notesCount={notes.length}
          archivedCount={archivedNotes.length}
          deletedCount={deletedNotes.length}
        />
      </div>

      {/* Right panel — flex-1 */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar searchQuery={searchQuery} onSearchChange={setSearch} />

        {/* Toolbar: category filter + actions */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border)]">
          {activeView !== 'deleted' && (
            <CategoryFilter
              categories={categories}
              activeCategory={activeCategory}
              onSelect={setCategory}
            />
          )}
          <div className="flex gap-2 ml-auto">
            <button
              data-testid="new-note-btn"
              onClick={handleNewNote}
              className="px-3 py-1.5 rounded bg-[var(--brand-orange)] text-white text-sm font-medium hover:opacity-90 transition-[opacity] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
            >
              + New note
            </button>
            <button
              onClick={() => void fetchNotes()}
              aria-label="Refresh"
              className="text-[var(--text-muted)] hover:text-white text-sm px-2 py-1.5 rounded hover:bg-[var(--surf2)] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
            >
              ↺
            </button>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="h-32 rounded-lg border border-[var(--border)] bg-[var(--surf2)] animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <p className="text-red-400 text-center py-8" role="alert">
              {error}
            </p>
          ) : (
            <NoteList
              notes={visibleNotes}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={handleDeleteRequest}
              emptyMessage={emptyMessage}
            />
          )}
        </main>
      </div>

      {/* Overlay: NoteForm — shown when editingNote !== null OR showCreateForm === true */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--surf2)] rounded-lg border border-[var(--border)] p-6 w-full max-w-xl mx-4">
            <NoteForm
              note={editingNote ?? undefined}
              onSave={handleFormSave}
              onCancel={handleCancelForm}
            />
          </div>
        </div>
      )}

      {/* Overlay: DeleteConfirm — shown when showDeleteConfirm !== null */}
      {showDeleteConfirm !== null && (
        <DeleteConfirm
          note={showDeleteConfirm}
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
