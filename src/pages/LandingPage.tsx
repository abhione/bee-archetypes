import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TEASER_ARCHETYPES = [
  {
    system: 'Sun',
    name: 'Queen',
    label: 'Direction & Strategy',
    oneLiner: 'The judgment carrier.',
    accent: 'text-system-sun',
    dotBg: 'bg-system-sun',
  },
  {
    system: 'Comb',
    name: 'Catalyst',
    label: 'Execution & Structure',
    oneLiner: 'The cadence keeper.',
    accent: 'text-system-comb',
    dotBg: 'bg-system-comb',
  },
  {
    system: 'Guard',
    name: 'Hygienist',
    label: 'Risk & Protection',
    oneLiner: 'The debt-drift detector.',
    accent: 'text-system-guard',
    dotBg: 'bg-system-guard',
  },
];

/**
 * Reveal animation variants. Content is ALWAYS visible by default; motion only
 * plays if it can. This prevents any headless-render / animation-scheduler
 * failure mode from hiding content.
 */
const revealVariants = {
  hidden: { opacity: 1, y: 0 },
  visible: { opacity: 1, y: 0 },
};

const softRise = {
  hidden: { opacity: 1, y: 6 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function LandingPage() {
  return (
    <div className="mx-auto max-w-6xl px-6">
      {/* Hero */}
      <section className="pt-24 pb-32 md:pt-32 md:pb-40">
        <motion.div initial="hidden" animate="visible" variants={softRise}>
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-hive-charcoal/80 border border-hive-slate/60 text-xs uppercase tracking-widest text-hive-mist">
            <span className="w-1.5 h-1.5 rounded-full bg-hive-honey animate-pulse" />
            The Bee Archetypes assessment · beta
          </span>
          <h1 className="mt-8 font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-hive-cream max-w-4xl">
            See how work actually{' '}
            <span className="honey-underline">flows through you</span>.
          </h1>
          <p className="mt-8 text-xl text-hive-mist max-w-2xl leading-relaxed">
            A three-minute assessment that names your natural contribution, then pairs it
            with the Agentic Counterpart that would amplify it most.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link
              to="/assessment"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors group"
            >
              Take the assessment
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to="/get-started"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-pill border border-hive-slate/60 text-hive-cream hover:border-hive-honey hover:text-hive-honey transition-colors group"
            >
              For teams
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              to="/method"
              className="inline-flex items-center gap-2 px-4 py-3 text-hive-mist hover:text-hive-cream transition-colors"
            >
              Read the method
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Teaser archetypes */}
      <section className="pb-32">
        <motion.div initial="hidden" animate="visible" variants={revealVariants} className="mb-10">
          <p className="text-sm uppercase tracking-widest text-hive-mist">
            Fifteen archetypes across five systems
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl text-hive-cream max-w-2xl">
            Every archetype pairs with an{' '}
            <span className="italic text-hive-honey">Agentic Counterpart</span>.
          </h2>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEASER_ARCHETYPES.map((a, i) => (
            <div
              key={a.name}
              className="p-6 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 hover:border-hive-honey/40 transition-colors group"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className={cn('w-2 h-2 rounded-full', a.dotBg)} />
                <span className="text-xs uppercase tracking-widest text-hive-mist">
                  {a.system} · {a.label}
                </span>
              </div>
              <h3 className={cn('font-serif text-2xl mb-2', a.accent)}>{a.name}</h3>
              <p className="text-hive-cream/80 italic">{a.oneLiner}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="pb-32">
        <div className="rounded-card bg-hive-charcoal/80 border border-hive-slate/50 p-10 md:p-14">
          <p className="text-sm uppercase tracking-widest text-hive-mist">
            For teams & organizations
          </p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl text-hive-cream max-w-2xl">
            Ready to see how your whole hive is shaped?
          </h2>
          <p className="mt-4 text-lg text-hive-mist max-w-2xl leading-relaxed">
            Invite up to 25 team members, see coverage across the five organizational
            systems, and get the executive readout tailored to your role.
          </p>
          <Link
            to="/get-started"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors group"
          >
            See your team's coverage
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
