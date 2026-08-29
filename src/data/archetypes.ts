/**
 * Bee Archetypes — canonical data model.
 *
 * 15 archetypes across 5 organizational systems.
 * Each archetype has a rich content payload (oneLiner, contribution, shadow,
 * balance, aiPairing) authored via GLM-4.6 in Wave 2a and validated by
 * scripts/check-archetype-invariants.ts.
 *
 * The Agentic Counterpart maps each archetype to one of the three Q1 2027
 * Agentic Counterparts (Queen / Catalyst / Hygienist) per the PRFAQ v2.
 */

export type SystemId = 'sun' | 'comb' | 'brood' | 'guard' | 'swarm';

export type ArchetypeId =
  | 'queen'
  | 'forager'
  | 'alchemist'
  | 'builder'
  | 'catalyst'
  | 'archivist'
  | 'nurse'
  | 'waggle'
  | 'regulator'
  | 'hygienist'
  | 'guardian'
  | 'sentinel'
  | 'pollinator'
  | 'swarm-leader'
  | 'scout';

export type AgenticCounterpartKey = 'Queen' | 'Catalyst' | 'Hygienist';

export interface System {
  id: SystemId;
  code: string; // 'Sun', 'Comb', etc — display code
  label: string; // 'Direction & Strategy'
  description: string;
  color: string; // CSS var reference
}

export interface AgenticCounterpart {
  key: AgenticCounterpartKey;
  name: string; // 'Strategy Synthesis Agent'
  systemAnchor: SystemId; // which system it lives in
  description: string; // what it does
}

export interface Archetype {
  id: ArchetypeId;
  name: string;
  system: string; // 'Sun', 'Comb', etc — matches System.code
  systemId: SystemId;
  systemLabel: string;
  agenticCounterpart: AgenticCounterpartKey;
  content: {
    oneLiner: string;
    contribution: string;
    shadow: string;
    balance: string; // "Balanced by the X and the Y."
    aiPairing: string;
  };
}

export const SYSTEMS: readonly System[] = [
  {
    id: 'sun',
    code: 'Sun',
    label: 'Direction & Strategy',
    description:
      'The system that holds where the hive is going and why. Direction is not a document. It is an attention pattern that survives contact with the market.',
    color: 'var(--color-system-sun)',
  },
  {
    id: 'comb',
    code: 'Comb',
    label: 'Execution & Structure',
    description:
      'The lattice on which work compounds. Rituals, cadences, and repeatable structures that turn intent into shipped outcomes without ceremony overhead.',
    color: 'var(--color-system-comb)',
  },
  {
    id: 'brood',
    code: 'Brood',
    label: 'People & Development',
    description:
      'The system that grows capability. One-on-ones, coaching, translation, and the connective tissue that makes a team more than a headcount.',
    color: 'var(--color-system-brood)',
  },
  {
    id: 'guard',
    code: 'Guard',
    label: 'Risk & Protection',
    description:
      'The immune system. Detects drift, holds ethical lines, plans for what breaks. The archetypes here keep the hive alive across generations.',
    color: 'var(--color-system-guard)',
  },
  {
    id: 'swarm',
    code: 'Swarm',
    label: 'Growth & Expansion',
    description:
      'The system that moves outward. New markets, partnerships, acquisitions, experiments. How the hive learns and how it spreads.',
    color: 'var(--color-system-swarm)',
  },
] as const;

export const AGENTIC_COUNTERPARTS: readonly AgenticCounterpart[] = [
  {
    key: 'Queen',
    name: 'Strategy Synthesis Agent',
    systemAnchor: 'sun',
    description:
      'Distills scattered signal from meetings, docs, and market noise into decision-grade briefs. Frees the strategic operator to spend their attention on trade-offs only they can make.',
  },
  {
    key: 'Catalyst',
    name: 'Cadence & Dependency Agent',
    systemAnchor: 'comb',
    description:
      'Runs the calendar of commitments and dependencies across the org. Surfaces blockers before they cost a week and turns rituals into engineered outcomes.',
  },
  {
    key: 'Hygienist',
    name: 'Debt Detection Agent',
    systemAnchor: 'guard',
    description:
      'Watches for the drift patterns — quality, process, technical, cultural — that only compound in the dark. Names them while they are still cheap to fix.',
  },
] as const;

