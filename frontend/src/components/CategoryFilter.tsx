import React from 'react';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  activeId?: string;
  onChange: (id: string | undefined) => void;
}

export function CategoryFilter({ categories, activeId, onChange }: CategoryFilterProps): React.ReactElement {
  const pillBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: '20px',
    border: '0.5px solid var(--border)',
    background: 'transparent',
    color: 'var(--text-muted)',
    fontSize: 'var(--text-xs)',
    fontFamily: 'var(--font-body)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'color 150ms ease-out, border-color 150ms ease-out, background 150ms ease-out',
  };

  const pillActive: React.CSSProperties = {
    background: 'var(--brand-violet-dark)',
    borderColor: 'var(--brand-violet)',
    color: 'var(--brand-violet-light)',
  };

  const allActive = activeId === undefined;

  return (
    <div
      role="group"
      aria-label="Filter by category"
      style={{
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        gap: '6px',
        scrollbarWidth: 'none',
      }}
    >
      <button
        aria-pressed={allActive}
        onClick={() => onChange(undefined)}
        style={allActive ? { ...pillBase, ...pillActive } : pillBase}
        onMouseEnter={(e) => {
          if (!allActive) {
            e.currentTarget.style.borderColor = 'var(--brand-violet)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!allActive) {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }
        }}
      >
        All
      </button>

      {categories.map((cat) => {
        const isActive = activeId === cat.id;
        return (
          <button
            key={cat.id}
            aria-pressed={isActive}
            onClick={() => onChange(cat.id)}
            style={isActive ? { ...pillBase, ...pillActive } : pillBase}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--brand-violet)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
}
