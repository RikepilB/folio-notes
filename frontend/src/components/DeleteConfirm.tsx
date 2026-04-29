import React from 'react';

interface DeleteConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirm({
  message,
  onConfirm,
  onCancel,
}: DeleteConfirmProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surf2)] p-6 max-w-sm w-full mx-4">
        <p className="text-white mb-4">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-500"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
