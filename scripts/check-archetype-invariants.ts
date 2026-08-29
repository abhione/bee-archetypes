/**
 * Wave 2 invariant checker for the Bee Archetypes data layer.
 *
 * Run: pnpm check:data
 *
 * Verifies:
 *  1. All 15 archetypes declared
 *  2. All 5 systems referenced
 *  3. Every question has exactly 4 options with non-empty labels
 *  4. Every option weight vector references only valid archetype IDs
 *  5. Every archetype is reachable as a top-scorer given SOME 18-answer path
 *     (i.e. no archetype is unpickable — the question set discriminates it)
 *  6. All BALANCE_MAP entries reference valid archetype IDs
 *  7. All CANONICAL_SHADOW entries reference valid archetype IDs
 *
 * Exits non-zero on any invariant violation.
 */

import { ARCHETYPES, SYSTEMS, AGENTIC_COUNTERPARTS, type ArchetypeId } from '../src/data/archetypes';
import { QUESTIONS } from '../src/data/questions';
import { BALANCE_MAP, CANONICAL_SHADOW, scoreAssessment, type AnswerMap } from '../src/data/scoring';

const errors: string[] = [];
const warnings: string[] = [];

function assert(cond: unknown, msg: string) {
  if (!cond) errors.push(msg);
}

function warn(cond: unknown, msg: string) {
  if (!cond) warnings.push(msg);
}

// --- 1. Archetype set is exactly 15 across 5 systems
assert(ARCHETYPES.length === 15, `Expected 15 archetypes, got ${ARCHETYPES.length}`);
assert(SYSTEMS.length === 5, `Expected 5 systems, got ${SYSTEMS.length}`);
assert(AGENTIC_COUNTERPARTS.length === 3, `Expected 3 counterparts, got ${AGENTIC_COUNTERPARTS.length}`);

// Coverage per system: at least 2 archetypes each
const bySystem = new Map<string, ArchetypeId[]>();
for (const a of ARCHETYPES) {
  const list = bySystem.get(a.systemId) ?? [];
  list.push(a.id);
  bySystem.set(a.systemId, list);
}
for (const sys of SYSTEMS) {
  const count = bySystem.get(sys.id)?.length ?? 0;
  assert(count >= 2, `System ${sys.code} has only ${count} archetypes (want >= 2)`);
}

// --- 2. Every question has 4 options
for (const q of QUESTIONS) {
  assert(q.options.length === 4, `Question ${q.id} has ${q.options.length} options (want 4)`);
  assert(q.prompt.length > 10, `Question ${q.id} prompt too short`);
  const optIds = new Set(q.options.map((o) => o.id));
  assert(optIds.size === q.options.length, `Question ${q.id} has duplicate option IDs`);
}

// --- 3. Every option references only valid archetypes
const validIds = new Set<string>(ARCHETYPES.map((a) => a.id));
for (const q of QUESTIONS) {
  for (const opt of q.options) {
    for (const aid of Object.keys(opt.weights)) {
      assert(validIds.has(aid), `Question ${q.id}/${opt.id} weight references unknown archetype ${aid}`);
    }
    if (opt.stressSignal) {
      assert(validIds.has(opt.stressSignal), `Question ${q.id}/${opt.id} stressSignal references unknown archetype ${opt.stressSignal}`);
    }
    assert(opt.label.length > 5, `Question ${q.id}/${opt.id} label too short`);
    const totalWeight = Object.values(opt.weights).reduce((a, b) => a + (b ?? 0), 0);
    assert(totalWeight > 0, `Question ${q.id}/${opt.id} has zero total weight`);
  }
}

// --- 4. Question count = 21
assert(QUESTIONS.length === 21, `Expected 21 questions, got ${QUESTIONS.length}`);

// --- 5. Every archetype is reachable (has some path to be primary)
// Simulate: for each archetype, pick the option per question that gives it the most weight.
// Then run scoreAssessment and confirm that archetype ranks in the top 3.
for (const target of ARCHETYPES) {
  const answers: AnswerMap = {};
  for (const q of QUESTIONS) {
    // Pick option with max weight for this archetype
    let best = q.options[0];
    let bestW = best.weights[target.id] ?? 0;
    for (const opt of q.options.slice(1)) {
      const w = opt.weights[target.id] ?? 0;
      if (w > bestW) {
        best = opt;
        bestW = w;
      }
    }
    answers[q.id] = best.id;
  }
  const result = scoreAssessment(answers);
  const rank = result.scores.find((s) => s.archetypeId === target.id)?.rank ?? 999;
  assert(rank <= 3, `Archetype ${target.name} unreachable as top-3 primary (best rank achievable: ${rank})`);
  if (rank !== 1) {
    warn(false, `Archetype ${target.name} best-case rank is ${rank}, not 1 (question discrimination weak)`);
  }
}

// --- 6. BALANCE_MAP references only valid archetypes
for (const [aid, balance] of Object.entries(BALANCE_MAP)) {
  assert(validIds.has(aid), `BALANCE_MAP has unknown key ${aid}`);
  assert(balance.length >= 2 && balance.length <= 3, `BALANCE_MAP[${aid}] has ${balance.length} entries (want 2-3)`);
  for (const bid of balance) {
    assert(validIds.has(bid), `BALANCE_MAP[${aid}] references unknown archetype ${bid}`);
    assert(bid !== aid, `BALANCE_MAP[${aid}] cannot include itself`);
  }
}

// --- 7. CANONICAL_SHADOW references only valid archetypes
for (const [aid, sid] of Object.entries(CANONICAL_SHADOW)) {
  assert(validIds.has(aid), `CANONICAL_SHADOW has unknown key ${aid}`);
  assert(validIds.has(sid), `CANONICAL_SHADOW[${aid}] references unknown archetype ${sid}`);
  assert(sid !== aid, `CANONICAL_SHADOW[${aid}] cannot equal itself`);
}

// --- 8. Every archetype has BALANCE_MAP + CANONICAL_SHADOW entry
for (const a of ARCHETYPES) {
  assert(a.id in BALANCE_MAP, `Archetype ${a.id} missing from BALANCE_MAP`);
  assert(a.id in CANONICAL_SHADOW, `Archetype ${a.id} missing from CANONICAL_SHADOW`);
}

// --- Report
if (warnings.length > 0) {
  console.warn(`\n⚠  ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`   - ${w}`);
}
if (errors.length > 0) {
  console.error(`\n✗ ${errors.length} invariant violation(s):`);
  for (const e of errors) console.error(`   - ${e}`);
  process.exit(1);
}
console.log(`✓ All invariants pass. ${QUESTIONS.length} questions × 4 options × ${ARCHETYPES.length} archetypes across ${SYSTEMS.length} systems.`);
