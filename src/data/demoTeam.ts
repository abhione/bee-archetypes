/**
 * Seeded demo team — synthetic members with pre-assessed archetypes.
 *
 * Used when a buyer first lands on the dashboard: they see what the product
 * WILL show once their team completes assessments. Names/roles are fictional
 * but realistic across a 12-person mid-market operating team.
 *
 * Distribution is deliberately UNEVEN (no Sentinel, weak Guard system) so
 * the "Missing Archetype Alert" panel actually surfaces something.
 */

import type { ArchetypeId, SystemId } from './archetypes';
import { ARCHETYPES } from './archetypes';

export interface DemoMember {
  id: string;
  name: string;
  title: string;
  archetype: ArchetypeId;
  secondaries: [ArchetypeId, ArchetypeId];
  shadow: ArchetypeId;
  completedAt: number; // ms since epoch, relative to Date.now()
}

/**
 * Deterministic offsets (in ms) so completedAt renders stable "3 days ago" etc.
 * All relative to the moment the dashboard is loaded (never persisted).
 */
const DAYS = 24 * 60 * 60 * 1000;

export const DEMO_TEAM: readonly DemoMember[] = [
  {
    id: 'dm-01',
    name: 'Maya Ostrowski',
    title: 'CEO',
    archetype: 'queen',
    secondaries: ['alchemist', 'forager'],
    shadow: 'guardian',
    completedAt: -2 * DAYS,
  },
  {
    id: 'dm-02',
    name: 'Rafael Ortiz',
    title: 'COO',
    archetype: 'catalyst',
    secondaries: ['builder', 'swarm-leader'],
    shadow: 'builder',
    completedAt: -3 * DAYS,
  },
  {
    id: 'dm-03',
    name: 'Priya Nathan',
    title: 'VP Product',
    archetype: 'alchemist',
    secondaries: ['queen', 'pollinator'],
    shadow: 'queen',
    completedAt: -4 * DAYS,
  },
  {
    id: 'dm-04',
    name: 'Sam Boadi',
    title: 'VP Engineering',
    archetype: 'builder',
    secondaries: ['catalyst', 'hygienist'],
    shadow: 'hygienist',
    completedAt: -1 * DAYS,
  },
  {
    id: 'dm-05',
    name: 'Elena Vasquez',
    title: 'VP Sales',
    archetype: 'pollinator',
    secondaries: ['forager', 'swarm-leader'],
    shadow: 'forager',
    completedAt: -5 * DAYS,
  },
  {
    id: 'dm-06',
    name: 'Marcus Reid',
    title: 'Head of Growth',
    archetype: 'scout',
    secondaries: ['forager', 'pollinator'],
    shadow: 'forager',
    completedAt: -2 * DAYS,
  },
  {
    id: 'dm-07',
    name: 'Kenji Watanabe',
    title: 'Chief of Staff',
    archetype: 'waggle',
    secondaries: ['regulator', 'alchemist'],
    shadow: 'nurse',
    completedAt: -6 * DAYS,
  },
  {
    id: 'dm-08',
    name: 'Alexis Chen',
    title: 'VP People',
    archetype: 'nurse',
    secondaries: ['regulator', 'waggle'],
    shadow: 'regulator',
    completedAt: -3 * DAYS,
  },
  {
    id: 'dm-09',
    name: 'Jordan Blake',
    title: 'General Counsel',
    archetype: 'guardian',
    secondaries: ['hygienist', 'sentinel'],
    shadow: 'sentinel',
    completedAt: -7 * DAYS,
  },
  {
    id: 'dm-10',
    name: 'Fatima Al-Rashid',
    title: 'Head of Operations',
    archetype: 'builder',
    secondaries: ['catalyst', 'archivist'],
    shadow: 'catalyst',
    completedAt: -4 * DAYS,
  },
  {
    id: 'dm-11',
    name: 'Nikolai Petrov',
    title: 'Chief Data Officer',
    archetype: 'archivist',
    secondaries: ['hygienist', 'forager'],
    shadow: 'hygienist',
    completedAt: -8 * DAYS,
  },
  {
    id: 'dm-12',
    name: 'Simone Larose',
    title: 'VP Marketing',
    archetype: 'alchemist',
    secondaries: ['pollinator', 'forager'],
    shadow: 'queen',
    completedAt: -5 * DAYS,
  },
];

/**
 * Compute derived coverage stats from the demo team.
 */
export interface SystemCoverage {
  systemId: SystemId;
  memberCount: number;
  archetypeIds: ArchetypeId[]; // unique archetypes covered
  gaps: ArchetypeId[]; // archetypes in this system NOT represented as primary
}

export function computeCoverage(members: readonly DemoMember[]): SystemCoverage[] {
  const bySystem = new Map<SystemId, { members: Set<string>; archetypes: Set<ArchetypeId> }>();
  for (const a of ARCHETYPES) {
    if (!bySystem.has(a.systemId)) {
      bySystem.set(a.systemId, { members: new Set(), archetypes: new Set() });
    }
  }
  for (const m of members) {
    const a = ARCHETYPES.find((x) => x.id === m.archetype);
    if (!a) continue;
    const bucket = bySystem.get(a.systemId)!;
    bucket.members.add(m.id);
    bucket.archetypes.add(m.archetype);
  }
  const out: SystemCoverage[] = [];
  for (const [systemId, bucket] of bySystem.entries()) {
    const allInSystem = ARCHETYPES.filter((a) => a.systemId === systemId).map((a) => a.id);
    const gaps = allInSystem.filter((id) => !bucket.archetypes.has(id));
    out.push({
      systemId,
      memberCount: bucket.members.size,
      archetypeIds: Array.from(bucket.archetypes),
      gaps,
    });
  }
  return out.sort((a, b) => a.systemId.localeCompare(b.systemId));
}

export function computeMissingArchetypes(members: readonly DemoMember[]): ArchetypeId[] {
  const present = new Set(members.map((m) => m.archetype));
  return ARCHETYPES.filter((a) => !present.has(a.id)).map((a) => a.id);
}
