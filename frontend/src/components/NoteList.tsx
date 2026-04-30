import React from 'react';
import type { Note } from '../types';
import { NoteCard } from './NoteCard';

interface NoteListHandlers {
  onEdit: (note: Note) => void;
  onToggleArchive: (id: string) => void;
  onDelete: (note: Note) => void;
}

interface NoteListProps {
  notes: Note[];
  loading: boolean;
  error: string | null;
  emptyMessage: string;
  handlers: NoteListHandlers;
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '14px',
};

function SkeletonCard(): React.ReactElement {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: '10px',
        padding: '14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      }}
    >
      <div style={{ height: '10px', borderRadius: '4px', background: 'var(--surf3)', width: '55%' }} />
      <div style={{ height: '10px', borderRadius: '4px', background: 'var(--surf3)', width: '88%' }} />
      <div style={{ height: '10px', borderRadius: '4px', background: 'var(--surf3)', width: '72%' }} />
    </div>
  );
}

export function NoteList({ notes, loading, error, emptyMessage, handlers }: NoteListProps): React.ReactElement {
  if (loading) {
    return (
      <div style={gridStyle}>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 16px' }}>
        <p style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', margin: 0 }}>{error}</p>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          padding: '64px 16px',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: '24px' }}>📝</span>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)', margin: 0 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={gridStyle}>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={handlers.onEdit}
          onToggleArchive={handlers.onToggleArchive}
          onDelete={handlers.onDelete}
        />
      ))}
    </div>
  );
}
