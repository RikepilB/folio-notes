export interface Category {
  id: string;
  name: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  archived: boolean;
  deleted: boolean;
  deletedAt: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

export interface CreateNotePayload {
  title: string;
  content: string;
  isPublic?: boolean;
  categoryIds?: string[];
}

export interface UpdateNotePayload {
  title?: string;
  content?: string;
  isPublic?: boolean;
  categoryIds?: string[];
}

export interface CreateCategoryPayload {
  name: string;
}
