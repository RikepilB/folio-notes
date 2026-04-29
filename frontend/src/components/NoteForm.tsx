import React, { useState, useEffect } from 'react';
import type { Note, Category, CreateNotePayload } from '../types';

interface NoteFormProps {
  note?: Note;
  categories: Category[];
  onSubmit: (payload: CreateNotePayload) => Promise<void>;
  onCancel: () => void;
}

export function NoteForm({
  note,
  categories,
  onSubmit,
  onCancel,
}: NoteFormProps): React.ReactElement {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [isPublic, setIsPublic] = useState(note?.isPublic ?? false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    note?.categories.map(c => c.id) ?? [],
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setIsPublic(note?.isPublic ?? false);
    setSelectedCategoryIds(note?.categories.map(c => c.id) ?? []);
  }, [note]);

  const toggleCategory = (id: string): void => {
    setSelectedCategoryIds(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({ title, content, isPublic, categoryIds: selectedCategoryIds });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
        maxLength={255}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-violet)]"
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        required
        rows={6}
        className="w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-violet)] resize-none"
      />
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedCategoryIds.includes(cat.id)
                  ? 'bg-[var(--brand-violet)] border-[var(--brand-violet)] text-white'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-violet)]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}
      <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={e => setIsPublic(e.target.checked)}
          className="rounded"
        />
        Make public
      </label>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded border border-[var(--border)] text-[var(--text-muted)] hover:text-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded bg-[var(--brand-orange)] text-white font-medium hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Saving…' : note ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}
