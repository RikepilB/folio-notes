import React from 'react';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function TopBar({ searchQuery, onSearchChange }: TopBarProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
      <span className="text-lg font-semibold text-white">Folio</span>
      <input
        type="search"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="rounded border border-[var(--border)] bg-[var(--surf2)] px-3 py-1.5 text-sm text-white placeholder-[var(--text-muted)] focus:border-[var(--brand-orange)] focus:outline-none transition-colors duration-150 ease-out"
      />
    </div>
  );
}
