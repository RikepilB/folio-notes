import React, { useState } from 'react';
import type { SortField, SortOrder } from '../hooks/useNotes';

interface TopBarProps {
  onSearch: (query: string) => void;
  onNewNote: () => void;
  sortOrder: SortOrder;
  onSortChange: (field: SortField, order: SortOrder) => void;
}

function SearchIcon(): React.ReactElement {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{ flexShrink: 0, color: 'var(--text-muted)' }}
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function TopBar({ onSearch, onNewNote, sortOrder, onSortChange }: TopBarProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
    onSearch(e.target.value);
  };

  const handleSortToggle = (): void => {
    if (sortOrder === 'DESC') {
      onSortChange('createdAt', 'ASC');
    } else {
      onSortChange('createdAt', 'DESC');
    }
  };

  return (
    <header
      style={{
        height: '52px',
        flexShrink: 0,
        background: 'var(--surf2)',
        borderBottom: '0.5px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontWeight: 500,
          color: 'var(--text-primary)',
          flexShrink: 0,
        }}
      >
        Folio
      </span>

      <div
        role="search"
        style={{
          flex: 1,
          maxWidth: '320px',
          margin: '0 auto',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '10px',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <SearchIcon />
        </span>

        <input
          type="search"
          placeholder="Search notes…"
          value={query}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-label="Search notes"
          style={{
            width: '100%',
            height: '30px',
            background: 'var(--surf3)',
            border: focused ? '0.5px solid var(--brand-violet)' : '0.5px solid transparent',
            borderRadius: '6px',
            paddingLeft: '30px',
            paddingRight: '10px',
            color: 'var(--text-primary)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-body)',
            outline: 'none',
            transition: 'border-color 150ms ease-out',
          }}
        />
      </div>

      <button
        onClick={handleSortToggle}
        title={sortOrder === 'DESC' ? 'Newest first' : 'Oldest first'}
        style={{
          height: '30px',
          padding: '0 10px',
          borderRadius: '6px',
          border: sortOrder === 'DESC' ? '0.5px solid var(--brand-violet)' : '0.5px solid var(--border2)',
          background: sortOrder === 'DESC' ? 'rgba(95,68,197,0.18)' : 'transparent',
          color: 'var(--text-primary)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          cursor: 'pointer',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          transition: 'all 150ms ease-out',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--brand-violet)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = sortOrder === 'DESC' ? 'var(--brand-violet)' : 'var(--border2)'; }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sortOrder === 'DESC' ? (
            <path d="M12 5v14M19 12l-7 7-7-7" />
          ) : (
            <path d="M12 19V5M5 12l7-7 7 7" />
          )}
        </svg>
        {sortOrder === 'DESC' ? 'Newest' : 'Oldest'}
      </button>

      <button
        onClick={onNewNote}
        style={{
          height: '30px',
          padding: '0 14px',
          borderRadius: '8px',
          border: 'none',
          background: 'var(--brand-orange)',
          color: 'var(--brand-white)',
          fontSize: 'var(--text-sm)',
          fontFamily: 'var(--font-body)',
          fontWeight: 500,
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'opacity 150ms ease-out',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        + New note
      </button>
    </header>
  );
}
