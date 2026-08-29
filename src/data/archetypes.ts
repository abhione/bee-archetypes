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
      oneLiner: `The Queen carries the final direction and trade-offs.`,
      contribution: `The Queen views the entire system, its resources, and its ultimate purpose. She makes the singular choice that aligns disparate efforts toward a single, coherent outcome.`,
      shadow: `Under immense pressure, the Queen's capacity for judgment stalls, frozen by the weight of competing variables. The organization loses its heading, each unit pulling in a direction it believes is correct.`,
      balance: `Balanced by the Scout and the Archivist.`,
      aiPairing: `The Strategy Synthesis Agent processes the noise of the entire organization, delivering only the essential signals and their implications. The Queen receives this clarity and applies the ultimate judgment, making the trade-offs that require human values and long-term vision. This pairing sharpens the Queen's focus, elevating her role from information processor to true strategic compass.`,
    },
  },
  {
    id: 'forager',
    name: 'Forager',
    system: 'Sun',
    systemId: 'sun',
    systemLabel: 'Direction & Strategy',
    agenticCounterpart: 'Queen',
    content: {
      oneLiner: `Scouts external terrain for valuable opportunities.`,
      contribution: `The Forager moves between the hive and the world, translating market signals into resource opportunities. They map the competitive landscape, identify emerging trends, and return with concrete pathways for growth.`,
      shadow: `When overwhelmed by noise, the Forager gathers data without pattern, returning with fragmented insights rather than actionable intelligence. They become reactive rather than strategic, chasing every signal while missing the meaningful ones.`,
      balance: `Balanced by the Queen and the Alchemist.`,
      aiPairing: `The Strategy Synthesis Agent distills scattered market signals into decision-grade briefs, highlighting patterns the Forager might miss in the noise. The Forager still determines which opportunities align with organizational values and long-term vision. This partnership transforms raw information into strategic advantage, allowing the Forager to focus judgment rather than collection.`,
    },
  },
  {
    id: 'alchemist',
    name: 'Alchemist',
    system: 'Sun',
    systemId: 'sun',
    systemLabel: 'Direction & Strategy',
    agenticCounterpart: 'Queen',
    content: {
      oneLiner: `The Alchemist transforms signal into a single, clear story.`,
      contribution: `The Alchemist gathers market data, internal metrics, and cultural signals. They distill this complexity into a narrative that defines the next strategic move.`,
      shadow: `Under duress, the Alchemist sees every connection at once. The resulting narrative lacks a clear path forward, becoming noise instead of signal.`,
      balance: `Balanced by the Forager and the Builder.`,
      aiPairing: `The Strategy Synthesis Agent distills the firehose of signal into structured briefs. The Alchemist interprets these briefs, discerning the narrative and making the final strategic choice. This pairing focuses the Alchemist’s attention on the trade-offs only a human can evaluate, amplifying their strategic judgment.`,
    },
  },
  // System · Comb
  {
    id: 'builder',
    name: 'Builder',
    system: 'Comb',
    systemId: 'comb',
    systemLabel: 'Execution & Structure',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `The Builder builds the habitat for the work.`,
      contribution: `The Builder sees the tangled workflows and unspoken rules. They forge the clear processes and reliable frameworks others can depend on.`,
      shadow: `Under pressure, the Builder's instinct for order becomes rigid. They over-engineer solutions, creating systems that serve the structure instead of the people within it.`,
      balance: `Balanced by the Nurse and the Scout.`,
      aiPairing: `The Cadence & Dependency Agent maps the hidden connections between tasks and timelines. The Builder interprets this map, deciding which dependencies to reinforce and which rituals to redesign. The Agent provides the blueprint of the system's flow, allowing the Builder to build with foresight instead of reacting to failure.`,
    },
  },
  {
    id: 'catalyst',
    name: 'Catalyst',
    system: 'Comb',
    systemId: 'comb',
    systemLabel: 'Execution & Structure',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `The Catalyst maintains the rhythm of collective work.`,
      contribution: `The Catalyst establishes the rhythms that coordinate distributed work across the hive. They track the interlocking commitments that prevent work from stalling between phases.`,
      shadow: `When overwhelmed, the Catalyst defaults to ritual enforcement without questioning effectiveness. They preserve process form while losing sight of function, keeping the machinery running but not necessarily delivering value.`,
      balance: `Balanced by the Forager and the Alchemist.`,
      aiPairing: `The Cadence & Dependency Agent maps the network of commitments across the organization, flagging blockers before they cascade. The Catalyst determines which patterns require intervention and which rhythms need adjustment. Together, they transform coordination from reactive firefighting to engineered predictability.`,
    },
  },
  {
    id: 'archivist',
    name: 'Archivist',
    system: 'Comb',
    systemId: 'comb',
    systemLabel: 'Execution & Structure',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `The Archivist structures what the organization already knows.`,
      contribution: `The Archivist builds the systems that capture decisions and outcomes. This makes prior knowledge a searchable resource, not a forgotten conversation.`,
      shadow: `Under pressure, the Archivist shifts from organizing to hoarding. The archive becomes a digital attic, full of valuable but inaccessible things.`,
      balance: `Balanced by the Scout and the Forager.`,
      aiPairing: `The Cadence & Dependency Agent automates the capture of commitments and dependencies, creating a structured timeline of work. The Archivist decides which artifacts hold lasting value and how they connect to the organization's evolving principles. This pairing frees the Archivist from clerical work to focus on synthesis, turning a record of events into a foundation for strategy.`,
    },
  },
  // System · Brood
  {
    id: 'nurse',
    name: 'Nurse',
    system: 'Brood',
    systemId: 'brood',
    systemLabel: 'People & Development',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `The Nurse strengthens individuals through sustained one-on-one work.`,
      contribution: `The Nurse observes the specific skills and needs of each individual. They provide the precise support or challenge needed for that person to grow.`,
      shadow: `Under load, the Nurse absorbs the team's anxieties as their own. They begin to manage the person instead of their work, blurring support and control.`,
      balance: `Balanced by the Queen and the Forager.`,
      aiPairing: `The Cadence & Dependency Agent manages the rhythm of one-on-ones, flagging missed check-ins and surfacing development commitments. The Nurse decides the substance of each conversation, reading the person behind the data. This pairing frees the Nurse from administrative friction, allowing them to bring full attention to the individual.`,
    },
  },
  {
    id: 'waggle',
    name: 'Waggle',
    system: 'Brood',
    systemId: 'brood',
    systemLabel: 'People & Development',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `The Waggle translates intent into action across functions.`,
      contribution: `The Waggle sits at the seams of the org. They listen at the boundary of one function and speak the language of another, so the work of one becomes the input of the next. When information does not travel across teams, the Waggle carries it — often as the person nobody notices until they take a week off and everything grinds.`,
      shadow: `Under sustained load, the Waggle stops holding the line between translation and the work itself. They begin doing everyone's job to save time, absorbing responsibility that was never theirs to hold. The role gets misread as indispensable, and the boundaries the org needed them to police collapse inward.`,
      balance: `Balanced by the Queen and the Catalyst.`,
      aiPairing: `The Cadence & Dependency Agent surfaces dependencies before they become blockers, tracks handoffs across functions, and flags translation gaps before they turn into rework. The Waggle still decides where the real friction lives and which relationships to invest in this week. The pairing amplifies the Waggle's judgment by removing the mechanical work of remembering every open thread.`,
    },
  },
  {
    id: 'regulator',
    name: 'Regulator',
    system: 'Brood',
    systemId: 'brood',
    systemLabel: 'People & Development',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `Maintains trust by enforcing clear boundaries.`,
      contribution: `The Regulator establishes clear protocols for feedback and conflict. This ensures difficult information travels quickly without distortion, preventing small issues from becoming systemic.`,
      shadow: `Under pressure, the Regulator's boundaries become rigid walls. They begin to police compliance instead of cultivating trust, mistaking order for health.`,
      balance: `Balanced by the Scout and the Catalyst.`,
      aiPairing: `The Cadence & Dependency Agent maps the network of commitments, flagging delays and dependency risks with objective precision. The Regulator interprets these signals, discerning between a resource gap and a trust fracture, and decides the human intervention required. This pairing turns interpersonal guesswork into systemic intelligence, allowing the Regulator to apply their judgment exactly where it has the most impact.`,
    },
  },
  // System · Guard
  {
    id: 'hygienist',
    name: 'Hygienist',
    system: 'Guard',
    systemId: 'guard',
    systemLabel: 'Risk & Protection',
    agenticCounterpart: 'Hygienist',
    content: {
      oneLiner: `The Hygienist sees the slow erosion of quality.`,
      contribution: `The Hygienist monitors the flow of work for small deviations, noticing when a standard is quietly altered. They flag these drifts while they are still inexpensive to fix.`,
      shadow: `Under duress, the Hygienist perceives every minor imperfection as a critical threat. Their focus narrows to countless small flaws, and their signal becomes indistinguishable from noise.`,
      balance: `Balanced by the Queen and the Builder.`,
      aiPairing: `The Debt Detection Agent continuously scans for drift patterns across technical, process, and cultural data. The Hygienist interprets these signals, discerning true risk from statistical noise and deciding which debts require immediate attention. This pairing allows the Hygienist to monitor the entire system at scale, wielding the agent as a precision instrument for early intervention.`,
    },
  },
  {
    id: 'guardian',
    name: 'Guardian',
    system: 'Guard',
    systemId: 'guard',
    systemLabel: 'Risk & Protection',
    agenticCounterpart: 'Hygienist',
    content: {
      oneLiner: `The Guardian protects the integrity of the work and the worker.`,
      contribution: `The Guardian traces the downstream impact of new systems, looking for points of friction or failure. They translate principles of safety and fairness into the hard checks required for deployment.`,
      shadow: `When overloaded, the Guardian’s necessary checks become a bottleneck for all progress. Their protection becomes a prison, mistaking stasis for safety.`,
      balance: `Balanced by the Catalyst and the Forager.`,
      aiPairing: `The Debt Detection Agent monitors the entire system for subtle patterns of drift, flagging technical debt, process erosion, and cultural decay before they become visible. The Guardian receives these signals and decides which drifts require immediate intervention and which represent acceptable risk. This pairing transforms the Guardian from a reactive gatekeeper into a proactive steward, wielding the agent’s unblinking view to protect the system’s long-term health.`,
    },
  },
  {
    id: 'sentinel',
    name: 'Sentinel',
    system: 'Guard',
    systemId: 'guard',
    systemLabel: 'Risk & Protection',
    agenticCounterpart: 'Hygienist',
    content: {
      oneLiner: `The Sentinel plans for failures to ensure survival.`,
      contribution: `The Sentinel maps failure scenarios before they manifest. The role establishes safeguards that keep operations running during crises.`,
      shadow: `Under pressure, the Sentinel retreats into excessive control mechanisms. The role begins prioritizing protection over necessary adaptation.`,
      balance: `Balanced by the Forager and the Catalyst.`,
      aiPairing: `The Debt Detection Agent surfaces hidden drift patterns before they compound into systemic failures. The Sentinel determines which patterns require immediate intervention based on impact and feasibility. Together they transform risk management from reactive to predictive without replacing human judgment about what truly matters to the organization.`,
    },
  },
  // System · Swarm
  {
    id: 'pollinator',
    name: 'Pollinator',
    system: 'Swarm',
    systemId: 'swarm',
    systemLabel: 'Growth & Expansion',
    agenticCounterpart: 'Queen',
    content: {
      oneLiner: `The Pollinator carries trust between teams to create value.`,
      contribution: `The Pollinator moves between teams, absorbing context and unspoken needs. They connect disparate groups with the right person or insight, initiating new value streams.`,
      shadow: `The Pollinator's network grows too wide to sustain with genuine attention. They become a bottleneck of shallow connections, spreading warmth too thin to create real trust.`,
      balance: `Balanced by the Builder and the Queen.`,
      aiPairing: `The Strategy Synthesis Agent maps the informal network, flagging latent needs and potential synergies across teams. The Pollinator decides which connections to cultivate and how to approach them, investing their attention where human warmth is critical. The agent provides the signal, the Pollinator provides the trust, amplifying their ability to grow the ecosystem.`,
    },
  },
  {
    id: 'swarm-leader',
    name: 'Swarm Leader',
    system: 'Swarm',
    systemId: 'swarm',
    systemLabel: 'Growth & Expansion',
    agenticCounterpart: 'Catalyst',
    content: {
      oneLiner: `Moves the entire organization through change.`,
      contribution: `The Swarm Leader designs the architecture for large-scale transitions. They align disparate teams around a new operational rhythm.`,
      shadow: `Under extreme pressure, the Swarm Leader’s coordination fractures. Initiatives become a flurry of activity without unified direction.`,
      balance: `Balanced by the Queen and the Scout.`,
      aiPairing: `The Cadence & Dependency Agent maps the critical path of the mobilization, surfacing inter-team dependencies before they become blockers. The Swarm Leader decides where to apply pressure, which dependencies to renegotiate, and how to sequence the rollout for maximum impact. The Agent handles the combinatorial complexity, allowing the Leader to focus on conviction and communication.`,
    },
  },
  {
    id: 'scout',
    name: 'Scout',
    system: 'Swarm',
    systemId: 'swarm',
    systemLabel: 'Growth & Expansion',
    agenticCounterpart: 'Queen',
    content: {
      oneLiner: `The Scout finds what works next and proves it.`,
      contribution: `The Scout ships the smallest possible version of an idea to test a hypothesis. They bring back clear, unbiased data about what actually happened in the world.`,
      shadow: `Under pressure, the Scout’s speed becomes recklessness, shipping experiments too noisy to yield clear signal. Their commitment to truth can curdle into harsh, uncontextualized feedback that damages team morale.`,
      balance: `Balanced by the Builder and the Archivist.`,
      aiPairing: `The Strategy Synthesis Agent ingests the raw data from all of the Scout’s experiments, identifying patterns and surfacing the most promising signals. The Scout still interprets the surfaced signals, decides which hypothesis is worth pursuing next, and designs the subsequent experiment. This pairing allows the Scout to run more experiments in parallel without being overwhelmed, multiplying their rate of discovery while keeping the human judgment at the core of the process.`,
    },
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
