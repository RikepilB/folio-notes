import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Note, Category, CreateNotePayload } from '../types';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { createCategory, getCategories } from '../api/notesApi';

interface NoteFormProps {
  note?: Note | null;
  onClose: () => void;
  onSave: (payload: CreateNotePayload) => Promise<void>;
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surf2)',
  border: '0.5px solid var(--border)',
  borderRadius: '6px',
  padding: '8px 10px',
  color: 'var(--text-primary)',
  fontSize: 'var(--text-sm)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
  transition: 'border-color 150ms ease-out',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 'var(--text-xs)',
  color: 'var(--text-muted)',
  marginBottom: '4px',
  fontFamily: 'var(--font-body)',
};

export function NoteForm({ note, onClose, onSave }: NoteFormProps): React.ReactElement {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [categories, setCategories] = useState<Category[]>(note?.categories ?? []);
  const [categoryInput, setCategoryInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [titleFocused, setTitleFocused] = useState(false);
  const [contentFocused, setContentFocused] = useState(false);
  const [catInputFocused, setCatInputFocused] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setCategories(note?.categories ?? []);
  }, [note]);

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleClose]);

  const addCategory = (): void => {
    const name = categoryInput.trim();
    if (!name || categories.some((c) => c.name.toLowerCase() === name.toLowerCase())) return;
    setCategories((prev) => [...prev, { id: `temp-${Date.now()}`, name }]);
    setCategoryInput('');
  };

  const removeCategory = (id: string): void => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleCatKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCategory();
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const existingCategories = await getCategories();
      const existingIds = new Set(existingCategories.map((c) => c.name.toLowerCase()));

      const newCategories = categories.filter((c) => c.id.startsWith('temp-'));
      const existingCatIds = categories
        .filter((c) => !c.id.startsWith('temp-'))
        .map((c) => c.id);

      const createdIds: string[] = [];
      for (const cat of newCategories) {
        const normalizedName = cat.name.toLowerCase().trim();
        if (!existingIds.has(normalizedName)) {
          const created = await createCategory(cat.name.trim());
          createdIds.push(created.id);
          existingIds.add(normalizedName);
        } else {
          const existing = existingCategories.find(
            (c) => c.name.toLowerCase() === normalizedName,
          );
          if (existing) createdIds.push(existing.id);
        }
      }

      await onSave({
        title,
        content,
        categoryIds: [...existingCatIds, ...createdIds],
      });
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save note');
    } finally {
      setSubmitting(false);
    }
  };

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
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="note-form-title"
        style={{
          background: 'var(--surf2)',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '420px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}
      >
        <h2
          id="note-form-title"
          style={{
            margin: 0,
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          {note ? 'Edit note' : 'New note'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label htmlFor="nf-title" style={labelStyle}>
              Title <span aria-hidden="true">*</span>
            </label>
            <input
              id="nf-title"
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-required="true"
              maxLength={255}
              onFocus={() => setTitleFocused(true)}
              onBlur={() => setTitleFocused(false)}
              style={{
                ...inputStyle,
                borderColor: titleFocused ? 'var(--brand-violet)' : 'var(--border)',
              }}
            />
          </div>

          <div>
            <label htmlFor="nf-content" style={labelStyle}>
              Content <span aria-hidden="true">*</span>
            </label>
            <textarea
              id="nf-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              aria-required="true"
              rows={6}
              onFocus={() => setContentFocused(true)}
              onBlur={() => setContentFocused(false)}
              style={{
                ...inputStyle,
                resize: 'vertical',
                borderColor: contentFocused ? 'var(--brand-violet)' : 'var(--border)',
              }}
            />
          </div>

          <div>
            <label style={labelStyle}>Categories</label>
            {categories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {categories.map((cat) => (
                  <span
                    key={cat.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'var(--surf3)',
                      color: 'var(--brand-violet-light)',
                      border: '0.5px solid var(--border2)',
                      borderRadius: '4px',
                      fontSize: 'var(--text-xs)',
                      padding: '2px 7px',
                    }}
                  >
                    {cat.name}
                    <button
                      type="button"
                      aria-label={`Remove category ${cat.name}`}
                      onClick={() => removeCategory(cat.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0 0 0 2px',
                        cursor: 'pointer',
                        color: 'var(--text-muted)',
                        fontSize: 'var(--text-xs)',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              placeholder="+ Add category"
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
              onKeyDown={handleCatKeyDown}
              onBlur={() => { addCategory(); setCatInputFocused(false); }}
              onFocus={() => setCatInputFocused(true)}
              style={{
                ...inputStyle,
                borderColor: catInputFocused ? 'var(--brand-violet)' : 'var(--border)',
              }}
            />
          </div>

          {submitError && (
            <p role="alert" style={{ color: 'var(--error)', fontSize: 'var(--text-sm)', margin: 0 }}>
              {submitError}
            </p>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              disabled={submitting}
              style={{
                padding: '0 16px',
                height: '30px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--brand-orange)',
                color: 'var(--brand-white)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.6 : 1,
                transition: 'opacity 150ms ease-out',
              }}
            >
              {submitting ? 'Saving…' : note ? 'Update note' : 'Save note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
