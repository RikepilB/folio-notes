import React, { useState } from 'react';

interface TopBarProps {
  onSearch: (query: string) => void;
  onNewNote: () => void;
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

export function TopBar({ onSearch, onNewNote }: TopBarProps): React.ReactElement {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setQuery(e.target.value);
    onSearch(e.target.value);
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
