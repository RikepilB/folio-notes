import React from 'react';

interface TopBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onNewNote: () => void;
}

export function TopBar({
  search,
  onSearchChange,
  onNewNote,
}: TopBarProps): React.ReactElement {
  return (
    <header className="flex items-center gap-4 px-6 py-3 border-b border-[var(--border)] bg-[var(--surf2)]">
      <input
        type="text"
        placeholder="Search notes…"
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        className="flex-1 max-w-sm rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-violet)]"
      />
      <button
        onClick={onNewNote}
        className="px-4 py-2 rounded bg-[var(--brand-orange)] text-white text-sm font-medium hover:opacity-90"
      >
        + New Note
      </button>
    </header>
  );
}
