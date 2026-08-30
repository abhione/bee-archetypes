/**
 * Bee Archetypes assessment — 21 questions × 4 options.
 *
 * Each option carries a partial weight vector (Record<ArchetypeId, number>)
 * with values in [0, 2]. On submission we sum the vectors across all
 * selected options to produce a per-archetype score. The scoring engine
 * then extracts:
 *   - primary: top score
 *   - secondary: 2nd and 3rd scores (within 15% of primary optional)
 *   - shadow: the archetype whose complement pattern shows most strongly
 *     under stress (indicated by "under-stress" options)
 *   - balance: 2-3 complementary archetypes per the archetype's own
 *     balance-of definition
 *
 * Scoring is fully deterministic. Same answers → same result. No LLM in
 * the loop for scoring.
 */

import type { ArchetypeId } from './archetypes';

export interface QuestionOption {
  id: string;
  label: string;
  /** Weight contribution per archetype. Sparse — only non-zero entries needed. */
  weights: Partial<Record<ArchetypeId, number>>;
  /**
   * Under-stress signal: if this option is selected, the archetype named
   * here is boosted as a shadow candidate (the archetype we fall into under
   * load, whether or not it's our primary).
   */
  stressSignal?: ArchetypeId;
}

export interface Question {
  id: string;
  prompt: string;
  /** Short kicker above the prompt, e.g. "How you show up · 1 of 21". */
  kicker?: string;
  options: QuestionOption[];
}

/**
 * Questions authored to disambiguate the 15 archetypes cleanly.
 * Each question probes 3-4 archetypes distinctly, with weights tuned so
 * that any 21-answer path produces a clear primary within +/- 1 point of
 * the second-place archetype.
 */
