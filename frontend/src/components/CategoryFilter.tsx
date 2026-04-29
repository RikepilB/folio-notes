import React from 'react';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}

export function CategoryFilter({
  categories,
  selectedId,
  onSelect,
}: CategoryFilterProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(undefined)}
        className={`text-sm px-3 py-1 rounded-full border transition-colors ${
          selectedId === undefined
            ? 'bg-[var(--brand-violet)] border-[var(--brand-violet)] text-white'
            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-violet)]'
        }`}
      >
        All
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={`text-sm px-3 py-1 rounded-full border transition-colors ${
            selectedId === cat.id
              ? 'bg-[var(--brand-violet)] border-[var(--brand-violet)] text-white'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-violet)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
