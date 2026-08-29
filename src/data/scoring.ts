/**
 * Bee Archetypes scoring engine — fully deterministic.
 *
 * Input: a map of answered question ID → selected option ID.
 * Output: { primary, secondaries, shadow, balance, counterpartKey, scores }
 *
 * Algorithm:
 *  1. Sum weight vectors from all selected options into a per-archetype score.
 *  2. Rank archetypes by score.
 *  3. primary   = rank 1
 *     secondary = rank 2 and rank 3 (2 archetypes)
 *  4. shadow    = archetype boosted by stressSignal answers, weighted by primary's
 *                 own shadow-tendency (each archetype has a canonical stress fallback).
 *                 If no stress-signal answers, fall back to primary's canonical shadow.
 *  5. balance   = the 2-3 archetypes named in primary.content.balance, resolved via
 *                 BALANCE_MAP (parsed once at boot from content strings, or looked
 *                 up here in a static table).
 *  6. counterpart = primary.agenticCounterpart (Queen | Catalyst | Hygienist).
 *
 * No LLM. Same answers → same result. Ships as pure TypeScript.
 */

import type { ArchetypeId, AgenticCounterpartKey } from './archetypes';
import { ARCHETYPES, getArchetype } from './archetypes';
import { QUESTIONS, type Question, type QuestionOption } from './questions';

/**
 * Canonical shadow fallback per archetype.
 * When someone scores as a primary but there is no explicit stress signal in
 * their answers, this is the archetype pattern they collapse toward.
 *
 * (These are the "shadow of X is Y" pairings from the archetype system.
 * Empirically observed: over-controlled Queens hit Guardian; over-driving
 * Builders hit Hygienist; over-caring Nurses hit Regulator, etc.)
 */
export const CANONICAL_SHADOW: Readonly<Record<ArchetypeId, ArchetypeId>> = {
  queen: 'guardian',       // over-control
  forager: 'scout',         // chase-every-signal
  alchemist: 'queen',       // over-narrating
  builder: 'hygienist',     // over-optimizing
  catalyst: 'builder',      // ritual-for-ritual's-sake
  archivist: 'hygienist',   // process-fetish
  nurse: 'regulator',       // over-caretaking
  waggle: 'nurse',           // over-translating
  regulator: 'guardian',    // rigid-boundary
  hygienist: 'guardian',    // audit-paralysis
  guardian: 'sentinel',     // catastrophizing
  sentinel: 'guardian',     // paranoia
  pollinator: 'forager',    // ecosystem-drift
  'swarm-leader': 'queen',   // scale-at-all-costs
  scout: 'forager',          // chase-shiny-thing
};

/**
 * Balance archetypes per primary — the 2-3 complementary archetypes.
 * Populated by the archetype content authoring (Wave 2a), but this static
 * table is the ground truth used by the scoring engine.
 */
export const BALANCE_MAP: Readonly<Record<ArchetypeId, ArchetypeId[]>> = {
  queen:        ['catalyst', 'regulator', 'hygienist'],
  forager:      ['builder', 'archivist', 'guardian'],
  alchemist:    ['catalyst', 'hygienist', 'archivist'],
  builder:      ['alchemist', 'nurse', 'scout'],
  catalyst:     ['queen', 'nurse', 'scout'],
  archivist:    ['scout', 'forager', 'alchemist'],
  nurse:        ['queen', 'builder', 'hygienist'],
  waggle:       ['queen', 'guardian', 'hygienist'],
  regulator:    ['queen', 'catalyst', 'scout'],
  hygienist:    ['alchemist', 'pollinator', 'scout'],
  guardian:     ['scout', 'alchemist', 'pollinator'],
  sentinel:     ['alchemist', 'scout', 'pollinator'],
  pollinator:   ['guardian', 'hygienist', 'archivist'],
  'swarm-leader': ['nurse', 'regulator', 'hygienist'],
  scout:        ['archivist', 'guardian', 'catalyst'],
};

