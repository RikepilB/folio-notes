import React, { useState, useEffect, useRef } from 'react';
import type { Note, CreateNotePayload } from '../types';

interface NoteFormProps {
  note?: Note;
  onSave: (payload: CreateNotePayload) => Promise<void>;
  onCancel: () => void;
}

export function NoteForm({ note, onSave, onCancel }: NoteFormProps): React.ReactElement {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
  }, [note]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await onSave({ title, content });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="note-title" className="text-sm text-[var(--text-muted)]">
          Title <span aria-hidden="true">*</span>
        </label>
        <input
          id="note-title"
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-required="true"
          maxLength={255}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-orange)] transition-colors duration-150 ease-out"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="note-content" className="text-sm text-[var(--text-muted)]">
          Content <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          aria-required="true"
          rows={6}
          className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-orange)] resize-none transition-colors duration-150 ease-out"
        />
      </div>
      {submitError && (
        <p className="text-sm text-red-400" role="alert">
          {submitError}
        </p>
      )}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-white transition-[opacity,colors] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-[var(--brand-orange)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-[opacity,colors] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
        >
          {submitting ? 'Saving…' : note ? 'Update note' : 'Save note'}
        </button>
      </div>
    </form>
  );
}
