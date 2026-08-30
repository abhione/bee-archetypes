import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import {
  ARCHETYPES,
  SYSTEMS,
  AGENTIC_COUNTERPARTS,
  getArchetype,
  getSystem,
  getCounterpart,
  type Archetype,
} from '@/data/archetypes';
import type { AssessmentResult } from '@/data/scoring';
import { cn } from '@/lib/utils';
import { Share2, Copy, Check } from 'lucide-react';

interface StoredResult {
  result: AssessmentResult;
  answers: Record<string, string>;
  completedAt: number;
  startedAt: number;
}

function loadResult(token: string): StoredResult | null {
  try {
    // Prefer sessionStorage (freshly-completed assessment).
    // Fall back to localStorage (shareable link opened later in same browser).
    const raw =
      sessionStorage.getItem(`bee-archetypes:result:${token}`) ??
      localStorage.getItem(`bee-archetypes:result:${token}`);
    if (!raw) return null;
    return JSON.parse(raw) as StoredResult;
  } catch {
    return null;
  }
}

export default function ResultsPage() {
  const { token } = useParams<{ token: string }>();
  const [stored, setStored] = useState<StoredResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setNotFound(true);
      return;
    }
    const s = loadResult(token);
    if (s) setStored(s);
    else setNotFound(true);
  }, [token]);

  const shareUrl = useMemo(
    () => (typeof window !== 'undefined' && token ? `${window.location.origin}/results/${token}` : ''),
    [token],
  );

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const handleShare = async () => {
    if (!shareUrl || !stored) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I'm the ${getArchetype(stored.result.primary).name} · Bee Archetypes`,
          text: `I just took the Bee Archetypes assessment. My primary bee: ${getArchetype(stored.result.primary).name}.`,
          url: shareUrl,
        });
      } catch {
        /* user canceled */
      }
    } else {
      handleCopy();
    }
  };

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="text-sm uppercase tracking-widest text-hive-mist">Result not found</p>
        <h1 className="mt-3 font-serif text-4xl text-hive-cream">
          This result has expired.
        </h1>
        <p className="mt-6 text-hive-mist">
          Results live in your browser session. Take the assessment again to see your archetype.
        </p>
        <Link
          to="/assessment"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
        >
          Take the assessment
        </Link>
      </div>
    );
  }

  if (!stored) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="text-hive-mist font-serif italic">Loading your result…</p>
      </div>
    );
  }

  const { result } = stored;
  const primary = getArchetype(result.primary);
  const primarySystem = getSystem(primary.systemId);
  const secondaries = result.secondaries.map(getArchetype);
  const shadow = getArchetype(result.shadow);
  const balance = result.balance.map(getArchetype);
  const counterpart = getCounterpart(result.counterpartKey);

  return (
    <div className="mx-auto max-w-4xl px-6 pt-16 pb-32">
      {/* Primary reveal */}
      <PrimaryReveal primary={primary} systemLabel={primarySystem.label} />

      {/* Team CTA — moment-of-delight after the reveal, before secondaries */}
      <section className="mt-16">
        <div className="rounded-card border border-hive-honey/30 bg-gradient-to-br from-hive-honey/5 via-hive-charcoal/60 to-hive-charcoal/60 p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-widest text-hive-mist mb-2">
              For teams
            </p>
            <p className="font-serif text-xl md:text-2xl text-hive-cream leading-snug">
              You're a {primary.name}. See where the rest of your team lives.
            </p>
          </div>
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors group flex-shrink-0"
          >
            Bring to your team
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </Link>
        </div>
      </section>

      {/* Secondaries */}
      <section className="mt-24">
        <SectionHeader kicker="Also strongly present" title="Your secondary bees" />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {secondaries.map((a) => (
            <ArchetypeCard key={a.id} archetype={a} />
          ))}
        </div>
      </section>

      {/* Shadow */}
      <section className="mt-24">
        <SectionHeader
          kicker="Where you go under stress"
          title="Your shadow bee"
          note="Not a flaw. A load-bearing pattern that breaks under load."
        />
        <div className="mt-8">
          <ArchetypeCard archetype={shadow} accent="shadow" />
        </div>
      </section>

      {/* Balance */}
      <section className="mt-24">
        <SectionHeader
          kicker="Who complements you"
          title="Your balance bees"
          note="Hire, partner with, or lean on these archetypes when you can."
        />
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {balance.map((a) => (
            <ArchetypeCard key={a.id} archetype={a} compact />
          ))}
        </div>
      </section>

      {/* Agentic Counterpart */}
      <section className="mt-24">
        <SectionHeader kicker="The AI pairing" title={`Your Agentic Counterpart: the ${counterpart.name}`} />
        <div className="mt-8 rounded-card border border-hive-honey/40 bg-gradient-to-br from-hive-honey/10 via-hive-charcoal/60 to-hive-charcoal/60 p-8 md:p-10">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-pill bg-hive-honey/20 border border-hive-honey/40 flex items-center justify-center">
              <span className="font-serif text-xl text-hive-honey">{counterpart.key[0]}</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-hive-mist">
                For the {primary.name}
              </p>
              <h3 className="font-serif text-2xl text-hive-cream mt-1">
                The {counterpart.name}
              </h3>
            </div>
          </div>
          <p className="text-hive-cream/85 text-lg leading-relaxed mb-4">
            {counterpart.description}
          </p>
          {primary.content.aiPairing && (
            <p className="text-hive-cream/85 text-lg leading-relaxed italic border-l-2 border-hive-honey pl-4">
              {primary.content.aiPairing}
            </p>
          )}
          <p className="mt-6 text-xs uppercase tracking-widest text-hive-mist">
            Q1 2027 · Hive Leadership OS
          </p>
        </div>
      </section>

      {/* Share + team CTA */}
      <section className="mt-24">
        <div className="rounded-card bg-hive-charcoal/80 border border-hive-slate/50 p-8 md:p-10">
          <h3 className="font-serif text-2xl text-hive-cream mb-4">
            Share your archetype
          </h3>
          <p className="text-hive-mist mb-6">
            Send this to a colleague or manager and see how your archetypes complement.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill border border-hive-slate/60 text-hive-cream hover:border-hive-slate hover:bg-hive-charcoal transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-hive-honey" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-card bg-hive-charcoal/80 border border-hive-slate/50 p-8 md:p-10">
          <h3 className="font-serif text-2xl text-hive-cream mb-4">
            Want to see this for your whole team?
          </h3>
          <p className="text-hive-mist mb-6">
            Invite up to 25 members, see coverage across the five organizational
            systems, and get the executive readout tailored to your role.
          </p>
          <Link
            to="/get-started"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
          >
            Bring Bee Archetypes to your team →
          </Link>
        </div>
      </section>
    </div>
  );
}