export const QUESTIONS: readonly Question[] = [
  {
    id: 'q01',
    prompt: 'When a new challenge lands on the team, what do you naturally do first?',
    options: [
      {
        id: 'q01a',
        label: 'Zoom out and ask what winning even looks like here.',
        weights: { queen: 2, alchemist: 1, forager: 1 },
      },
      {
        id: 'q01b',
        label: 'Break it into a repeatable structure so we can run it more than once.',
        weights: { builder: 2, catalyst: 1, archivist: 1 },
      },
      {
        id: 'q01c',
        label: 'Check who on the team is closest to it and whether they have what they need.',
        weights: { nurse: 2, waggle: 1, regulator: 1 },
      },
      {
        id: 'q01d',
        label: 'Ship something small this week and see what actually breaks.',
        weights: { scout: 2, pollinator: 1, 'swarm-leader': 1 },
      },
    ],
  },
  {
    id: 'q02',
    prompt: 'You have thirty free minutes on a Friday. Where does your attention drift?',
    options: [
      {
        id: 'q02a',
        label: 'Reading how a peer company is thinking about the market.',
        weights: { forager: 2, scout: 1, alchemist: 1 },
      },
      {
        id: 'q02b',
        label: 'Cleaning up the process doc that everyone half-uses.',
        weights: { archivist: 2, builder: 1, hygienist: 1 },
      },
      {
        id: 'q02c',
        label: 'Checking in with someone on the team who has been quiet.',
        weights: { nurse: 2, regulator: 1, waggle: 1 },
      },
      {
        id: 'q02d',
        label: 'Auditing where risk or debt is quietly accumulating.',
        weights: { hygienist: 2, guardian: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q03',
    prompt: 'A meeting between two teams is going sideways. What move feels most natural?',
    options: [
      {
        id: 'q03a',
        label: 'Name the trade-off no one is saying out loud.',
        weights: { queen: 2, regulator: 1, guardian: 1 },
      },
      {
        id: 'q03b',
        label: 'Translate what each side is actually saying and find the shared shape.',
        weights: { waggle: 2, alchemist: 1, pollinator: 1 },
      },
      {
        id: 'q03c',
        label: 'Suggest we timebox the debate and pilot the smaller option.',
        weights: { catalyst: 2, scout: 1, builder: 1 },
      },
      {
        id: 'q03d',
        label: 'Write down what was actually agreed so we are not relitigating it next month.',
        weights: { archivist: 2, hygienist: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q04',
    prompt: 'What kind of colleague comes to you first when they are stuck?',
    options: [
      {
        id: 'q04a',
        label: 'Someone who needs a hard call made before they can move.',
        weights: { queen: 2, guardian: 1, regulator: 1 },
      },
      {
        id: 'q04b',
        label: 'Someone who needs the process explained without judgment.',
        weights: { nurse: 2, archivist: 1, waggle: 1 },
      },
      {
        id: 'q04c',
        label: 'Someone who needs a partner or a warm intro to unblock them.',
        weights: { pollinator: 2, waggle: 1, forager: 1 },
      },
      {
        id: 'q04d',
        label: 'Someone who is worried about a quality or compliance risk.',
        weights: { hygienist: 2, guardian: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q05',
    prompt: 'When you look at your own calendar, where do you feel most alive?',
    options: [
      {
        id: 'q05a',
        label: 'Long blocks where I can shape strategy or narrative.',
        weights: { queen: 2, alchemist: 2, forager: 1 },
      },
      {
        id: 'q05b',
        label: 'Blocks where I run standups, syncs, or a critical review.',
        weights: { catalyst: 2, waggle: 1, builder: 1 },
      },
      {
        id: 'q05c',
        label: 'One-on-ones with people I am developing.',
        weights: { nurse: 2, regulator: 1, waggle: 1 },
      },
      {
        id: 'q05d',
        label: 'External conversations with customers, partners, and prospects.',
        weights: { pollinator: 2, forager: 1, 'swarm-leader': 1 },
      },
    ],
  },
  {
    id: 'q06',
    prompt: 'The team has to make a fast decision with imperfect data. You...',
    options: [
      {
        id: 'q06a',
        label: 'Call it based on judgment and own the miss if wrong.',
        weights: { queen: 2, 'swarm-leader': 1, scout: 1 },
      },
      {
        id: 'q06b',
        label: 'Look for the smallest reversible version and try it.',
        weights: { scout: 2, catalyst: 1, forager: 1 },
      },
      {
        id: 'q06c',
        label: 'Name the guardrails we need before we move.',
        weights: { guardian: 2, hygienist: 1, sentinel: 1 },
      },
      {
        id: 'q06d',
        label: 'Sync the room so nobody is misaligned on what we are actually deciding.',
        weights: { waggle: 2, regulator: 1, catalyst: 1 },
      },
    ],
  },
  {
    id: 'q07',
    prompt: 'What kind of praise lands hardest for you?',
    options: [
      {
        id: 'q07a',
        label: '"You held the line when everyone else was drifting."',
        weights: { queen: 2, guardian: 1, sentinel: 1 },
      },
      {
        id: 'q07b',
        label: '"Because of your system, this actually kept running."',
        weights: { builder: 2, catalyst: 1, archivist: 1 },
      },
      {
        id: 'q07c',
        label: '"You saw who I was before I did."',
        weights: { nurse: 2, regulator: 1, alchemist: 1 },
      },
      {
        id: 'q07d',
        label: '"You brought us this deal / partner / experiment."',
        weights: { pollinator: 2, forager: 1, 'swarm-leader': 1 },
      },
    ],
  },
  {
    id: 'q08',
    prompt: 'The org is under real stress. What role do you tend to slip into?',
    options: [
      {
        id: 'q08a',
        label: 'The person who takes on more control than the org actually needs.',
        weights: { queen: 1, guardian: 1 },
        stressSignal: 'queen',
      },
      {
        id: 'q08b',
        label: 'The person who ships harder and stops asking whether it matters.',
        weights: { builder: 1, catalyst: 1 },
        stressSignal: 'builder',
      },
      {
        id: 'q08c',
        label: 'The person who absorbs everyone else\'s emotional load.',
        weights: { nurse: 1, regulator: 1 },
        stressSignal: 'nurse',
      },
      {
        id: 'q08d',
        label: 'The person who spins up a new experiment to escape the current problem.',
        weights: { scout: 1, pollinator: 1 },
        stressSignal: 'scout',
      },
    ],
  },
  {
    id: 'q09',
    prompt: 'When a plan finally comes together, what part feels most yours?',
    options: [
      {
        id: 'q09a',
        label: 'The shape of the story: why it matters and where it goes.',
        weights: { alchemist: 2, queen: 1, pollinator: 1 },
      },
      {
        id: 'q09b',
        label: 'The mechanism: the how, the who, the cadence.',
        weights: { catalyst: 2, builder: 1, 'swarm-leader': 1 },
      },
      {
        id: 'q09c',
        label: 'The team: whether they can actually do it.',
        weights: { nurse: 2, waggle: 1, regulator: 1 },
      },
      {
        id: 'q09d',
        label: 'The safeguards: that we made it without breaking anything.',
        weights: { hygienist: 2, guardian: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q10',
    prompt: 'What kind of information do you find yourself hunting for first?',
    options: [
      {
        id: 'q10a',
        label: 'What is happening in the market that changes our terrain?',
        weights: { forager: 2, scout: 1, alchemist: 1 },
      },
      {
        id: 'q10b',
        label: 'What are our own past decisions telling us about the current one?',
        weights: { archivist: 2, hygienist: 1, sentinel: 1 },
      },
      {
        id: 'q10c',
        label: 'What is the actual sentiment among the people doing the work?',
        weights: { nurse: 2, waggle: 1, regulator: 1 },
      },
      {
        id: 'q10d',
        label: 'What partners or ecosystem moves could we make?',
        weights: { pollinator: 2, 'swarm-leader': 1, forager: 1 },
      },
    ],
  },
  {
    id: 'q11',
    prompt: 'A new tool or process is proposed. Your first instinct is to...',
    options: [
      {
        id: 'q11a',
        label: 'Ask what problem it solves that we couldn\'t solve before.',
        weights: { queen: 2, forager: 1, alchemist: 1 },
      },
      {
        id: 'q11b',
        label: 'Run a small pilot in one team and see what actually happens.',
        weights: { scout: 2, catalyst: 1, builder: 1 },
      },
      {
        id: 'q11c',
        label: 'Ask who it changes the work for and whether they were consulted.',
        weights: { regulator: 2, nurse: 1, waggle: 1 },
      },
      {
        id: 'q11d',
        label: 'Ask what breaks, what leaks, and who owns the failure mode.',
        weights: { hygienist: 2, guardian: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q12',
    prompt: 'What phrase do people who know you well use to describe you?',
    options: [
      {
        id: 'q12a',
        label: '"Sees around corners."',
        weights: { queen: 1, forager: 2, scout: 1 },
      },
      {
        id: 'q12b',
        label: '"Makes things run."',
        weights: { catalyst: 2, builder: 1, archivist: 1 },
      },
      {
        id: 'q12c',
        label: '"Makes people better."',
        weights: { nurse: 2, regulator: 1, waggle: 1 },
      },
      {
        id: 'q12d',
        label: '"Keeps us out of trouble."',
        weights: { guardian: 2, hygienist: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q13',
    prompt: 'A major expansion is on the table. Where do you contribute most?',
    options: [
      {
        id: 'q13a',
        label: 'Framing whether this is the right expansion and when.',
        weights: { queen: 2, alchemist: 1, forager: 1 },
      },
      {
        id: 'q13b',
        label: 'Designing the mechanics of how we absorb it.',
        weights: { 'swarm-leader': 2, builder: 1, catalyst: 1 },
      },
      {
        id: 'q13c',
        label: 'Making sure the people surviving it are actually surviving it.',
        weights: { nurse: 2, regulator: 1, waggle: 1 },
      },
      {
        id: 'q13d',
        label: 'Making sure what worked in the old shape is preserved in the new one.',
        weights: { archivist: 2, hygienist: 1, guardian: 1 },
      },
    ],
  },
  {
    id: 'q14',
    prompt: 'You get feedback that lands. It usually comes as...',
    options: [
      {
        id: 'q14a',
        label: 'A direct callout on a trade-off I did not weigh correctly.',
        weights: { queen: 2, guardian: 1, alchemist: 1 },
      },
      {
        id: 'q14b',
        label: 'A show of the actual downstream cost of a rough process.',
        weights: { builder: 2, hygienist: 1, catalyst: 1 },
      },
      {
        id: 'q14c',
        label: 'A quiet word from someone I was not paying attention to.',
        weights: { nurse: 2, regulator: 1, waggle: 1 },
      },
      {
        id: 'q14d',
        label: 'A market signal I dismissed that turned out to be a real move.',
        weights: { forager: 2, scout: 1, pollinator: 1 },
      },
    ],
  },
  {
    id: 'q15',
    prompt: 'Under prolonged pressure, what warning sign should the people around you look for?',
    options: [
      {
        id: 'q15a',
        label: 'I start deciding alone and stop bringing others in.',
        weights: { queen: 1 },
        stressSignal: 'queen',
      },
      {
        id: 'q15b',
        label: 'I start optimizing the machine at the cost of the mission.',
        weights: { builder: 1, catalyst: 1 },
        stressSignal: 'catalyst',
      },
      {
        id: 'q15c',
        label: 'I start caretaking others past the point of being useful to them.',
        weights: { nurse: 1 },
        stressSignal: 'nurse',
      },
      {
        id: 'q15d',
        label: 'I start seeing risk everywhere, becoming the friction I was hired to prevent.',
        weights: { hygienist: 1, guardian: 1 },
        stressSignal: 'hygienist',
      },
    ],
  },
  {
    id: 'q16',
    prompt: 'What kind of work do you resent being pulled into?',
    options: [
      {
        id: 'q16a',
        label: 'Ceremonial process work with no downstream effect.',
        weights: { queen: 1, scout: 1, forager: 1 },
      },
      {
        id: 'q16b',
        label: 'Unstructured strategic debate with no timebox.',
        weights: { builder: 1, catalyst: 2, archivist: 1 },
      },
      {
        id: 'q16c',
        label: 'Political maneuvering where people are not being straight.',
        weights: { regulator: 2, nurse: 1, guardian: 1 },
      },
      {
        id: 'q16d',
        label: 'Rushing through a decision without the risk read.',
        weights: { hygienist: 2, guardian: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q17',
    prompt: 'Which of these describes your relationship to change?',
    options: [
      {
        id: 'q17a',
        label: 'I initiate it and expect others to catch up.',
        weights: { queen: 1, 'swarm-leader': 2, scout: 1 },
      },
      {
        id: 'q17b',
        label: 'I want the plan for it before I move.',
        weights: { catalyst: 1, builder: 2, sentinel: 1 },
      },
      {
        id: 'q17c',
        label: 'I want to know it is safe for the people it will land on.',
        weights: { nurse: 2, regulator: 1, guardian: 1 },
      },
      {
        id: 'q17d',
        label: 'I want to experiment my way into it and read the data.',
        weights: { scout: 2, forager: 1, pollinator: 1 },
      },
    ],
  },
  {
    id: 'q18',
    prompt: 'If your team could keep only one thing you contribute, it should be...',
    options: [
      {
        id: 'q18a',
        label: 'The clarity of where we are actually going.',
        weights: { queen: 2, alchemist: 1, forager: 1 },
      },
      {
        id: 'q18b',
        label: 'The reliability of how we get there.',
        weights: { catalyst: 2, builder: 1, archivist: 1 },
      },
      {
        id: 'q18c',
        label: 'The health of the people making it happen.',
        weights: { nurse: 2, regulator: 1, waggle: 1 },
      },
      {
        id: 'q18d',
        label: 'The soundness of what we ship, and what we do not.',
        weights: { hygienist: 2, guardian: 1, sentinel: 1 },
      },
    ],
  },
  {
    id: 'q19',
    prompt: 'What kind of work makes you feel most in your element?',
    options: [
      {
        id: 'q19a',
        label: 'Turning a raw brief into a story people will remember and act on.',
        weights: { alchemist: 2, queen: 1, pollinator: 1 },
      },
      {
        id: 'q19b',
        label: 'Turning a messy workflow into a system that scales past me.',
        weights: { builder: 2, catalyst: 1, archivist: 1 },
      },
      {
        id: 'q19c',
        label: 'Standing between two functions and getting them to actually hear each other.',
        weights: { waggle: 2, regulator: 1, pollinator: 1 },
      },
      {
        id: 'q19d',
        label: 'Holding the room steady when the stakes turn genuinely uncomfortable.',
        weights: { regulator: 2, guardian: 1, queen: 1 },
      },
    ],
  },
  {
    id: 'q20',
    prompt: 'A colleague asks you to weigh in on their proposal. Your most natural first move?',
    options: [
      {
        id: 'q20a',
        label: 'Play out the failure modes and continuity risks.',
        weights: { sentinel: 2, hygienist: 1, guardian: 1 },
      },
      {
        id: 'q20b',
        label: 'Ask who else needs to be in the room before this gets far.',
        weights: { pollinator: 2, waggle: 1, forager: 1 },
      },
      {
        id: 'q20c',
        label: 'Draft the rollout mechanics: sequence, dependencies, waves.',
        weights: { 'swarm-leader': 2, catalyst: 1, builder: 1 },
      },
      {
        id: 'q20d',
        label: 'Draft a version 0.1 they could ship next week to learn from.',
        weights: { scout: 2, catalyst: 1, builder: 1 },
      },
    ],
  },
  {
    id: 'q21',
    prompt: 'Your job title does not quite cover what you actually do. What is the work underneath it?',
    options: [
      {
        id: 'q21a',
        label: 'Continuity work. Making sure what we built keeps working through change.',
        weights: { sentinel: 2, archivist: 1, guardian: 1 },
      },
      {
        id: 'q21b',
        label: 'Translation work. Making sure the same words mean the same thing across teams.',
        weights: { waggle: 2, regulator: 1, alchemist: 1 },
      },
      {
        id: 'q21c',
        label: 'Bridge work. Making sure external partners feel like part of the story.',
        weights: { pollinator: 2, alchemist: 1, forager: 1 },
      },
      {
        id: 'q21d',
        label: 'Mobilization work. Making sure new people can absorb what is already running.',
        weights: { 'swarm-leader': 2, waggle: 1, builder: 1 },
      },
    ],
  },
];

export const QUESTION_COUNT = QUESTIONS.length;
