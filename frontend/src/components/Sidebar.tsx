import React from 'react';

export type ViewMode = 'notes' | 'archived' | 'trash';

interface SidebarProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

const NAV_ITEMS: { label: string; view: ViewMode }[] = [
  { label: 'Notes', view: 'notes' },
  { label: 'Archived', view: 'archived' },
  { label: 'Trash', view: 'trash' },
];

export function Sidebar({
  currentView,
  onViewChange,
}: SidebarProps): React.ReactElement {
  return (
    <aside className="w-48 shrink-0 border-r border-[var(--border)] h-full flex flex-col p-4 gap-1">
      <span className="text-lg font-bold text-white mb-4">Folio</span>
      {NAV_ITEMS.map(item => (
        <button
          key={item.view}
          onClick={() => onViewChange(item.view)}
          className={`text-left px-3 py-2 rounded text-sm transition-colors ${
            currentView === item.view
              ? 'bg-[var(--brand-violet)] text-white'
              : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--border)]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </aside>
  );
}
