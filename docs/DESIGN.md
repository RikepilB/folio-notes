# Folio Design System

## Overview

Folio uses a dark theme with violet/orange accents. CSS variables define all design tokens for consistency and easy theming.

---

## Color Tokens

### Brand Colors

| Token | Value | Usage |
|------|-------|-------|
| `--brand-black` | `#020102` | Primary background |
| `--brand-white` | `#FFFBFF` | Text on dark |
| `--brand-violet` | `#5F44C5` | Primary accent |
| `--brand-violet-light` | `#BB5BFF` | Highlights, links |
| `--brand-violet-dark` | `#3E1544` | Dark accent |
| `--brand-blue` | `#3C3EE9` | Secondary accent |
| `--brand-orange` | `#F8612D` | CTAs, alerts |

### Neutral Scale

| Token | Value | Usage |
|------|-------|-------|
| `--text-primary` | `#FFFBFF` | Primary text |
| `--text-muted` | `#7A7974` | Secondary text |
| `--border-soft` | `#2A2830` | Subtle borders |

### Surface Scale

| Token | Value | Usage |
|------|-------|-------|
| `--surface` | `#111010` | Card background |
| `--surf2` | `#1A1820` | Elevated surfaces |
| `--surf3` | `#221F2C` | Modals, dropdowns |
| `--border` | `#2A2830` | Default borders |
| `--border2` | `#3A3648` | Hover borders |

### Semantic States

| Token | Value | Usage |
|------|-------|-------|
| `--success` | `#437A22` | Success states |
| `--error` | `#A12C7B` | Error states |
| `--warning` | `#B8651B` | Warning states |

---

## Typography

### Font Families

| Token | Value | Usage |
|------|-------|-------|
| `--font-display` | `Lora, Georgia, serif` | Headings, titles |
| `--font-body` | `DM Sans, system-ui, sans-serif` | Body text |
| `--font-mono` | `JetBrains Mono, monospace` | Code, timestamps |

### Type Scale

| Token | Value | Usage |
|------|-------|-------|
| `--text-xs` | `10px` | Timestamps |
| `--text-sm` | `11px` | Labels |
| `--text-base` | `12px` | Body small |
| `--text-md` | `13px` | Body default |
| `--text-lg` | `15px` | Subtitles |
| `--text-xl` | `16px` | Titles |
| `--text-2xl` | `22px` | Hero titles |

---

## Spacing

| Token | Value | Usage |
|------|-------|-------|
| `--space-1` | `4px` | Tight spacing |
| `--space-2` | `8px` | Default spacing |
| `--space-3` | `12px` | Section spacing |
| `--space-4` | `14px` | Card padding |
| `--space-5` | `16px` | Component gaps |
| `--space-6` | `20px` | Section gaps |
| `--space-8` | `28px` | Large gaps |
| `--space-10` | `40px` | Page margins |

---

## Components

### NoteCard

- Background: `var(--surface)`
- Border: `0.5px solid var(--border)` → `var(--border2)` on hover
- Border radius: `10px`
- Padding: `14px`
- Hover transitions: `150ms ease-out`

### Category Pills

- Background: `var(--surf2)`
- Color: `var(--brand-violet-light)`
- Border: `0.5px solid var(--border2)`
- Border radius: `4px`
- Padding: `2px 7px`
- Font size: `var(--text-xs)` (10px)

### Buttons

- Background: `transparent`
- Border: `0.5px solid var(--border)`
- Border radius: `6px`
- Padding: `2px 8px`
- Font size: `var(--text-xs)` (10px)
- Transitions: `150ms ease-out`

---

## Animations

### Transitions

| Property | Duration | Easing |
|----------|----------|--------|
| Default | `150ms` | `ease-out` |
| Smooth | `300ms` | `ease-in-out` |

### Keyframes

```css
@keyframes skeleton-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
```

---

## Implementation

Reference these tokens in components:

```tsx
// ✅ CORRECT - Use CSS variables
style={{
  background: 'var(--surface)',
  border: '0.5px solid var(--border)',
  color: 'var(--text-primary)',
}}

// ❌ WRONG - Hardcoded values
style={{
  background: '#111010',
  border: '#2A2830',
}}
```

---

## Tailwind Usage

Tokens are available as Tailwind utilities via `tailwind.config.ts`:

```tsx
// Colors
bg-surface
bg-brand-violet
text-text-muted
border-border2

// Spacing
p-4 (14px)
gap-2 (8px)
```