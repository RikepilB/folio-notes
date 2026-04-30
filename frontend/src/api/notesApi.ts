import axios from 'axios';
import type { Note, Category, CreateNotePayload, UpdateNotePayload } from '../types';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000' });

export function getNotes(
  archived: boolean,
  deleted: boolean,
  search?: string,
  categoryId?: string,
): Promise<Note[]> {
  return api.get<Note[]>('/notes', { params: { archived, deleted, search, categoryId } }).then((r) => r.data);
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
