/**
 * Bee Archetypes — canonical data model.
 *
 * 15 archetypes across 5 organizational systems.
 * Each archetype has a rich content payload (oneLiner, contribution, shadow,
 * balance, aiPairing) authored via GLM-4.6 in Wave 2a and validated by
 * scripts/check-archetype-invariants.ts.
 *
 * The Hive Copilot maps each archetype to one of three Q1 2027 copilots
 * (Queen / Catalyst / Hygienist) per the PRFAQ v2.
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
      'Watches for the drift patterns that only compound in the dark: quality, process, technical, cultural. Names them while they are still cheap to fix.',
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
      oneLiner: `Queens make the one call that ends the debate and starts the work.`,
      contribution: `A Queen sees the whole board before anyone else finishes reading the first move. In a room full of good options, she names the one path and closes the debate. Others collect input. The Queen spends it, turning a dozen live ideas into the single decision the hive executes against.`,
      shadow: `When the trade-offs multiply past what one person can hold, a Queen stops deciding and starts stalling, unable to choose without feeling she has betrayed one goal for another. The hive reads the hesitation as lost nerve. People stop bringing her the hard calls and start guessing at what she would have wanted.`,
      balance: `Balanced by the Scout and the Archivist.`,
      aiPairing: `The Strategy Synthesis Agent reads the noise first, every meeting note, market signal, and internal metric compressed into a short brief with the trade-offs already surfaced. The Queen never touches the raw material. She reads the brief and weighs what the agent cannot: what the hive values, what risk it can absorb this quarter, what precedent a choice sets for next year. The agent widens what she can see. It never decides for her.`,
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
      oneLiner: `Foragers leave the hive to test what the market actually rewards.`,
      contribution: `A Forager treats the market as a place to visit, not a slide to read about. They test pricing, watch a competitor's launch, sit in on a customer call nobody asked them to join. They come back with what is true this week, not last quarter's assumption.`,
      shadow: `Under real pressure, a Forager keeps moving because moving feels like progress. Every new data point becomes urgent, every competitor's move becomes a fire. Buried in fresh signal, they stop separating the pattern from the noise and drag the hive into a dozen partial responses instead of one considered move.`,
      balance: `Balanced by the Queen and the Alchemist.`,
      aiPairing: `The Strategy Synthesis Agent sorts the flood of market chatter a Forager brings home into what changed, what mattered, and what was probably noise. The Forager still decides which thread is worth a real bet, since the agent cannot tell ambition from distraction. Between forages, it flags the signals that moved while they were out testing something else, so nothing important goes stale before the next trip.`,
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
      oneLiner: `Alchemists find the one story hiding inside a hundred unrelated facts.`,
      contribution: `An Alchemist reads a slipping metric, a customer complaint, and a hallway comment as three pieces of the same story. They hold the pattern before the proof, naming a shift the data will only confirm months later. What they hand back is a single sentence that makes the room say, that is what has been happening.`,
      shadow: `Pushed too hard, an Alchemist starts seeing connections everywhere and stops trusting any single one enough to commit. The narrative grows more layers instead of a clearer edge, and what should have clarified a decision leaves the room more confused than when they walked in. Conviction curdles into a fog of maybe.`,
      balance: `Balanced by the Forager and the Builder.`,
      aiPairing: `The Strategy Synthesis Agent compresses the raw firehose, meeting transcripts, metrics, support tickets, into structured briefs before the Alchemist opens a single document. The Alchemist still does the part no model can: deciding which threads are actually the same thread, and naming the story before it is obvious to anyone else. The agent removes the digging, so the Alchemist spends the hour on synthesis instead of search.`,
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
      oneLiner: `Builders turn tribal knowledge into a process anyone new can run.`,
      contribution: `A Builder watches the same workaround get reinvented by three different people and turns it into a process the next hire can follow on day one. They name the unspoken rule everyone already follows and make it visible, so the team stops depending on the one person who remembers how things actually get done.`,
      shadow: `Under pressure, a Builder keeps adding process after the need for it has passed. A two-person team ends up with a five-step approval chain built for fifty. The scaffolding that once made work possible now exists to protect itself, and people start routing around it just to get anything done.`,
      balance: `Balanced by the Nurse and the Scout.`,
      aiPairing: `The Cadence & Dependency Agent maps how work actually moves between people, surfacing the handoffs a process document usually misses. The Builder reads that map and decides which chokepoints deserve a real fix and which are fine left informal. Redesigning a workflow used to mean interviewing everyone who touches it. Now the Builder starts from the map and spends the interview time on judgment instead of discovery.`,
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
      oneLiner: `Catalysts keep a hundred moving parts landing on the same Tuesday.`,
      contribution: `A Catalyst tracks what depends on what across five teams that do not talk to each other daily. They notice three days before anyone else that a delayed decision in engineering will stall marketing's launch date, and they say so before it becomes a fire drill.`,
      shadow: `Worn down, a Catalyst starts running the ritual instead of the reason for it. The standup still happens, the status doc still updates, but nobody in the room can say what decision it is supposed to produce. The rhythm keeps beating after the music has stopped.`,
      balance: `Balanced by the Forager and the Alchemist.`,
      aiPairing: `The Cadence & Dependency Agent tracks every open commitment across the org and flags the ones about to collide, a shared vendor, a shared engineer, a shared deadline, before anyone discovers it in a standup. The Catalyst decides which collision is worth an intervention this week and which will resolve itself. What used to take a spreadsheet and a memory for detail now takes five minutes of judgment.`,
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
      oneLiner: `Archivists make sure the hive doesn't relearn the same lesson twice.`,
      contribution: `An Archivist notices when a decision from eighteen months ago is about to get remade from scratch because nobody wrote down why it happened the first time. They build the place where the reasoning lives after the meeting ends, so a new hire can find out why, not just what.`,
      shadow: `Under strain, an Archivist starts collecting for its own sake. The archive grows heavier than anyone can search, every decision preserved with equal weight, the important buried next to the trivial. What was meant to be a memory becomes a warehouse nobody enters, and the hive forgets anyway.`,
      balance: `Balanced by the Scout and the Forager.`,
      aiPairing: `The Cadence & Dependency Agent tracks every commitment and decision as it happens, building a timeline the Archivist would otherwise reconstruct from memory and old threads. The Archivist still decides what deserves a permanent home and what was only ever noise. Instead of hunting for a two-year-old rationale by memory, they start from what the agent already logged and spend the time on why it still matters.`,
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
      oneLiner: `Nurses know exactly which kind of hard a person needs this week.`,
      contribution: `A Nurse tracks one person's growth the way others track a project, noticing the specific skill ready to be pushed and the specific fear that is not. In a one-on-one, they ask past the status update to what is actually stuck, and stay long enough to hear the real answer.`,
      shadow: `Carrying too many people's growth at once, a Nurse starts absorbing what should stay theirs to carry. A missed deadline becomes a referendum on someone's whole trajectory. They step from developing the person into managing them, deciding what someone can handle before asking, and the room meant to feel safe starts to feel supervised.`,
      balance: `Balanced by the Queen and the Forager.`,
      aiPairing: `The Cadence & Dependency Agent keeps the mechanics of development on track: when the last one-on-one happened, which growth commitment is overdue, which skill gap keeps resurfacing across check-ins. The Nurse never has to hold that in their head. They walk into each conversation already knowing what to follow up on, and spend the hour reading the person instead of managing the paperwork of developing them.`,
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
      oneLiner: `Waggles translate one team's plan into words the next team can act on.`,
      contribution: `A Waggle sits at the seam between two functions and notices when the same word means two different things on each side. They carry context across the boundary so engineering's caveat survives the trip to sales, and they do it so consistently that nobody notices until the week they are out and three handoffs quietly fail.`,
      shadow: `Under sustained load, a Waggle stops carrying the message and starts doing the work on both sides of the boundary to make sure it lands right. They absorb tasks that were never theirs to hold, and the org reads the overextension as indispensable instead of a boundary that needs defending.`,
      balance: `Balanced by the Queen and the Catalyst.`,
      aiPairing: `The Cadence & Dependency Agent tracks every handoff between functions and flags the ones drifting: a spec that changed on one side but has not reached the other yet. The Waggle still decides which gap is actually dangerous and which relationship needs an hour of attention this week. The agent remembers every open thread so the Waggle does not have to, freeing them to work the two or three seams that matter most today.`,
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
      oneLiner: `Regulators say the hard thing early, before it becomes a grudge.`,
      contribution: `A Regulator names the tension in the room before it curdles into a story people tell about each other in private. They set the actual rule for how disagreement gets raised on this team, not a values poster, and enforce it evenly enough that people trust the process more than their own read of the room.`,
      shadow: `Pushed too far, a Regulator starts enforcing the letter of the process and loses the feel for what it was protecting. A rule meant to keep feedback safe becomes a reason to shut a hard conversation down early. People stop bringing friction to them and start avoiding it instead, and the trust the role exists to protect quietly erodes.`,
      balance: `Balanced by the Scout and the Catalyst.`,
      aiPairing: `The Cadence & Dependency Agent surfaces where commitments keep slipping and which relationships carry repeated friction, patterns easy to miss inside any single conversation. The Regulator reads those patterns and decides whether the real problem is a resource gap or a trust fracture, a distinction no agent can make. What used to take months of pattern-watching now surfaces in a week, leaving more time for the conversation itself.`,
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
      oneLiner: `Hygienists catch the standard slipping before anyone else notices it moved.`,
      contribution: `A Hygienist notices when a check that used to take ten minutes now takes two. Nobody decided to cut the corner. It just eroded one release at a time. They name the drift while it still costs an afternoon to fix, not a quarter, and before it shows up in a customer complaint.`,
      shadow: `Under duress, a Hygienist starts treating every small deviation as an emergency. Every typo, every skipped step, every minor inconsistency gets flagged with the same urgency as a real failure, and the team stops being able to tell which alarm is worth stopping for. The signal that used to save time now drowns in itself.`,
      balance: `Balanced by the Queen and the Builder.`,
      aiPairing: `The Debt Detection Agent scans continuously for the drift a person would only catch by accident: a metric quietly redefined, a step quietly skipped. The Hygienist reviews what it surfaces and decides which drift is cosmetic and which is the first crack in something load-bearing. Watching the whole system by hand was never possible. Now the Hygienist spends their attention on the handful of flags that actually matter.`,
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
      oneLiner: `Guardians ask who gets hurt before a system ships, not after.`,
      contribution: `A Guardian traces a new process or system to the person it will actually affect: the customer whose data it touches, the employee whose workload it changes, before anyone signs off. They turn a value like fairness into a specific check someone has to pass, so the principle survives contact with a deadline.`,
      shadow: `Overloaded, a Guardian starts saying no by default because saying yes takes energy they no longer have to defend. Every launch waits on a review that exists to protect people but now exists mostly to protect the Guardian from being blamed later. Progress stalls, and the team starts routing around the checks instead of through them.`,
      balance: `Balanced by the Catalyst and the Forager.`,
      aiPairing: `The Debt Detection Agent flags the technical and process debt piling up behind a launch: the shortcuts nobody wrote down, the checks skipped under deadline pressure. The Guardian weighs what it surfaces against who actually gets hurt if it ships anyway, a judgment call no agent should make alone. The result is a Guardian who reviews with evidence instead of instinct, and moves faster because the evidence is already there.`,
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
      oneLiner: `Sentinels build the exit before anyone thinks they'll need one.`,
      contribution: `A Sentinel asks what happens if the vendor disappears, the lead engineer quits, the market turns overnight, and builds the fallback before any of it happens. They are the reason the hive has a plan that is not improvised in the middle of a crisis.`,
      shadow: `Under pressure, a Sentinel starts building safeguards for scenarios that will never happen, adding control after control until the organization can barely move without tripping one. Protection becomes the goal instead of the means, and the hive that was supposed to survive a crisis can no longer respond quickly to an ordinary one.`,
      balance: `Balanced by the Forager and the Catalyst.`,
      aiPairing: `The Debt Detection Agent surfaces the drift patterns most likely to compound into the kind of failure a Sentinel plans for: an unmonitored dependency, a process with no backup owner. The Sentinel decides which of those risks is worth a real contingency and which is an acceptable bet. The agent widens the field of view. The Sentinel still draws the line between prepared and paranoid.`,
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
      oneLiner: `Pollinators know which two people in the building should meet.`,
      contribution: `A Pollinator carries context between teams that have no reason to talk to each other: mentioning to product what they just heard on a sales call, introducing the two people solving the same problem in different departments. They create value nobody assigned them to create, just by noticing who needs to know whom.`,
      shadow: `Stretched across too many teams, a Pollinator's connections start to thin. They introduce people out of habit more than judgment, and the warmth that used to signal a real match becomes background noise nobody trusts anymore. Everyone gets a friendly nudge, and nothing gets the sustained attention that would have turned it into something real.`,
      balance: `Balanced by the Builder and the Queen.`,
      aiPairing: `The Strategy Synthesis Agent scans across teams for the overlaps a human would only find by accident: two groups solving the same problem, a need in one department that a capability in another could answer. The Pollinator decides which overlap is worth the social capital to pursue, since the value only shows up if the introduction is trusted. The agent finds the match. The Pollinator makes it real.`,
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
      oneLiner: `Swarm Leaders get a whole organization moving in one direction at once.`,
      contribution: `A Swarm Leader designs how three hundred people move through a reorg or a market pivot without losing a quarter to confusion, sequencing who hears what and when so the change lands as one story instead of three hundred rumors. They hold the timeline for the whole migration, not just their piece of it.`,
      shadow: `Under extreme pressure, a Swarm Leader's carefully sequenced rollout starts to fragment. Teams that were supposed to move together start improvising their own version of the change, and what should have been one coordinated shift becomes a dozen local interpretations pulling against each other. Momentum turns into noise.`,
      balance: `Balanced by the Queen and the Scout.`,
      aiPairing: `The Cadence & Dependency Agent maps the critical path of the mobilization: which team has to finish before the next one can start, where two rollouts collide on the same week. The Swarm Leader decides where to push, what to renegotiate, and how to talk about the change so it lands as conviction instead of instruction. The agent handles the sequencing math. The Leader handles the room.`,
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
      oneLiner: `Scouts ship the smallest possible test to find out what's actually true.`,
      contribution: `A Scout builds the cheapest version of an idea that can still return a real answer: a landing page instead of a product, a pilot with five customers instead of fifty. They report back what actually happened, not what the team hoped would happen, even when the result kills a favorite idea.`,
      shadow: `Moving too fast, a Scout starts shipping tests too noisy to mean anything, mistaking motion for learning. Their commitment to blunt truth can curdle into feedback delivered without context, landing as a verdict instead of a data point, and the team starts distrusting the tone as much as the test.`,
      balance: `Balanced by the Builder and the Archivist.`,
      aiPairing: `The Strategy Synthesis Agent pulls the results from every experiment a Scout runs into one place, spotting the pattern across five small tests that no single test would show. The Scout still decides which hypothesis deserves the next bet and designs the experiment that will actually answer it. Freed from tracking results by hand, a Scout runs more tests in parallel without losing the thread on any one of them.`,
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
