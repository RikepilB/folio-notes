import React from 'react';
import type { Note } from '../types';

interface DeleteConfirmProps {
  note: Note;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({ note, onConfirm, onCancel }: DeleteConfirmProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-6 max-w-sm w-full mx-4">
        <h2 className="text-white font-semibold mb-2">
          Delete &ldquo;{note.title}&rdquo;?
        </h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          This note will be moved to trash.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-white transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-500 text-white transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
