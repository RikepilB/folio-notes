import React, { useEffect, useRef, useCallback } from 'react';
import type { Note } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface DeleteConfirmProps {
  note: Note;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ note, onConfirm, onCancel }: DeleteConfirmProps): React.ReactElement {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);
  const handleCancel = useCallback(() => onCancel(), [onCancel]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleCancel]);

  return (
    <div
      role="presentation"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        style={{
          background: 'var(--surf2)',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '380px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h2
          id="delete-confirm-title"
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Delete this note?
        </h2>

        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          &ldquo;{note.title}&rdquo; will be moved to Recently Deleted. You have 30 days to restore it.
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0 16px',
              height: '30px',
              borderRadius: '8px',
              border: '0.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'color 150ms ease-out, border-color 150ms ease-out',
            }}
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--error)';
              e.currentTarget.style.borderColor = 'var(--error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
            style={{
              padding: '0 16px',
              height: '30px',
              borderRadius: '8px',
              border: '0.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'color 150ms ease-out, border-color 150ms ease-out',
            }}
          >
            Move to trash
          </button>
        </div>
      </div>
    </div>
  );
}
