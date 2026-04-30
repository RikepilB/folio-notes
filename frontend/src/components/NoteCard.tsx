import React from 'react';
import type { Note } from '../types';
import { relativeTime } from '../utils/relativeTime';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onArchive: (id: string) => void;
  onDelete: (note: Note) => void;
}

export function NoteCard({ note, onEdit, onArchive, onDelete }: NoteCardProps): React.ReactElement {
  const preview =
    note.content.slice(0, 120) + (note.content.length > 120 ? '…' : '');

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-white truncate">{note.title}</h3>
        <div className="flex gap-1 shrink-0">
          <button
            aria-label="Edit note"
            onClick={() => onEdit(note)}
            className="text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--border)] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
          >
            Edit
          </button>
          <button
            aria-label={note.archived ? 'Unarchive note' : 'Archive note'}
            onClick={() => onArchive(note.id)}
            className="text-xs text-[var(--text-muted)] hover:text-white px-2 py-1 rounded hover:bg-[var(--border)] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
          >
            {note.archived ? 'Unarchive' : 'Archive'}
          </button>
          <button
            aria-label="Delete note"
            onClick={() => onDelete(note)}
            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-[var(--border)] transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--text-muted)]">{preview}</p>

      {note.categories.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.categories.map((cat) => (
            <span
              key={cat.id}
              className="text-xs px-2 py-0.5 rounded-full border border-[var(--border)] text-[var(--text-muted)]"
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] mt-auto pt-1">{relativeTime(note.updatedAt)}</p>
    </div>
  );
}
