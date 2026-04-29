import axios from 'axios';
import type {
  Note,
  Category,
  CreateNotePayload,
  UpdateNotePayload,
  CreateCategoryPayload,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export interface FetchNotesParams {
  archived?: boolean;
  deleted?: boolean;
  search?: string;
  categoryId?: string;
}

export const notesApi = {
  fetchNotes(params?: FetchNotesParams): Promise<Note[]> {
    return api.get<Note[]>('/notes', { params }).then(r => r.data);
  },

  createNote(payload: CreateNotePayload): Promise<Note> {
    return api.post<Note>('/notes', payload).then(r => r.data);
  },

  updateNote(id: string, payload: UpdateNotePayload): Promise<Note> {
    return api.put<Note>(`/notes/${id}`, payload).then(r => r.data);
  },

  toggleArchive(id: string): Promise<Note> {
    return api.patch<Note>(`/notes/${id}/archive`).then(r => r.data);
  },

  deleteNote(id: string): Promise<void> {
    return api.delete(`/notes/${id}`).then(() => undefined);
  },

  restoreNote(id: string): Promise<Note> {
    return api.patch<Note>(`/notes/${id}/restore`).then(r => r.data);
  },

  permanentDelete(id: string): Promise<void> {
    return api.delete(`/notes/${id}/permanent`).then(() => undefined);
  },

  fetchCategories(): Promise<Category[]> {
    return api.get<Category[]>('/categories').then(r => r.data);
  },

  createCategory(payload: CreateCategoryPayload): Promise<Category> {
    return api.post<Category>('/categories', payload).then(r => r.data);
  },

  addCategory(noteId: string, catId: string): Promise<Note> {
    return api.post<Note>(`/notes/${noteId}/categories/${catId}`).then(r => r.data);
  },

  removeCategory(noteId: string, catId: string): Promise<Note> {
    return api.delete<Note>(`/notes/${noteId}/categories/${catId}`).then(r => r.data);
  },
};
