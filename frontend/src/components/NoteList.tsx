import React from 'react';
import type { Note } from '../types';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

export function NoteList({
  notes,
  loading,
  error,
  onEdit,
  onDelete,
  onToggleArchive,
}: NoteListProps): React.ReactElement {
  if (loading) {
    return (
      <p className="text-[var(--text-muted)] text-center py-8">Loading notes…</p>
    );
  }
  if (error) {
    return <p className="text-red-400 text-center py-8">{error}</p>;
  }
  if (notes.length === 0) {
    return (
      <p className="text-[var(--text-muted)] text-center py-8">No notes found.</p>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleArchive={onToggleArchive}
        />
      ))}
    </div>
  );
}
