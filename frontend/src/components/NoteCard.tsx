import React, { useState } from 'react';
import type { Note } from '../types';
import { relativeTime } from '../utils/relativeTime';

interface Props {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onToggleArchive: (id: string) => void;
}

function truncate(text: string): string {
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
}


const baseBtn: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 8px',
  borderRadius: '6px',
  border: '0.5px solid var(--border)',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontSize: 'var(--text-xs)',
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
  transition: 'color 150ms ease-out, border-color 150ms ease-out, background 150ms ease-out',
};

export function NoteCard({ note, onEdit, onDelete, onToggleArchive }: Props): React.ReactElement {
  const [cardHovered, setCardHovered] = useState(false);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const archiveBtnId = note.archived ? 'unarchive' : 'archive';
  const archiveLabel = note.archived ? 'Unarchive' : 'Archive';
  const archiveHoverColor = note.archived ? 'var(--success)' : 'var(--warning)';

  return (
    <article
      onMouseEnter={() => setCardHovered(true)}
      onMouseLeave={() => { setCardHovered(false); setHoveredBtn(null); }}
      style={{
        background: 'var(--surface)',
        border: `1px solid ${cardHovered ? 'var(--border2)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        opacity: note.archived ? 0.65 : 1,
        transition: 'border-color 150ms ease-out, box-shadow 150ms ease-out',
        boxShadow: cardHovered ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      {/* Category pills */}
      {note.categories.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {note.categories.map((cat) => (
            <span
              key={cat.id}
              style={{
                background: 'var(--surf2)',
                color: 'var(--brand-violet-light)',
                border: '0.5px solid var(--border2)',
                borderRadius: '4px',
                fontSize: 'var(--text-xs)',
                padding: '2px 7px',
              }}
            >
              {cat.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-md)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          lineHeight: 1.3,
        }}
      >
        {note.title}
      </h3>

      {/* Content preview */}
      {note.content.length > 0 && (
        <p
          style={{
            margin: 0,
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          {truncate(note.content)}
        </p>
      )}

      {/* Footer: timestamp + actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '2px',
        }}
      >
        <time
          dateTime={note.updatedAt}
          style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}
        >
          {relativeTime(note.updatedAt)}
        </time>

        <div
          role="group"
          aria-label={`Actions for note: ${note.title}`}
          style={{
            display: 'flex',
            gap: '4px',
            opacity: cardHovered ? 1 : 0,
            transition: 'opacity 150ms ease-out',
          }}
        >
          <button
            aria-label={`Edit note: ${note.title}`}
            onClick={() => onEdit(note)}
            onMouseEnter={() => setHoveredBtn('edit')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...baseBtn,
              color: hoveredBtn === 'edit' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderColor: hoveredBtn === 'edit' ? 'var(--border2)' : 'var(--border)',
            }}
          >
            Edit
          </button>

          <button
            aria-label={`${archiveLabel} note: ${note.title}`}
            onClick={() => onToggleArchive(note.id)}
            onMouseEnter={() => setHoveredBtn(archiveBtnId)}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...baseBtn,
              color: hoveredBtn === archiveBtnId ? archiveHoverColor : 'var(--text-muted)',
              borderColor: hoveredBtn === archiveBtnId ? archiveHoverColor : 'var(--border)',
            }}
          >
            {archiveLabel}
          </button>

          <button
            aria-label={`Delete note: ${note.title}`}
            onClick={() => onDelete(note)}
            onMouseEnter={() => setHoveredBtn('delete')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              ...baseBtn,
              color: hoveredBtn === 'delete' ? 'var(--error)' : 'var(--text-muted)',
              borderColor: hoveredBtn === 'delete' ? 'var(--error)' : 'var(--border)',
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
