import React from 'react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

export function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleArchive,
}: NoteCardProps): React.ReactElement {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white truncate">{note.title}</h3>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onToggleArchive(note.id)}
            className="text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--border)]"
          >
            {note.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            onClick={() => onEdit(note)}
            className="text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--border)]"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-[var(--border)]"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="text-sm text-[var(--text-muted)] line-clamp-3">{note.content}</p>
      {note.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.categories.map(cat => (
            <span
              key={cat.id}
              className="text-xs px-2 py-0.5 rounded-full bg-[var(--brand-violet-dark)] text-[var(--brand-violet-light)]"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
