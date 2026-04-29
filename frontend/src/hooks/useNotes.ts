import { useState, useEffect, useCallback, useRef } from 'react';
import { notesApi } from '../api/notesApi';
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
} from '../types';

export interface FetchNotesParams {
  archived?: boolean;
  deleted?: boolean;
  search?: string;
  categoryId?: string;
}

export interface UseNotesReturn {
  notes: Note[];
  loading: boolean;
  error: string | null;
  createNote: (payload: CreateNotePayload) => Promise<Note>;
  updateNote: (id: string, payload: UpdateNotePayload) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;
  restoreNote: (id: string) => Promise<Note>;
  permanentDelete: (id: string) => Promise<void>;
  toggleArchive: (id: string) => Promise<Note>;
  refetch: () => void;
}

export function useNotes(params?: FetchNotesParams): UseNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paramsKey = JSON.stringify(params);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const fetch = useCallback(() => {
    setLoading(true);
    setError(null);
    notesApi
      .fetchNotes(paramsRef.current)
      .then(setNotes)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load notes';
        setError(message);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const createNote = useCallback(async (payload: CreateNotePayload): Promise<Note> => {
    const note = await notesApi.createNote(payload);
    setNotes(prev => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(async (id: string, payload: UpdateNotePayload): Promise<Note> => {
    const updated = await notesApi.updateNote(id, payload);
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string): Promise<void> => {
    await notesApi.deleteNote(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const restoreNote = useCallback(async (id: string): Promise<Note> => {
    const restored = await notesApi.restoreNote(id);
    setNotes(prev => prev.map(n => (n.id === id ? restored : n)));
    return restored;
  }, []);

  const permanentDelete = useCallback(async (id: string): Promise<void> => {
    await notesApi.permanentDelete(id);
    setNotes(prev => prev.filter(n => n.id !== id));
  }, []);

  const toggleArchive = useCallback(async (id: string): Promise<Note> => {
    const updated = await notesApi.toggleArchive(id);
    setNotes(prev => prev.map(n => (n.id === id ? updated : n)));
    return updated;
  }, []);

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    restoreNote,
    permanentDelete,
    toggleArchive,
    refetch: fetch,
  };
}
