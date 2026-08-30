import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  SYSTEMS,
  archetypesInSystem,
  AGENTIC_COUNTERPARTS,
  ARCHETYPES,
} from '@/data/archetypes';

function findArchetypeByCounterpartKey(key: string) {
  // A counterpart key like 'Queen' matches the archetype whose name IS Queen —
  // not just any archetype that lists this counterpart as a pairing.
  return ARCHETYPES.find((a) => a.name === key) ?? null;
}

export default function MethodPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 pt-12 pb-24">
      <motion.header
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-14"
      >
        <p className="text-sm uppercase tracking-widest text-hive-honey">The method</p>
        <h1 className="mt-3 font-serif text-5xl md:text-6xl text-hive-cream leading-tight">
          Every hive runs on the same patterns.
          <br />
          <span className="italic text-hive-honey">You just haven't named them yet.</span>
        </h1>
        <p className="mt-6 text-lg text-hive-mist leading-relaxed max-w-2xl">
          Bee Archetypes is a shared language for how work actually flows through an
          organization. Titles say one thing. The patterns people contribute when the
          work is real say another.
        </p>
      </motion.header>

      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-16"
      >
        <p className="text-sm uppercase tracking-widest text-hive-mist">01 &middot; The frame</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl text-hive-cream">
          Fifteen archetypes across five systems.
        </h2>
        <p className="mt-4 text-hive-mist leading-relaxed">
          A hive is not one thing. It is five interlocking systems, each with its
          own posture, cadence, and contribution. Every archetype belongs to one
          system as its home. Real operators show up across two or three, with one
          always dominant and one usually invisible.
        </p>

        <div className="mt-10 space-y-6">
          {SYSTEMS.map((s) => {
            const inSystem = archetypesInSystem(s.id);
            return (
              <div key={s.id} className="rounded-card border border-hive-slate/50 bg-hive-charcoal/60 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-hive-honey">{s.code}</p>
                    <h3 className="mt-1 font-serif text-2xl text-hive-cream">{s.label}</h3>
                    <p className="mt-2 text-hive-cream/80">{s.description}</p>
                  </div>
                  <p className="text-xs uppercase tracking-widest text-hive-mist tabular-nums">
                    {inSystem.length} archetypes
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {inSystem.map((a) => (
                    <span
                      key={a.id}
                      className="px-3 py-1 rounded-pill border border-hive-slate/60 bg-hive-black/40 text-sm text-hive-cream/90"
                    >
                      {a.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-16"
      >
        <p className="text-sm uppercase tracking-widest text-hive-mist">02 &middot; The assessment</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl text-hive-cream">
          21 questions. Weighted vectors. Deterministic scoring.
        </h2>
        <p className="mt-4 text-hive-mist leading-relaxed">
          Each of the 21 questions offers four responses. Every response carries a
          weight vector across all 15 archetypes: usually one primary weight
          (value 2), one or two secondary weights (value 1), and zeros for the rest.
        </p>
        <p className="mt-4 text-hive-mist leading-relaxed">
          Your answers sum into a 15-dimensional vector. The highest total is your
          <em> primary bee</em>. The two next-highest are your secondaries. The
          lowest one that still appeared meaningfully is your <em>shadow</em>: the
          pattern you avoid, resist, or leave on the floor. Two archetypes with
          opposite tensions become your <em>balance recommendations</em>.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Primary', desc: 'Your dominant pattern: where you naturally live.' },
            { label: 'Shadow', desc: "The archetype you avoid. Usually where your team wants you to grow." },
            { label: 'Balance', desc: 'Two patterns that would counter-weight yours: hire, partner, or develop.' },
          ].map((x) => (
            <div key={x.label} className="p-5 rounded-card border border-hive-slate/50 bg-hive-charcoal/60">
              <p className="text-xs uppercase tracking-widest text-hive-honey">{x.label}</p>
              <p className="mt-2 text-sm text-hive-cream/85">{x.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-16"
      >
        <p className="text-sm uppercase tracking-widest text-hive-mist">03 &middot; Agentic counterparts</p>
        <h2 className="mt-2 font-serif text-3xl md:text-4xl text-hive-cream">
          Every archetype will pair with an AI counterpart.
        </h2>
        <p className="mt-4 text-hive-mist leading-relaxed">
          The end-game of Bee Archetypes is not a personality quiz. It is a coordination
          language for humans and AI agents working together. Each archetype pattern gets
          a matching AI counterpart. It sharpens the pattern. It never replaces the person
          carrying it.
        </p>
        <p className="mt-4 text-hive-mist leading-relaxed">
          The first three counterparts ship in Q1 2027:
        </p>
        <div className="mt-8 space-y-4">
          {AGENTIC_COUNTERPARTS.map((c) => {
            const a = findArchetypeByCounterpartKey(c.key);
            const anchorSystem = SYSTEMS.find((s) => s.id === c.systemAnchor);
            return (
              <div key={c.key} className="p-6 rounded-card border border-hive-honey/40 bg-gradient-to-br from-hive-honey/5 to-hive-charcoal/60">
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h3 className="font-serif text-2xl text-hive-cream">
                    {a?.name ?? c.key} <span className="text-hive-mist">&rarr;</span> {c.name}
                  </h3>
                  <p className="text-xs uppercase tracking-widest text-hive-honey tabular-nums">
                    Q1 2027
                  </p>
                </div>
                {anchorSystem && (
                  <p className="text-xs uppercase tracking-widest text-hive-mist mb-2">
                    {anchorSystem.code} &middot; {anchorSystem.label}
                  </p>
                )}
                <p className="text-hive-cream/85">{c.description}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="rounded-card border border-hive-honey/40 bg-hive-honey/5 p-8 md:p-10 text-center"
      >
        <h2 className="font-serif text-3xl md:text-4xl text-hive-cream">
          See which pattern lives in you.
        </h2>
        <p className="mt-3 text-hive-mist">Takes about three minutes. Free for individuals.</p>
        <Link
          to="/assessment"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
        >
          Take the assessment
        </Link>
      </motion.section>

      <p className="mt-16 text-xs text-hive-mist italic text-center">
        The method is a living document. It evolves as the community works with it.
        The first 15 archetypes were named by Rachael Kelly and Mimi Zou at Hive.
      </p>
    </div>
  );
}
