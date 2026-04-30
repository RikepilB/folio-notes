import React from 'react';

type ActiveRoute = 'notes' | 'archived' | 'deleted';

interface SidebarCounts {
  notes: number;
  archived: number;
}

interface SidebarProps {
  activeRoute: ActiveRoute;
  counts: SidebarCounts;
  onNavigate: (route: ActiveRoute) => void;
}

interface NavItem {
  route: ActiveRoute;
  label: string;
  count?: number;
}

const NAV_ITEMS: NavItem[] = [
  { route: 'notes', label: 'My Notes' },
  { route: 'archived', label: 'Archived' },
  { route: 'deleted', label: 'Trash' },
];

export function Sidebar({ activeRoute, counts, onNavigate }: SidebarProps): React.ReactElement {
  const getCount = (route: ActiveRoute): number | undefined => {
    if (route === 'notes') return counts.notes;
    if (route === 'archived') return counts.archived;
    return undefined;
  };

  return (
    <aside
      style={{
        width: '200px',
        flexShrink: 0,
        background: 'var(--surf2)',
        borderRight: '0.5px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          padding: '16px 14px 12px',
        }}
      >
        Folio
      </div>

      <div
        style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          padding: '0 14px 6px',
        }}
      >
        Browse
      </div>

      <nav role="navigation" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = activeRoute === item.route;
          const count = getCount(item.route);
          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                padding: isActive ? '8px 12px 8px 12px' : '8px 14px',
                border: 'none',
                borderLeft: isActive ? '2px solid var(--brand-violet-light)' : '2px solid transparent',
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                color: isActive ? 'var(--brand-violet-light)' : 'var(--text-muted)',
                fontSize: 'var(--text-sm)',
                fontFamily: 'var(--font-body)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'background 150ms ease-out, color 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--surf2)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              <span style={{ flex: 1 }}>{item.label}</span>

              {count !== undefined && count > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--surf3)',
                    color: 'var(--text-muted)',
                    fontSize: 'var(--text-xs)',
                    borderRadius: '4px',
                    padding: '1px 5px',
                    flexShrink: 0,
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