interface SectionHeaderProps {
  kicker: string;
  title: string;
  note?: string;
}
function SectionHeader({ kicker, title, note }: SectionHeaderProps) {
  return (
    <>
      <p className="text-sm uppercase tracking-widest text-hive-mist">{kicker}</p>
      <h2 className="mt-3 font-serif text-3xl md:text-4xl text-hive-cream">{title}</h2>
      {note && <p className="mt-3 text-hive-mist italic">{note}</p>}
    </>
  );
}

interface PrimaryRevealProps {
  primary: Archetype;
  systemLabel: string;
}
function PrimaryReveal({ primary, systemLabel }: PrimaryRevealProps) {
  return (
    <motion.section
      initial={{ opacity: 1, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="text-center pt-8"
    >
      <p className="text-sm uppercase tracking-widest text-hive-mist mb-4">
        Your primary bee
      </p>
      <p className="text-xs uppercase tracking-widest text-hive-honey mb-2">
        {primary.system} · {systemLabel}
      </p>
      <h1 className="font-serif text-7xl md:text-9xl text-hive-cream leading-none tracking-tight">
        {primary.name}
      </h1>
      {primary.content.oneLiner && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.9 }}
          className="mt-8 font-serif text-2xl italic text-hive-cream/85 max-w-2xl mx-auto"
        >
          {primary.content.oneLiner}
        </motion.p>
      )}
      {primary.content.contribution && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.9 }}
          className="mt-10 text-lg text-hive-cream/85 leading-relaxed max-w-2xl mx-auto"
        >
          {primary.content.contribution}
        </motion.p>
      )}
    </motion.section>
  );
}

interface ArchetypeCardProps {
  archetype: Archetype;
  accent?: 'default' | 'shadow';
  compact?: boolean;
}
function ArchetypeCard({ archetype, accent = 'default', compact = false }: ArchetypeCardProps) {
  const isShadow = accent === 'shadow';
  return (
    <div
      className={cn(
        'p-6 rounded-card border transition-colors',
        isShadow
          ? 'border-hive-red/40 bg-hive-red/5'
          : 'border-hive-slate/50 bg-hive-charcoal/60',
      )}
    >
      <p className="text-xs uppercase tracking-widest text-hive-mist mb-3">
        {archetype.system} · {archetype.systemLabel}
      </p>
      <h3 className={cn('font-serif mb-2', compact ? 'text-xl' : 'text-2xl', isShadow ? 'text-hive-red' : 'text-hive-honey')}>
        {archetype.name}
      </h3>
      {archetype.content.oneLiner && (
        <p className="italic text-hive-cream/80 mb-3">{archetype.content.oneLiner}</p>
      )}
      {!compact && archetype.content[isShadow ? 'shadow' : 'contribution'] && (
        <p className="text-sm text-hive-cream/75 leading-relaxed">
          {archetype.content[isShadow ? 'shadow' : 'contribution']}
        </p>
      )}
    </div>
  );
}

// Suppress unused-import lint noise (used only for type-import positioning).
void ARCHETYPES;
void SYSTEMS;
void AGENTIC_COUNTERPARTS;