export type AnswerMap = Record<string, string>; // questionId → optionId

export interface ArchetypeScore {
  archetypeId: ArchetypeId;
  score: number;
  rank: number;
}

export interface AssessmentResult {
  primary: ArchetypeId;
  secondaries: [ArchetypeId, ArchetypeId];
  shadow: ArchetypeId;
  balance: ArchetypeId[];
  counterpartKey: AgenticCounterpartKey;
  scores: ArchetypeScore[]; // sorted descending
  answered: number;
  total: number;
}

/**
 * Score a completed assessment. Answered questions can be a subset — missing
 * answers just contribute zero. Caller should enforce a minimum answer count.
 */
export function scoreAssessment(answers: AnswerMap): AssessmentResult {
  // Initialize all-zero score vector.
  const scores: Record<ArchetypeId, number> = Object.fromEntries(
    ARCHETYPES.map((a) => [a.id, 0]),
  ) as Record<ArchetypeId, number>;

  const stressCounts: Record<ArchetypeId, number> = Object.fromEntries(
    ARCHETYPES.map((a) => [a.id, 0]),
  ) as Record<ArchetypeId, number>;

  let answered = 0;
  const questionsById: Record<string, Question> = Object.fromEntries(
    QUESTIONS.map((q) => [q.id, q]),
  );

  for (const [qid, oid] of Object.entries(answers)) {
    const q = questionsById[qid];
    if (!q) continue;
    const opt: QuestionOption | undefined = q.options.find((o) => o.id === oid);
    if (!opt) continue;
    answered++;

    for (const [aid, w] of Object.entries(opt.weights)) {
      if (w) scores[aid as ArchetypeId] += w;
    }
    if (opt.stressSignal) {
      stressCounts[opt.stressSignal] += 1;
    }
  }

  // Rank by score, break ties by declaration order in ARCHETYPES.
  const ranked: ArchetypeScore[] = ARCHETYPES.map((a) => ({
    archetypeId: a.id,
    score: scores[a.id],
    rank: 0,
  }))
    .sort((a, b) => b.score - a.score)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  const primary = ranked[0].archetypeId;
  const secondaries: [ArchetypeId, ArchetypeId] = [
    ranked[1].archetypeId,
    ranked[2].archetypeId,
  ];

  // Shadow selection:
  //  - Prefer the stressSignal archetype with the highest count
  //  - If none, fall back to CANONICAL_SHADOW[primary]
  //  - Never pick primary itself as shadow (would be weird UX)
  let shadow: ArchetypeId = CANONICAL_SHADOW[primary];
  const topStress = Object.entries(stressCounts)
    .filter(([aid]) => aid !== primary)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];
  if (topStress && (topStress[1] as number) > 0) {
    shadow = topStress[0] as ArchetypeId;
  }

  // Balance archetypes: static map, cleaned of primary.
  const balance = (BALANCE_MAP[primary] ?? [])
    .filter((id) => id !== primary && id !== secondaries[0] && id !== secondaries[1])
    .slice(0, 3);
  // If dedupe knocked us down to <2 balance archetypes, top up from map ignoring the exclusion.
  if (balance.length < 2) {
    for (const id of BALANCE_MAP[primary] ?? []) {
      if (!balance.includes(id) && id !== primary) balance.push(id);
      if (balance.length >= 3) break;
    }
  }

  const counterpartKey = getArchetype(primary).agenticCounterpart;

  return {
    primary,
    secondaries,
    shadow,
    balance,
    counterpartKey,
    scores: ranked,
    answered,
    total: QUESTIONS.length,
  };
}

/**
 * Human-friendly summary of the result, useful for OG images and share text.
 */
export function summarizeResult(result: AssessmentResult): string {
  const primary = getArchetype(result.primary);
  return `${primary.name} — ${primary.systemLabel}`;
}
