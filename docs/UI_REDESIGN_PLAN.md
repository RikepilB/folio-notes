# UI/UX Redesign Action Plan

## Current State Analysis

### Design Tokens (from `tailwind.config.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `brand-orange` | `#F8612D` | Primary accent |
| `brand-violet` | `#5F44C5` | Secondary accent |
| `brand-violet-light` | `#BB5BFF` | Highlights |
| `brand-violet-dark` | `#3E1544` | Dark accent |
| `brand-black` | `#020102` | Primary text |
| `surface` | `#111010` | Card background |
| `surf2` | `#1A1820` | Secondary surface |
| `text-muted` | `#7A7974` | Muted text |
| `border` | `#2A2830` | Default borders |
| `border2` | `#3A3648` | Hover borders |

### Component Inventory

| Component | File | Status |
|-----------|------|--------|
| `App.tsx` | Main container | Dark theme |
| `Sidebar.tsx` | Navigation | In-line styles |
| `TopBar.tsx` | Header | In-line styles |
| `NoteCard.tsx` | Note display | Hover actions |
| `NoteList.tsx` | Grid list | - |
| `NoteForm.tsx` | Create/edit | - |
| `CategoryFilter.tsx` | Filter UI | - |
| `DeleteConfirm.tsx` | Modal | - |
| `RecentlyDeleted.tsx` | Trash view | - |

---

## Design Issues Identified

### 1. No Design System Document
- Missing `docs/DESIGN.md` with tokens
- No component token references

### 2. Inconsistent Styling
- Mix of Tailwind config + inline styles
- No CSS variables for design tokens
- Hardcoded values in components

### 3. Accessibility Gaps
- Some components lack ARIA labels
- Focus states not visible
- No keyboard navigation indicators

### 4. Visual Improvements Needed
- Typography hierarchy unclear
- Spacing inconsistent
- No animations/transitions

---

## Redesign Scope

### Phase 1: Foundation (Design Tokens)

1. **Create `docs/DESIGN.md`**
   - Document all color tokens
   - Define typography scale
   - Set spacing system
   - Document component tokens

2. **Migrate to CSS Variables**
   - Replace hardcoded values
   - Create `:root` variables
   - Update Tailwind config

### Phase 2: Component Updates

1. **NoteCard** - Improve hover states, add animations
2. **NoteList** - Responsive grid improvements
3. **NoteForm** - Better UX, validation feedback
4. **Sidebar/TopBar** - Consistent styling

### Phase 3: Polish

1. **Transitions** - Smooth state changes
2. **Loading States** - Skeleton/spinner
3. **Empty States** - Friendly illustrations
4. **Error States** - Clear messaging

---

## Action Plan

### Step 1: Create Design Documentation
```
[ ] Create docs/DESIGN.md
[ ] Document all tokens
[ ] Define typography scale
[ ] Set spacing system
```

### Step 2: Migrate to CSS Variables
```
[ ] Create frontend/src/styles/variables.css
[ ] Add :root design tokens
[ ] Update components to use CSS vars
[ ] Verify Tailwind integration
```

### Phase 3: Component Refinements
```
[ ] Update NoteCard with animations
[ ] Improve NoteList responsiveness
[ ] Enhance NoteForm UX
[ ] Fix accessibility issues
```

### Phase 4: Polish
```
[ ] Add transitions
[ ] Create loading states
[ ] Design empty states
[ ] Error handling UI
```

---

## Skills Required

### Design Skills Available (20 total)
| Skill | Use |
|-------|-----|
| **frontend-design** | Creative UI direction |
| **tailwind-design-system** | Tailwind patterns |
| **web-design-guidelines** | A11y compliance |
| **vercel-react-best-practices** | Performance |
| **systematic-debugging** | Issue resolution |

### Workflow
1. Start with `/brainstorming` for requirements
2. Use `/frontend-design` for creative direction
3. Apply `/tailwind-design-system` for implementation
4. Verify with `/web-design-guidelines`

---

## Timeline Estimate

| Phase | Duration | Focus |
|-------|----------|-------|
| Foundation | 30 min | Design tokens |
| Components | 1-2 hours | UI updates |
| Polish | 30 min | Finishing touches |

---

## Questions Before Starting

1. **Design Direction?** - Keep current dark theme or explore new aesthetic?
2. **Priority?** - Focus on design polish or add new features?
3. **Scope?** - Incremental or full redesign?

Let me know your preferences and I'll proceed.