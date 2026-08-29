/**
 * Org store — the local persistence layer for beta.
 *
 * ARCHITECTURE
 * ============
 * We have TWO stores that must stay coherent:
 *
 *   1. Clerk (source of truth for IDENTITY):
 *      users, organizations (name/slug/members/roles/invitations).
 *      Accessed via `useOrganization()`, `useOrganizationList()`, `useUser()`.
 *
 *   2. This file (source of truth for BEE-ARCHETYPES METADATA):
 *      buyerPersona, industry, sizeRange, currentChallenge.
 *      In localStorage keyed by the Clerk org.id (see `saveOrgMetadata`).
 *
 * WHY THE SPLIT: Clerk's client SDK rejects `organization.update({ publicMetadata: {...} })`
 * with HTTP 403. Server-side write via `POST /v1/organizations/{id}` with a Bearer secret
 * is available but requires a backend, which we don't have yet. Deferred to Wave 7.
 *
 * FALLBACK MODE (no Clerk): the entire Org type below is stored in localStorage under
 * `bee-archetypes:orgs` keyed by slug. Used when `VITE_CLERK_PUBLISHABLE_KEY` is unset.
 * Preview / demo mode only — not for production.
 *
 * MIGRATION PATH TO WAVE 7 (server-side SQLite):
 *   - Add a Fly SQLite volume + minimal API
 *   - On first Clerk sign-in, backfill OrgMetadata: localStorage → API → SQLite
 *   - Deprecate the `saveOrgMetadata`/`getOrgMetadata` localStorage backing but
 *     keep the exports as thin wrappers around API calls (same signature).
 *
 * CONTRACT SHAPE MATCHES A FUTURE SQL SCHEMA
 * ==========================================
 *   CREATE TABLE org_metadata (
 *     org_id TEXT PRIMARY KEY,     -- Clerk org.id
 *     buyer_persona TEXT NOT NULL,
 *     industry TEXT,
 *     size_range TEXT NOT NULL,
 *     current_challenge TEXT,
 *     created_at INTEGER NOT NULL,
 *     updated_at INTEGER NOT NULL
 *   );
 *
 * Do not change the OrgMetadata field names without also planning the SQL migration.
 */

import type { BuyerPersonaId } from './buyerPersonas';

export interface OrgInvite {
  email: string;
  role?: string;
  invitedAt: number;
  completedAt?: number;
  archetypeId?: string;
}

export interface Org {
  slug: string;
  name: string;
  buyerPersona: BuyerPersonaId;
  industry: string;
  sizeRange: SizeRange;
  currentChallenge: ChallengeTag | null;
  ownerEmail: string;
  createdAt: number;
  invites: OrgInvite[];
}

export type SizeRange =
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-2000'
  | '2001+';

export type ChallengeTag =
  | 'growth-phase'
  | 'transformation'
  | 'mna-integration'
  | 'workforce-redesign'
  | 'ai-adoption'
  | 'other';

export const SIZE_RANGES: readonly { value: SizeRange; label: string }[] = [
  { value: '1-10', label: '1–10 (early stage)' },
  { value: '11-50', label: '11–50 (small)' },
  { value: '51-200', label: '51–200 (mid-market)' },
  { value: '201-500', label: '201–500 (upper mid-market)' },
  { value: '501-2000', label: '501–2000 (enterprise)' },
  { value: '2001+', label: '2001+ (large enterprise)' },
];

export const CHALLENGES: readonly { value: ChallengeTag; label: string }[] = [
  { value: 'growth-phase', label: 'Growth phase — scaling the org' },
  { value: 'transformation', label: 'Transformation — cultural / operational change' },
  { value: 'mna-integration', label: 'M&A integration — merging teams and cultures' },
  { value: 'workforce-redesign', label: 'Workforce redesign — reshaping teams' },
  { value: 'ai-adoption', label: 'AI adoption — figuring out how humans and agents pair' },
  { value: 'other', label: 'Something else' },
];

const STORAGE_KEY = 'bee-archetypes:orgs';

function loadAll(): Record<string, Org> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(orgs: Record<string, Org>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs));
  } catch {
    /* ignore */
  }
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export function createOrg(input: {
  name: string;
  buyerPersona: BuyerPersonaId;
  industry: string;
  sizeRange: SizeRange;
  currentChallenge: ChallengeTag | null;
  ownerEmail: string;
}): Org {
  const orgs = loadAll();
  let slug = slugify(input.name);
  // Uniquify slug if collision
  let n = 0;
  const baseSlug = slug;
  while (orgs[slug]) {
    n++;
    slug = `${baseSlug}-${n}`;
  }
  const org: Org = {
    slug,
    name: input.name,
    buyerPersona: input.buyerPersona,
    industry: input.industry,
    sizeRange: input.sizeRange,
    currentChallenge: input.currentChallenge,
    ownerEmail: input.ownerEmail,
    createdAt: Date.now(),
    invites: [],
  };
  orgs[slug] = org;
  saveAll(orgs);
  return org;
}

export function getOrg(slug: string): Org | null {
  const orgs = loadAll();
  return orgs[slug] ?? null;
}

export function listOrgs(): Org[] {
  const orgs = loadAll();
  return Object.values(orgs).sort((a, b) => b.createdAt - a.createdAt);
}

export function inviteMembers(slug: string, emails: string[]): Org {
  const orgs = loadAll();
  const org = orgs[slug];
  if (!org) throw new Error(`Unknown org slug: ${slug}`);
  const now = Date.now();
  const existing = new Set(org.invites.map((i) => i.email.toLowerCase()));
  for (const raw of emails) {
    const email = raw.trim().toLowerCase();
    if (!email || existing.has(email) || !email.includes('@')) continue;
    org.invites.push({ email, invitedAt: now });
    existing.add(email);
  }
  saveAll(orgs);
  return org;
}

/* ── Clerk-org companion metadata ─────────────────────────────────────────
 * Clerk stores name/slug/members/roles. Our app's extra org context
 * (buyer persona, industry, size, current challenge) can't be written to
 * Clerk publicMetadata from the client, so we keep it in localStorage keyed
 * by the Clerk org.id. In production this migrates to a Fly SQLite row.
 * ──────────────────────────────────────────────────────────────────────── */

export interface OrgMetadata {
  buyerPersona: BuyerPersonaId;
  industry: string;
  sizeRange: SizeRange;
  currentChallenge: ChallengeTag | null;
}

const META_STORAGE_PREFIX = 'bee-archetypes:org-meta:';

export function saveOrgMetadata(orgId: string, meta: OrgMetadata): void {
  try {
    localStorage.setItem(META_STORAGE_PREFIX + orgId, JSON.stringify(meta));
  } catch {
    /* localStorage disabled — ignore, dashboards fall back to defaults */
  }
}

export function getOrgMetadata(orgId: string): OrgMetadata | null {
  try {
    const raw = localStorage.getItem(META_STORAGE_PREFIX + orgId);
    return raw ? (JSON.parse(raw) as OrgMetadata) : null;
  } catch {
    return null;
  }
}
