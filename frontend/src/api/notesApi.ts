import axios from 'axios';
import type { Note, Category, CreateNotePayload, UpdateNotePayload } from '../types';

const SUPABASE_URL = 'https://ffitssrosgkrzgjozscc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmaXRzc3Jvc2drcmpoem96c2MiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0Mzg2MTcwMywiZXhwIjoxOTU5MjM3NzAzfQ.2fi-iABtHkR4pVhJGO0r-h-c1D0f7gZ1zL8kB2qJ1w';

const api = axios.create({
  baseURL: `${SUPABASE_URL}/functions/v1/notes-api`,
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  },
});

export function getNotes(
  archived: boolean,
  deleted: boolean,
  search?: string,
  categoryId?: string,
  sortBy?: string,
  order?: string,
): Promise<Note[]> {
  return api.get<Note[]>('/notes', { params: { archived, deleted, search, categoryId, sortBy, order } }).then((r) => r.data);
}

export function createNote(payload: CreateNotePayload): Promise<Note> {
  return api.post<Note>('/notes', payload).then((r) => r.data);
}

export function updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
  return api.put<Note>(`/notes/${id}`, payload).then((r) => r.data);
}

export function toggleArchive(id: string): Promise<Note> {
  return api.patch<Note>(`/notes/${id}/archive`).then((r) => r.data);
}

export function softDeleteNote(id: string): Promise<void> {
  return api.delete(`/notes/${id}`).then(() => undefined);
}

export function restoreNote(id: string): Promise<Note> {
  return api.patch<Note>(`/notes/${id}/restore`).then((r) => r.data);
}

export function hardDeleteNote(id: string): Promise<void> {
  return api.delete(`/notes/${id}/permanent`).then(() => undefined);
}

export function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories').then((r) => r.data);
}

export function createCategory(name: string): Promise<Category> {
  return api.post<Category>('/categories', { name }).then((r) => r.data);
}

export function addCategoryToNote(noteId: string, categoryId: string): Promise<Note> {
  return api.post<Note>(`/notes/${noteId}/categories/${categoryId}`).then((r) => r.data);
}

export function removeCategoryFromNote(noteId: string, categoryId: string): Promise<Note> {
  return api.delete<Note>(`/notes/${noteId}/categories/${categoryId}`).then((r) => r.data);
}
