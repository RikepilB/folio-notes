# Folio — Complete Design System v2.0
**App:** Folio · **Tagline:** Your thoughts, structured
**Aesthetic:** Dark-first · Minimalist · Bold typography · Flat shapes
**Reference apps:** Journal (iOS), Apple Notes, Notion

---

## 1. Brand Identity

### Name & logo
"Folio" = document portfolio — notes as personal artifacts. 2 syllables, domain-clean.
Logo: stacked note-line bars + orange "+" creation circle. Violet/orange tension from brand tokens.

---

## 2. Color Tokens (CSS custom properties)

```css
:root {
  /* Brand core */
  --brand-black:        #020102;
  --brand-white:        #FFFBFF;
  --brand-violet:       #5F44C5;
  --brand-violet-light: #BB5BFF;
  --brand-violet-dark:  #3E1544;
  --brand-blue:         #3C3EE9;
  --brand-blue-dark:    #212390;
  --brand-orange:       #F8612D;   /* PRIMARY CTA */

  /* Neutrals */
  --text-primary:   #FFFBFF;       /* dark-mode override */
  --text-muted:     #7A7974;
  --border-soft:    #2A2830;       /* dark-mode override */

  /* Semantic states */
  --success:  #437A22;
  --error:    #A12C7B;
  --warning:  #B8651B;

  /* Dark mode surface scale */
  --surface:  #111010;   /* card backgrounds */
  --surf2:    #1A1820;   /* input backgrounds */
  --surf3:    #221F2C;   /* hover states */
  --border:   #2A2830;   /* default borders */
  --border2:  #3A3648;   /* hover borders */
}
```

### Color usage rules
| Color | Use | Never use for |
|-------|-----|---------------|
| `--brand-orange` | Primary CTA ("New Note", "Save", create actions) | Destructive actions |
| `--brand-violet` | Active nav, brand chrome, focus rings | Primary CTA |
| `--brand-violet-light` | Category pills, search highlights, accents | Body text |
| `--success` | Unarchive, restore, confirm | Generic info |
| `--error` | Delete, destructive confirmations | Warnings |
| `--warning` | Archive (reversible, not destructive) | Errors |

---

## 3. Typography Scale

```css
/* Font families */
--font-display: 'Lora', Georgia, serif;     /* headings, logo */
--font-body:    'DM Sans', system-ui, sans-serif;  /* UI text */
--font-mono:    'JetBrains Mono', monospace;       /* code */

/* Scale */
--text-xs:   10px;  /* timestamps, badge labels */
--text-sm:   11px;  /* metadata, card footers */
--text-base: 12px;  /* body text, buttons */
--text-md:   13px;  /* card titles, nav items */
--text-lg:   15px;  /* logo, page titles */
--text-xl:   16px;  /* section headers */
--text-2xl:  22px;  /* hero headings */

/* Weights: 400 (regular) and 500 (medium) only */
```

---

## 4. Spacing Scale

```css
--space-1:  4px;
--space-2:  8px;
--space-3:  12px;
--space-4:  14px;   /* card padding */
--space-5:  16px;
--space-6:  20px;
--space-8:  28px;
--space-10: 40px;
```

---

## 5. Component Tokens

### NoteCard
```css
.note-card {
  background:    var(--surface);          /* #111010 */
  border:        0.5px solid var(--border); /* #2A2830 */
  border-radius: 10px;
  padding:       14px;
  transition:    border-color 0.15s;
}
.note-card:hover { border-color: var(--border2); }  /* #3A3648 */
.note-card.archived { opacity: 0.65; }
```

### CategoryPill
```css
.category-pill {
  background:    var(--surf2);             /* #1A1820 */
  color:         var(--brand-violet-light);/* #BB5BFF */
  border:        0.5px solid var(--border2);
  border-radius: 4px;
  font-size:     var(--text-xs);
  padding:       2px 7px;
}
```

### FilterPill (active/inactive states)
```css
.filter-pill          { border: 0.5px solid var(--border); color: var(--text-muted); }
.filter-pill:hover    { border-color: var(--brand-violet); color: var(--text-primary); }
.filter-pill.active   { background: var(--brand-violet-dark); border-color: var(--brand-violet); color: var(--brand-violet-light); }
```

### Primary CTA Button
```css
.btn-primary {
  background:    var(--brand-orange);  /* #F8612D */
  color:         var(--brand-white);
  border:        none;
  border-radius: 8px;
  height:        30px;
  padding:       0 14px;
  font-size:     var(--text-base);
  font-weight:   500;
}
```

### Card action buttons (Edit / Archive / Delete)
```css
.act-btn            { border: 0.5px solid var(--border); color: var(--text-muted); }
.act-btn:hover      { color: var(--text-primary); border-color: var(--border2); }
.act-btn.archive:hover  { color: var(--warning); border-color: var(--warning); }
.act-btn.unarchive:hover { color: var(--success); border-color: var(--success); }
.act-btn.delete:hover   { color: var(--error); border-color: var(--error); }
```

### Sidebar nav item
```css
.nav-item           { color: var(--text-muted); border-left: 2px solid transparent; }
.nav-item:hover     { color: var(--text-primary); background: var(--surf2); }
.nav-item.active    { color: var(--brand-violet-light); background: #1A1220; border-left-color: var(--brand-violet-light); }
```

