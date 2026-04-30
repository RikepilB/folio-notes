import React from 'react';
import type { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryFilter({
  categories,
  activeCategory,
  onSelect,
}: CategoryFilterProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        aria-pressed={activeCategory === null}
        onClick={() => onSelect(null)}
        className={`rounded-full text-sm px-3 py-1 border transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] ${
          activeCategory === null
            ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)] text-white'
            : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-orange)]'
        }`}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          aria-pressed={activeCategory === cat.id}
          onClick={() => onSelect(cat.id)}
          className={`rounded-full text-sm px-3 py-1 border transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] ${
            activeCategory === cat.id
              ? 'bg-[var(--brand-orange)] border-[var(--brand-orange)] text-white'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--brand-orange)]'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
