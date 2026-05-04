import axios from 'axios';
import type { Note, Category, CreateNotePayload, UpdateNotePayload } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

const SORT_FIELD_MAP: Record<string, string> = {
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

function mapNote(raw: Record<string, unknown>): Note {
  return {
    id: raw.id as string,
    title: raw.title as string,
    content: raw.content as string,
    archived: raw.archived as boolean,
    deleted: raw.deleted as boolean,
    deletedAt: (raw.deleted_at ?? null) as string | null,
    isPublic: (raw.is_public ?? false) as boolean,
    categories: (raw.categories ?? []) as Category[],
    createdAt: raw.created_at as string,
    updatedAt: raw.updated_at as string,
  };
}

export function getNotes(
  archived: boolean,
  deleted: boolean,
  search?: string,
  categoryId?: string,
  sortBy?: string,
  order?: string,
): Promise<Note[]> {
  const mappedSort = sortBy ? (SORT_FIELD_MAP[sortBy] ?? sortBy) : undefined;
  return api
    .get('/notes', { params: { archived, deleted, search, categoryId, sortBy: mappedSort, order } })
    .then((r) => {
      const data = Array.isArray(r.data) ? r.data : [];
      return (data as Record<string, unknown>[]).map(mapNote);
    });
}

export function createNote(payload: CreateNotePayload): Promise<Note> {
  return api.post('/notes', payload).then((r) => mapNote(r.data as Record<string, unknown>));
}

export function updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
  return api.put(`/notes/${id}`, payload).then((r) => mapNote(r.data as Record<string, unknown>));
}

export function toggleArchive(id: string): Promise<Note> {
  return api.patch(`/notes/${id}/archive`).then((r) => mapNote(r.data as Record<string, unknown>));
}

export function softDeleteNote(id: string): Promise<void> {
  return api.delete(`/notes/${id}`).then(() => undefined);
}

export function restoreNote(id: string): Promise<Note> {
  return api.patch(`/notes/${id}/restore`).then((r) => mapNote(r.data as Record<string, unknown>));
}

export function hardDeleteNote(id: string): Promise<void> {
  return api.delete(`/notes/${id}/permanent`).then(() => undefined);
}

export function getCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories').then((r) => Array.isArray(r.data) ? r.data : []);
}

export function createCategory(name: string): Promise<Category> {
  return api.post<Category>('/categories', { name }).then((r) => r.data);
}

export function addCategoryToNote(noteId: string, categoryId: string): Promise<Note> {
  return api.post(`/notes/${noteId}/categories/${categoryId}`).then((r) => mapNote(r.data as Record<string, unknown>));
}

export function removeCategoryFromNote(noteId: string, categoryId: string): Promise<Note> {
  return api.delete(`/notes/${noteId}/categories/${categoryId}`).then((r) => mapNote(r.data as Record<string, unknown>));
}