### Form inputs
```css
.form-input {
  background:    var(--surf2);
  border:        0.5px solid var(--border);
  border-radius: 8px;
  color:         var(--text-primary);
  font-size:     var(--text-base);
  padding:       8px 10px;
  outline:       none;
}
.form-input:focus { border-color: var(--brand-violet); }
```

---

## 6. Wireframes

### Screen 1 — Active Notes (/notes)
```
┌─ Sidebar (200px) ───┬─ Topbar (52px) ──────────────────────────────┐
│ [Logo] Folio        │ [Search: "Search notes..."] [Filter] [+ New]  │
│                     ├──────────────────────────────────────────────┤
│ Browse              │ [All] [Work] [Personal] [Ideas] [Finance]     │
│ ● My notes    12    │                                              │
│ Bookmarks      3    │  ┌──────────────┐ ┌──────────────┐ ┌──────┐ │
│ Archived       4    │  │ Q2 Roadmap   │ │ Book list    │ │ Idea │ │
│ Trash               │  │ Meeting...   │ │ Deep Work... │ │ ...  │ │
│                     │  │ [Work]       │ │ [Personal]   │ │ [Idea│ │
│ ──────              │  │ Apr 29       │ │ Apr 28       │ │ Apr 2│ │
│ [JD] John D.        │  │ Edit Archive │ │ Edit Archive │ │ Edit │ │
│     Pro plan        │  │ Delete       │ │ Delete       │ │ Del  │ │
└─────────────────────┴──┴──────────────┴─┴──────────────┴─┴──────┘
```

### Screen 2 — Archived Notes (/notes/archived)
```
Same layout. Cards show opacity 0.65. Action buttons show:
  [Edit] [Unarchive ←] [Delete]     (green hover on Unarchive)
Empty state: archive icon + "No archived notes yet."
```

### Screen 3 — New/Edit Note Modal
```
┌─ Dark overlay ──────────────────────────────────────────┐
│  ┌─ Modal (420px max-w) ──────────────────────────────┐ │
│  │  New note                                    [✕]   │ │
│  │  ─────────────────────────────────────────────    │ │
│  │  Title *                                           │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ Give your note a title...                   │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │  Content *                                         │ │
│  │  ┌─────────────────────────────────────────────┐  │ │
│  │  │ (textarea, 6 rows, resizable)               │  │ │
│  │  └─────────────────────────────────────────────┘  │ │
│  │  Categories                                        │ │
│  │  [Work ×]  [+ Add category ...]                    │ │
│  │  Visibility                                        │ │
│  │  [● Private]  [○ Public]                           │ │
│  │                        [Cancel]  [Save note ▶]    │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Screen 4 — Recently Deleted (/notes/deleted)
```
Recently deleted                            [Empty trash]
"Notes deleted within 30 days. Restore before expiry."

┌─ Deleted item row ─────────────────────────────────────────────┐
│ Draft blog post — TypeScript tips   Apr 27 · expires May 27   │
│                                      [Restore] [Delete forever]│
└────────────────────────────────────────────────────────────────┘
```

### Screen 5 — Search Results
```
[  Search: "typescript"  ×  ]          3 results in title and content

┌─ Result ────────────────────────────────────────────────────┐
│ Q2 product roadmap notes                          Work · Apr │
│ ...backend NestJS. Need to sync with [typescript] strict... │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Component List (React)

| Component | File | Props | Responsibility |
|-----------|------|-------|----------------|
| `App` | `App.tsx` | — | Root: route state, renders layout |
| `Sidebar` | `components/Sidebar.tsx` | `activeRoute, user` | Nav links, user avatar |
| `TopBar` | `components/TopBar.tsx` | `onSearch, onNewNote` | Search input, CTA button |
| `TabBar` | `components/TabBar.tsx` | `active, onChange` | Active/Archived tab switch |
| `CategoryFilter` | `components/CategoryFilter.tsx` | `categories, active, onChange` | Horizontal pill row |
| `NoteList` | `components/NoteList.tsx` | `notes, loading, error, handlers` | Grid + empty state |
| `NoteCard` | `components/NoteCard.tsx` | `note, onEdit, onDelete, onToggleArchive` | Single note card |
| `NoteForm` | `components/NoteForm.tsx` | `note?, onClose, onSave` | Create/edit modal |
| `DeleteConfirm` | `components/DeleteConfirm.tsx` | `note, onConfirm, onCancel` | Soft-delete confirmation |
| `RecentlyDeleted` | `components/RecentlyDeleted.tsx` | `deletedNotes, onRestore, onPermanentDelete` | Trash view |
| `SearchResults` | `components/SearchResults.tsx` | `query, results, loading` | Highlighted results list |

---

## 8. Responsive Behavior

| Breakpoint | Width | Sidebar | Cards |
|------------|-------|---------|-------|
| Mobile | < 768px | Bottom tab bar (icon-only) | 1 column |
| Tablet | 768–1024px | Icon-only collapsed (56px) | 2 columns |
| Desktop | 1024px+ | Full 200px with labels | 3 columns |

---

## 9. Accessibility Checklist

- All buttons: `aria-label` describing action + target note title
- Modal: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap, Escape closes
- Tab bar: `role="tablist"`, `role="tab"`, `aria-selected`
- Filter pills: `aria-pressed` for toggle state
- Card action group: `role="group"` with `aria-label`
- Search: `role="search"`, results count announced via `aria-live="polite"`
- Empty states: descriptive text, not just an icon
- Form: `<label htmlFor>` for every input, `aria-required` on required fields
- Color: action type communicated via text label, never color alone

