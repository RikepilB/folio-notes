import React, { useState } from 'react';
import type { Note } from '../types';

interface Props {
  notes: Note[];
  loading: boolean;
  error: string | null;
  onRestore: (id: string) => void;
  onDelete: (note: Note) => void;
}

function expiryLabel(deletedAt: string | null): string {
  if (!deletedAt) return '';
  const expiry = new Date(new Date(deletedAt).getTime() + 30 * 24 * 60 * 60 * 1000);
  return `expires ${expiry.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
}

function deletedOnLabel(deletedAt: string | null): string {
  if (!deletedAt) return '';
  return new Date(deletedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const rowBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: '6px',
  border: '0.5px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'color 150ms ease-out, border-color 150ms ease-out',
  whiteSpace: 'nowrap',
  flexShrink: 0,
};

function NoteRow({
  note,
  onRestore,
  onDelete,
}: {
  note: Note;
  onRestore: (id: string) => void;
  onDelete: (note: Note) => void;
}): React.ReactElement {
  const [restoreHovered, setRestoreHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        padding: '12px 16px',
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: '8px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {note.title}
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          {deletedOnLabel(note.deletedAt)} · {expiryLabel(note.deletedAt)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button
          aria-label={`Restore note: ${note.title}`}
          onClick={() => onRestore(note.id)}
          onMouseEnter={() => setRestoreHovered(true)}
          onMouseLeave={() => setRestoreHovered(false)}
          style={{
            ...rowBtn,
            color: restoreHovered ? 'var(--success)' : 'var(--text-muted)',
            borderColor: restoreHovered ? 'var(--success)' : 'var(--border)',
          }}
        >
          Restore
        </button>

        <button
          aria-label={`Delete forever note: ${note.title}`}
          onClick={() => onDelete(note)}
          onMouseEnter={() => setDeleteHovered(true)}
          onMouseLeave={() => setDeleteHovered(false)}
          style={{
            ...rowBtn,
            color: deleteHovered ? 'var(--error)' : 'var(--text-muted)',
            borderColor: deleteHovered ? 'var(--error)' : 'var(--border)',
          }}
        >
          Delete forever
        </button>
      </div>
    </div>
  );
}

export function RecentlyDeleted({ notes, loading, error, onRestore, onDelete }: Props): React.ReactElement {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            style={{
              height: '58px',
              background: 'var(--surface)',
              border: '0.5px solid var(--border)',
              borderRadius: '8px',
              animation: 'skeleton-pulse 1.5s ease-in-out infinite',
            }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p role="alert" style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', margin: 0 }}>
        {error}
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <p style={{ margin: '0 0 16px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
          Notes deleted within 30 days. Restore before expiry.
        </p>

        {notes.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '64px 16px',
            }}
          >
            <span aria-hidden="true" style={{ fontSize: '24px' }}>🗑️</span>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>
              Recently deleted is empty
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {notes.map((note) => (
              <NoteRow
                key={note.id}
                note={note}
                onRestore={onRestore}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
