import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from '../notes/note.entity';
import { Category } from '../categories/category.entity';

interface SeedCategory { name: string }
interface SeedNote { title: string; content: string; categoryNames: string[] }

const SEED_CATEGORIES: SeedCategory[] = [
  { name: 'Product' },
  { name: 'Design' },
  { name: 'Engineering' },
  { name: 'Marketing' },
];

const SEED_NOTES: SeedNote[] = [
  {
    title: 'Design System v2 — Color Palette',
    content:
      'The new palette uses warm amber as the primary brand color (#F8612D) paired with a deep violet for interactive elements. Neutral backgrounds range from near-black (#0F0E10) to subtle surface tones. Typography defaults to Lora for display text and DM Sans for body copy. Each semantic color maps to a CSS variable so updates cascade automatically across all components.',
    categoryNames: ['Design', 'Product'],
  },
  {
    title: 'Q2 OKRs — Notes for the Planning Session',
    content:
      'Objective 1: Launch Folio to 500 beta users by end of Q2. Key results: KR1 — set up landing page with waitlist form; KR2 — ship core CRUD flow with categories; KR3 — integrate Clerk for auth; KR4 — deploy to Azure with proper monitoring. Objective 2: Establish a repeatable design system that scales. KR1 — document all token layers; KR2 — build component library in Figma; KR3 — ensure WCAG AA compliance across all views.',
    categoryNames: ['Product'],
  },
  {
    title: 'API Architecture — Three-Tier Pattern',
    content:
      'The backend follows a strict three-tier separation: Controllers handle HTTP only (parsing, status codes, validation pipe), Services contain all business logic and NestJS exceptions, and Repositories interact with TypeORM exclusively. No service should import HttpException; no repository should throw any exception. This makes testing and swapping the database layer straightforward.',
    categoryNames: ['Engineering'],
  },
  {
    title: 'Typography Scale Reference',
    content:
      'Font sizes follow a modular scale: xs=12px, sm=14px, base=16px, md=18px, lg=20px, xl=24px, 2xl=28px, 3xl=36px, 4xl=48px. Line heights are proportional — tight (1.2) for display headings, relaxed (1.6) for body paragraphs. Letter spacing is tighten on large headings and normal on body text.',
    categoryNames: ['Design'],
  },
  {
    title: 'Feature Flags with Unleash — Setup Guide',
    content:
      'We use Unleash for gradual feature rollouts. Self-host on Azure Container Apps. Clients connect via the Node SDK with a client API key. New features gate behind flag names: feature.folio-search-v2, feature.folio-share-link, etc. All flags default to false until explicitly enabled per environment.',
    categoryNames: ['Engineering', 'Product'],
  },
  {
    title: 'Brand Voice and Tone — Content Guidelines',
    content:
      'Folio speaks in a calm, confident voice. We are direct but never terse; informative but never clinical. We write short sentences with strong verbs. Active voice throughout. We avoid corporate buzzwords, filler phrases, and excessive caveats. Our tone is warm — like a thoughtful colleague who respects your time.',
    categoryNames: ['Marketing'],
  },
  {
    title: 'Accessibility Audit Checklist',
    content:
      'Before shipping any view: (1) All interactive elements reachable by Tab key. (2) Focus indicators use brand orange ring. (3) All images have descriptive alt text. (4) Color contrast ratio >= 4.5:1 for normal text. (5) Form errors announced with aria-live. (6) Modal traps focus and restores on close. (7) Reduced-motion media query respected for all animations.',
    categoryNames: ['Design', 'Engineering'],
  },
  {
    title: 'Competitor Analysis — Bear, Notion, Craft',
    content:
      'Bear: excellent markdown, poor categorization. Notion: flexible but heavy, slow on large bases. Craft: beautiful but Mac-only and no collaboration. Our gap: fast, category-first navigation with elegant UI and a clean API. Differentiation vectors: (1) real-time category filtering, (2) built-in archive/trash workflow with 30-day expiry, (3) first-class design system from day one.',
    categoryNames: ['Product', 'Marketing'],
  },
  {
    title: 'Database Migration Plan — Phase 1 to Phase 2',
    content:
      'Phase 1 schema: notes + categories with ManyToMany join. Phase 2 adds: users (Clerk integration), is_public flag, share_tokens for public links, note_reactions, and audit_log table. Migration strategy: add nullable columns first, backfill, then add constraints. Use TypeORM migrations with explicit up() and down() functions. Never use synchronize in production.',
    categoryNames: ['Engineering'],
  },
  {
    title: 'Folio Roadmap — H1 2026',
    content:
      'H1 is split into three phases. Phase 1 (now): core CRUD, categories, search, archive, trash. Phase 2 (April): Clerk auth, multi-user isolation, share links, pagination. Phase 3 (May): real-time collaboration, note reactions, export to PDF. The UI roadmap runs in parallel: mobile-responsive layout, keyboard shortcuts, offline support via Service Worker.',
    categoryNames: ['Product', 'Marketing'],
  },
  {
    title: 'Animation Principles for the UI',
    content:
      'Every transition uses 150ms ease-out. Entrances: fade + translate-y from 4px below. Exits: fade + translate-y to 4px below. Loading states: skeleton pulse at 1.5s ease-in-out. No animation plays when prefers-reduced-motion is active. Stagger list items by 50ms. Modals scale from 0.96 to 1.0 on open.',
    categoryNames: ['Design'],
  },
  {
    title: 'Post-Launch Monitoring Strategy',
    content:
      'Instrument with Azure Application Insights. Track: page view count per route, note creation rate, archive/delete rates, API response time percentiles (p50, p95, p99), frontend error rate. Set alert thresholds: p95 response > 800ms triggers PagerDuty; >5% error rate triggers Slack alert.',
    categoryNames: ['Engineering', 'Marketing'],
  },
];

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Note) private readonly noteRepo: Repository<Note>,
    @InjectRepository(Category) private readonly catRepo: Repository<Category>,
  ) {}

  async seed(): Promise<void> {
    const count = await this.noteRepo.count();
    if (count > 0) {
      console.info('\n  Database already has notes. Skipping seed.\n');
      return;
    }

    const categoryMap = new Map<string, Category>();

    for (const sc of SEED_CATEGORIES) {
      const cat = this.catRepo.create({ name: sc.name });
      const saved = await this.catRepo.save(cat);
      categoryMap.set(sc.name, saved);
    }

    for (const sn of SEED_NOTES) {
      const categories = sn.categoryNames
        .map((name) => categoryMap.get(name))
        .filter((c): c is Category => c !== undefined);

      const note = this.noteRepo.create({
        title: sn.title,
        content: sn.content,
        categories,
      });
      await this.noteRepo.save(note);
    }

    console.info(`\n  Seeded ${SEED_NOTES.length} notes and ${SEED_CATEGORIES.length} categories.\n`);
  }
}