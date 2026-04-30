import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getNotes,
  createNote as apiCreateNote,
  updateNote as apiUpdateNote,
  toggleArchive,
  softDeleteNote,
  restoreNote as apiRestoreNote,
  hardDeleteNote as apiHardDeleteNote,
} from '../api/notesApi';
import type { Note, CreateNotePayload, UpdateNotePayload } from '../types';

export type SortField = 'createdAt' | 'updatedAt';
export type SortOrder = 'ASC' | 'DESC';

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
  const [deletedNotes, setDeletedNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('DESC');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const [active, archived, deleted] = await Promise.all([
        getNotes(
          false,
          false,
          searchQuery || undefined,
          activeCategory || undefined,
          sortBy,
          sortOrder,
        ),
        getNotes(true, false, undefined, undefined, sortBy, sortOrder),
        getNotes(false, true),
      ]);
      setNotes(active);
      setArchivedNotes(archived);
      setDeletedNotes(deleted);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, sortBy, sortOrder]);

  // Keep a stable ref to fetchNotes so the initial-mount effect can call the
  // latest version without listing it as a dependency (avoids an infinite loop
  // because fetchNotes identity changes whenever searchQuery/activeCategory change).
  const fetchNotesRef = useRef(fetchNotes);
  fetchNotesRef.current = fetchNotes;

  // Initial load — runs exactly once on mount.
  useEffect(() => {
    void fetchNotesRef.current();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced re-fetch whenever search query or active category changes.
  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchNotes();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  // --- Mutations ---

  const createNote = useCallback(
    async (dto: CreateNotePayload): Promise<Note> => {
      const note = await apiCreateNote(dto);
      await fetchNotes();
      return note;
    },
    [fetchNotes],
  );

  const updateNote = useCallback(
    async (id: string, dto: UpdateNotePayload): Promise<Note> => {
      const note = await apiUpdateNote(id, dto);
      await fetchNotes();
      return note;
    },
    [fetchNotes],
  );

  const archiveNote = useCallback(
    async (id: string): Promise<Note> => {
      const note = await toggleArchive(id);
      await fetchNotes();
      return note;
    },
    [fetchNotes],
  );

  const deleteNote = useCallback(
    async (id: string): Promise<void> => {
      await softDeleteNote(id);
      await fetchNotes();
    },
    [fetchNotes],
  );

  const restoreNote = useCallback(
    async (id: string): Promise<Note> => {
      const note = await apiRestoreNote(id);
      await fetchNotes();
      return note;
    },
    [fetchNotes],
  );

  const hardDeleteNote = useCallback(
    async (id: string): Promise<void> => {
      await apiHardDeleteNote(id);
      await fetchNotes();
    },
    [fetchNotes],
  );

  // --- Search / category setters ---

  const setSearch = useCallback((q: string): void => {
    setSearchQuery(q);
  }, []);

  const setCategory = useCallback((id: string | null): void => {
    setActiveCategory(id);
  }, []);

  return {
    notes,
    archivedNotes,
    deletedNotes,
    searchQuery,
    activeCategory,
    sortBy,
    sortOrder,
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
    setSortBy,
    setSortOrder,
  };
}
