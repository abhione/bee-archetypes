/**
 * Wave 3 smoke test — run 5 simulated user paths through the assessment
 * and verify scoring produces distinct, sane primary bees.
 */
import { QUESTIONS } from '../src/data/questions';
import { scoreAssessment, type AnswerMap } from '../src/data/scoring';
import { getArchetype } from '../src/data/archetypes';

interface Persona {
  name: string;
  bias: string[]; // priority order for which archetype's option to pick
  expectPrimaryIn?: string[]; // acceptable primaries
}

const PERSONAS: Persona[] = [
  {
    name: 'Strategic CEO',
    bias: ['queen', 'alchemist', 'forager', 'swarm-leader'],
    expectPrimaryIn: ['queen', 'alchemist', 'forager'],
  },
  {
    name: 'COO / ops runner',
    bias: ['catalyst', 'builder', 'archivist', 'swarm-leader'],
    expectPrimaryIn: ['catalyst', 'builder'],
  },
  {
    name: 'People/HR leader',
    bias: ['nurse', 'regulator', 'waggle'],
    expectPrimaryIn: ['nurse', 'regulator', 'waggle'],
  },
  {
    name: 'CISO / risk head',
    bias: ['hygienist', 'guardian', 'sentinel'],
    expectPrimaryIn: ['hygienist', 'guardian', 'sentinel'],
  },
  {
    name: 'Founder / scout',
    bias: ['scout', 'forager', 'pollinator'],
    expectPrimaryIn: ['scout', 'forager', 'pollinator'],
  },
];

function pickAnswers(bias: string[]): AnswerMap {
  const answers: AnswerMap = {};
  for (const q of QUESTIONS) {
    let bestOpt = q.options[0];
    let bestScore = -1;
    for (const opt of q.options) {
      // Score option by how well its weights match the bias order
      let score = 0;
      for (let i = 0; i < bias.length; i++) {
        const w = opt.weights[bias[i] as keyof typeof opt.weights] ?? 0;
        score += w * (bias.length - i);
      }
      if (score > bestScore) {
        bestScore = score;
        bestOpt = opt;
      }
    }
    answers[q.id] = bestOpt.id;
  }
  return answers;
}

let errors = 0;
for (const p of PERSONAS) {
  const answers = pickAnswers(p.bias);
  const result = scoreAssessment(answers);
  const primary = getArchetype(result.primary);
  const secondary1 = getArchetype(result.secondaries[0]);
  const secondary2 = getArchetype(result.secondaries[1]);
  const shadow = getArchetype(result.shadow);
  const balance = result.balance.map(getArchetype).map((a) => a.name).join(' + ');
  const inExpected = !p.expectPrimaryIn || p.expectPrimaryIn.includes(result.primary);
  const status = inExpected ? '✓' : '✗';
  if (!inExpected) errors++;
  console.log(
    `${status} ${p.name.padEnd(22)} → ${primary.name.padEnd(14)} ` +
      `[secondaries: ${secondary1.name}, ${secondary2.name}] ` +
      `[shadow: ${shadow.name}] [balance: ${balance}] ` +
      `[AI: ${result.counterpartKey}]`,
  );
}
if (errors) {
  console.error(`\n${errors} personas produced unexpected primaries`);
  process.exit(1);
}
console.log(`\n✓ All 5 personas produced sensible primaries.`);
