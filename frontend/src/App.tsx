import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, ViewMode } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { NoteList } from './components/NoteList';
import { NoteForm } from './components/NoteForm';
import { CategoryFilter } from './components/CategoryFilter';
import { DeleteConfirm } from './components/DeleteConfirm';
import { useNotes } from './hooks/useNotes';
import { notesApi } from './api/notesApi';
import type { Note, Category, CreateNotePayload, UpdateNotePayload } from './types';

export default function App(): React.ReactElement {
  const [view, setView] = useState<ViewMode>('notes');
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<
    string | undefined
  >();
  const [editingNote, setEditingNote] = useState<Note | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | undefined>();
  const [categories, setCategories] = useState<Category[]>([]);

  const notesParams = {
    archived: view === 'archived' ? true : undefined,
    deleted: view === 'trash' ? true : false,
    search: search || undefined,
    categoryId: selectedCategoryId,
  };

  const {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    toggleArchive,
  } = useNotes(notesParams);

  useEffect(() => {
    notesApi
      .fetchCategories()
      .then(setCategories)
      .catch((err: unknown) => console.error('Failed to load categories', err));
  }, []);

  const handleNewNote = useCallback((): void => {
    setEditingNote(undefined);
    setIsFormOpen(true);
  }, []);

  const handleEdit = useCallback((note: Note): void => {
    setEditingNote(note);
    setIsFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (payload: CreateNotePayload): Promise<void> => {
      if (editingNote) {
        await updateNote(editingNote.id, payload as UpdateNotePayload);
      } else {
        await createNote(payload);
      }
      setIsFormOpen(false);
      setEditingNote(undefined);
    },
    [editingNote, updateNote, createNote],
  );

  const handleCancelForm = useCallback((): void => {
    setIsFormOpen(false);
    setEditingNote(undefined);
  }, []);

  const handleDeleteRequest = useCallback((id: string): void => {
    setDeleteId(id);
  }, []);

  const handleDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!deleteId) return;
    await deleteNote(deleteId);
    setDeleteId(undefined);
  }, [deleteId, deleteNote]);

  const handleDeleteCancel = useCallback((): void => {
    setDeleteId(undefined);
  }, []);

  const handleToggleArchive = useCallback(
    (id: string): void => {
      void toggleArchive(id);
    },
    [toggleArchive],
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar currentView={view} onViewChange={setView} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar
          search={search}
          onSearchChange={setSearch}
          onNewNote={handleNewNote}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <CategoryFilter
              categories={categories}
              selectedId={selectedCategoryId}
              onSelect={setSelectedCategoryId}
            />
          </div>
          {isFormOpen ? (
            <div className="max-w-xl">
              <NoteForm
                note={editingNote}
                categories={categories}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelForm}
              />
            </div>
          ) : (
            <NoteList
              notes={notes}
              loading={loading}
              error={error}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              onToggleArchive={handleToggleArchive}
            />
          )}
        </main>
      </div>
      {deleteId !== undefined && (
        <DeleteConfirm
          message="Move this note to trash?"
          onConfirm={() => void handleDeleteConfirm()}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}
