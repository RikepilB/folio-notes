import React from 'react';

type ActiveView = 'active' | 'archived' | 'deleted';

interface SidebarProps {
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
  notesCount: number;
  archivedCount: number;
  deletedCount: number;
}

interface NavItem {
  view: ActiveView;
  label: string;
  count: number;
}

export function Sidebar({
  activeView,
  onViewChange,
  notesCount,
  archivedCount,
  deletedCount,
}: SidebarProps): React.ReactElement {
  const navItems: NavItem[] = [
    { view: 'active', label: 'Notes', count: notesCount },
    { view: 'archived', label: 'Archived', count: archivedCount },
    { view: 'deleted', label: 'Recently Deleted', count: deletedCount },
  ];

  return (
    <aside className="w-48 shrink-0 border-r border-[var(--border)] flex flex-col gap-1 p-4">
      <span className="text-lg font-semibold text-white mb-4">Folio</span>
      {navItems.map((item) => {
        const isActive = activeView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`flex items-center text-left text-sm py-2 rounded capitalize transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)] ${
              isActive
                ? 'text-[var(--brand-orange)] border-l-2 border-[var(--brand-orange)] pl-[10px] pr-3'
                : 'text-[var(--text-muted)] hover:text-white hover:bg-[var(--surf2)] px-3'
            }`}
          >
            <span className="truncate">{item.label}</span>
            {item.count > 0 && (
              <span className="ml-auto text-xs bg-[var(--border)] text-[var(--text-muted)] rounded-full px-1.5 py-0.5 shrink-0">
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </aside>
  );
}
