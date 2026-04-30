import React from 'react';
import type { Note } from '../types';
import { NoteCard } from './NoteCard';

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onArchive: (id: string) => void;
  onDelete: (note: Note) => void;
  emptyMessage: string;
}

export function NoteList({
  notes,
  onEdit,
  onArchive,
  onDelete,
  emptyMessage,
}: NoteListProps): React.ReactElement {
  if (notes.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[var(--text-muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={onEdit}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