/**
 * Archetype registry — content populated from Wave 2a GLM-4.6 output.
 * Order is stable: iterate in this order for consistent UI.
 */
export const ARCHETYPES: readonly Archetype[] = [
  // System · Sun
  {
    id: 'queen',
    name: 'Queen',
    system: 'Sun',
    systemId: 'sun',
    systemLabel: 'Direction & Strategy',
    agenticCounterpart: 'Queen',
    content: {
      oneLiner: '',
      contribution: '',
      shadow: '',
      balance: '',
      aiPairing: '',
    },
  },
  {
    id: 'forager',
    name: 'Forager',
    system: 'Sun',
    systemId: 'sun',
    systemLabel: 'Direction & Strategy',
    agenticCounterpart: 'Queen',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    system: 'Sun',
    systemId: 'sun',
    systemLabel: 'Direction & Strategy',
    agenticCounterpart: 'Queen',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  // System · Comb
  {
    id: 'builder',
    name: 'Builder',
    system: 'Comb',
    systemId: 'comb',
    systemLabel: 'Execution & Structure',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'catalyst',
    name: 'Catalyst',
    system: 'Comb',
    systemId: 'comb',
    systemLabel: 'Execution & Structure',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'archivist',
    name: 'Archivist',
    system: 'Comb',
    systemId: 'comb',
    systemLabel: 'Execution & Structure',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  // System · Brood
  {
    id: 'nurse',
    name: 'Nurse',
    system: 'Brood',
    systemId: 'brood',
    systemLabel: 'People & Development',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'waggle',
    name: 'Waggle',
    system: 'Brood',
    systemId: 'brood',
    systemLabel: 'People & Development',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'regulator',
    name: 'Regulator',
    system: 'Brood',
    systemId: 'brood',
    systemLabel: 'People & Development',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  // System · Guard
  {
    id: 'hygienist',
    name: 'Hygienist',
    system: 'Guard',
    systemId: 'guard',
    systemLabel: 'Risk & Protection',
    agenticCounterpart: 'Hygienist',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'guardian',
    name: 'Guardian',
    system: 'Guard',
    systemId: 'guard',
    systemLabel: 'Risk & Protection',
    agenticCounterpart: 'Hygienist',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    system: 'Guard',
    systemId: 'guard',
    systemLabel: 'Risk & Protection',
    agenticCounterpart: 'Hygienist',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  // System · Swarm
  {
    id: 'pollinator',
    name: 'Pollinator',
    system: 'Swarm',
    systemId: 'swarm',
    systemLabel: 'Growth & Expansion',
    agenticCounterpart: 'Queen',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'swarm-leader',
    name: 'Swarm Leader',
    system: 'Swarm',
    systemId: 'swarm',
    systemLabel: 'Growth & Expansion',
    agenticCounterpart: 'Catalyst',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
  {
    id: 'scout',
    name: 'Scout',
    system: 'Swarm',
    systemId: 'swarm',
    systemLabel: 'Growth & Expansion',
    agenticCounterpart: 'Queen',
    content: { oneLiner: '', contribution: '', shadow: '', balance: '', aiPairing: '' },
  },
];

/** Fast lookup by id. */
export const ARCHETYPE_BY_ID: Readonly<Record<ArchetypeId, Archetype>> = Object.freeze(
  Object.fromEntries(ARCHETYPES.map((a) => [a.id, a])) as Record<ArchetypeId, Archetype>,
);

export function getArchetype(id: ArchetypeId): Archetype {
  const a = ARCHETYPE_BY_ID[id];
  if (!a) throw new Error(`Unknown archetype id: ${id}`);
  return a;
}

export function getSystem(id: SystemId): System {
  const s = SYSTEMS.find((s) => s.id === id);
  if (!s) throw new Error(`Unknown system id: ${id}`);
  return s;
}

export function getCounterpart(key: AgenticCounterpartKey): AgenticCounterpart {
  const c = AGENTIC_COUNTERPARTS.find((c) => c.key === key);
  if (!c) throw new Error(`Unknown counterpart key: ${key}`);
  return c;
}

export function archetypesInSystem(systemId: SystemId): Archetype[] {
  return ARCHETYPES.filter((a) => a.systemId === systemId);
}
