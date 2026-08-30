import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getOrg, getOrgMetadata, type Org } from '@/data/orgStore';
import { getBuyerPersona } from '@/data/buyerPersonas';
import {
  ARCHETYPES,
  SYSTEMS,
  getArchetype,
  getSystem,
  archetypesInSystem,
  type SystemId,
  type ArchetypeId,
} from '@/data/archetypes';
import {
  DEMO_TEAM,
  computeCoverage,
  computeMissingArchetypes,
  type DemoMember,
} from '@/data/demoTeam';
import { AlertTriangle, Users, Sparkles } from 'lucide-react';
import { useOrganization } from '@clerk/clerk-react';

type DataMode = 'demo' | 'live';

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function OrgDashboardPage() {
  const { slug } = useParams<{ slug: string }>();
  const { organization: clerkOrg, isLoaded: clerkOrgLoaded } = useOrganization();
  const [org, setOrg] = useState<Org | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<DataMode>('demo');

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    if (CLERK_ENABLED) {
      // Wait until Clerk finishes hydrating so we don't false-negative.
      if (!clerkOrgLoaded) return;
      if (clerkOrg && clerkOrg.slug === slug) {
        const meta = getOrgMetadata(clerkOrg.id);
        const synthesized: Org = {
          slug: clerkOrg.slug ?? slug,
          name: clerkOrg.name,
          buyerPersona: meta?.buyerPersona ?? 'people-leader',
          industry: meta?.industry ?? '',
          sizeRange: meta?.sizeRange ?? '11-50',
          currentChallenge: meta?.currentChallenge ?? 'growth-phase',
          ownerEmail: '',
          createdAt: clerkOrg.createdAt?.getTime?.() ?? Date.now(),
          invites: [],
        };
        setOrg(synthesized);
        setLoading(false);
        return;
      }
      // Fall through to legacy localStorage lookup for orgs created before Clerk was wired.
    }
    const o = getOrg(slug);
    if (o) setOrg(o);
    else setNotFound(true);
    setLoading(false);
  }, [slug, clerkOrg, clerkOrgLoaded]);

  const activeTeam: readonly DemoMember[] = useMemo(() => {
    // Live mode: promote completed invitees to team members.
    // In beta all invites are unfilled so live mode is empty. Demo mode always
    // shows the seeded 12-person team.
    if (dataMode === 'demo') return DEMO_TEAM;
    if (!org) return [];
    const live: DemoMember[] = [];
    for (const inv of org.invites) {
      if (inv.completedAt && inv.archetypeId) {
        live.push({
          id: `inv-${inv.email}`,
          name: inv.email.split('@')[0].replace('.', ' '),
          title: inv.role ?? 'Team member',
          archetype: inv.archetypeId as ArchetypeId,
          secondaries: ['catalyst', 'scout'] as [ArchetypeId, ArchetypeId],
          shadow: 'guardian',
          completedAt: inv.completedAt - Date.now(),
        });
      }
    }
    return live;
  }, [dataMode, org]);

  const coverage = useMemo(() => computeCoverage(activeTeam), [activeTeam]);
  const missing = useMemo(() => computeMissingArchetypes(activeTeam), [activeTeam]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 pt-12 pb-24">
        <p className="text-hive-mist">Loading your hive…</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="text-sm uppercase tracking-widest text-hive-mist">Org not found</p>
        <h1 className="mt-3 font-serif text-4xl text-hive-cream">
          This hive does not exist.
        </h1>
        <Link
          to="/get-started"
          className="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
        >
          Create a hive
        </Link>
      </div>
    );
  }
  if (!org) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center">
        <p className="text-hive-mist font-serif italic">Loading dashboard…</p>
      </div>
    );
  }

  const persona = getBuyerPersona(org.buyerPersona);
  const completedCount = activeTeam.length;
  const invitedCount = org.invites.length;

  return (
    <div className="mx-auto max-w-7xl px-6 pt-10 pb-24">
      {/* Header */}
      <motion.header
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm uppercase tracking-widest text-hive-honey">
            {persona.dashboardFraming.heroKicker}
          </p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl text-hive-cream">
            {org.name}
          </h1>
          <p className="mt-2 text-hive-mist">
            {org.industry} · {org.sizeRange} people
          </p>
        </div>
        <ModeToggle
          mode={dataMode}
          onChange={setDataMode}
          demoTeamSize={DEMO_TEAM.length}
          liveTeamSize={
            org.invites.filter((i) => i.completedAt).length
          }
          invitedCount={invitedCount}
        />
      </motion.header>

      {/* Hero readout */}
      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-12 rounded-card border border-hive-honey/40 bg-gradient-to-br from-hive-honey/10 via-hive-charcoal/60 to-hive-charcoal/60 p-8 md:p-10"
      >
        <div className="flex items-start gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-hive-honey mt-1 flex-shrink-0" />
          <div>
            <h2 className="font-serif text-3xl text-hive-cream">
              {persona.dashboardFraming.heroTitle}
            </h2>
            <p className="mt-2 text-hive-mist">
              {persona.dashboardFraming.heroLede}
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 md:gap-8 pt-6 border-t border-hive-slate/40">
          <Stat label="Team members" value={completedCount} suffix="assessed" />
          <Stat
            label="Systems covered"
            value={coverage.filter((c) => c.memberCount > 0).length}
            suffix={`of ${SYSTEMS.length}`}
          />
          <Stat
            label="Missing archetypes"
            value={missing.length}
            suffix={`of ${ARCHETYPES.length}`}
          />
        </div>
      </motion.section>

      {/* Coverage map */}
      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-12"
      >
        <SectionHeader kicker="Five systems" title="How work flows through your hive" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
          {SYSTEMS.map((s) => {
            const cov = coverage.find((c) => c.systemId === s.id);
            const filled = cov?.memberCount ?? 0;
            const total = archetypesInSystem(s.id).length;
            return <SystemCard key={s.id} systemId={s.id} filled={filled} total={total} />;
          })}
        </div>
      </motion.section>

      {/* Missing archetype alerts */}
      {missing.length > 0 && (
        <motion.section
          initial={{ opacity: 1, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <SectionHeader
            kicker="Coverage gaps"
            title="Archetypes not represented on your team"
            note="Not all archetypes need to be in-house. But when the pattern is missing entirely, its work does not get done — it just gets called a 'blocker' six months from now."
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {missing.slice(0, 6).map((aid) => {
              const a = getArchetype(aid);
              return (
                <div
                  key={aid}
                  className="p-5 rounded-card border border-hive-red/30 bg-hive-red/5"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-hive-red mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-hive-mist mb-1">
                        {a.system} · {a.systemLabel}
                      </p>
                      <h3 className="font-serif text-xl text-hive-cream">{a.name}</h3>
                      {a.content.oneLiner && (
                        <p className="mt-2 text-sm text-hive-cream/75 italic">
                          {a.content.oneLiner}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Team composition */}
      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
        className="mb-12"
      >
        <SectionHeader
          kicker="Team composition"
          title="Who lives where in the hive"
        />
        <div className="mt-6 rounded-card border border-hive-slate/50 bg-hive-charcoal/60 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-hive-slate/40">
                <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-hive-mist font-normal">
                  Name
                </th>
                <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-hive-mist font-normal">
                  Title
                </th>
                <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-hive-mist font-normal">
                  Primary bee
                </th>
                <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-hive-mist font-normal">
                  System
                </th>
                <th className="text-left py-4 px-6 text-xs uppercase tracking-widest text-hive-mist font-normal">
                  Shadow
                </th>
              </tr>
            </thead>
            <tbody>
              {activeTeam.map((m) => {
                const arch = getArchetype(m.archetype);
                const sys = getSystem(arch.systemId);
                const shadowArch = getArchetype(m.shadow);
                return (
                  <tr
                    key={m.id}
                    className="border-b border-hive-slate/20 hover:bg-hive-charcoal/80 transition-colors"
                  >
                    <td className="py-4 px-6 text-hive-cream">{m.name}</td>
                    <td className="py-4 px-6 text-hive-mist">{m.title}</td>
                    <td className="py-4 px-6 font-serif text-hive-honey">{arch.name}</td>
                    <td className="py-4 px-6 text-hive-mist">{sys.code}</td>
                    <td className="py-4 px-6 text-hive-cream/60 italic">
                      {shadowArch.name}
                    </td>
                  </tr>
                );
              })}
              {activeTeam.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-hive-mist italic">
                    No live results yet. Toggle to demo mode to preview what
                    this becomes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.section>

      {/* Executive readout — persona-tailored */}
      <motion.section
        initial={{ opacity: 1, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <SectionHeader
          kicker="Executive readout"
          title={
            persona.id === 'people-leader'
              ? 'The talent read on your hive'
              : 'The capacity read on your hive'
          }
        />
        <div className="mt-6 rounded-card border border-hive-slate/50 bg-hive-charcoal/60 p-8 md:p-10">
          <ExecutiveReadout
            personaId={persona.id}
            team={activeTeam}
            missing={missing}
            coverage={coverage}
            orgName={org.name}
          />
          <p className="mt-6 pt-6 border-t border-hive-slate/40 text-xs uppercase tracking-widest text-hive-mist">
            Generated deterministically from your team's assessment vector. In
            production, the {persona.label} readout is refreshed weekly.
          </p>
        </div>
      </motion.section>
    </div>
  );
}

interface StatProps {
  label: string;
  value: number | string;
  suffix?: string;
}
function Stat({ label, value, suffix }: StatProps) {
  return (
    <div>
      <p className="text-xs uppercase tracking-widest text-hive-mist">{label}</p>
      <p className="mt-1 font-serif text-4xl text-hive-cream tabular-nums">{value}</p>
      {suffix && <p className="mt-1 text-xs text-hive-mist">{suffix}</p>}
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
      <h2 className="mt-2 font-serif text-3xl text-hive-cream">{title}</h2>
      {note && <p className="mt-3 text-hive-mist italic max-w-3xl">{note}</p>}
    </>
  );
}

function SystemCard({
  systemId,
  filled,
  total,
}: {
  systemId: SystemId;
  filled: number;
  total: number;
}) {
  const s = getSystem(systemId);
  // 'filled' is member count in this system (can exceed 'total' if multiple people
  // share an archetype). Coverage % caps at 100.
  const pct = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0;
  const barClass = cn(
    'h-1.5 rounded-pill mt-3 overflow-hidden',
    filled === 0 ? 'bg-hive-red/20' : 'bg-hive-slate/40',
  );
  return (
    <div className="p-5 rounded-card border border-hive-slate/50 bg-hive-charcoal/60">
      <p className="text-xs uppercase tracking-widest text-hive-mist mb-1">
        {s.code}
      </p>
      <p className="text-sm text-hive-cream/85 mb-3">{s.label}</p>
      <div className="flex items-baseline gap-1.5">
        <span className="font-serif text-3xl text-hive-cream tabular-nums">
          {filled}
        </span>
        <span className="text-sm text-hive-mist">
          {filled === 0
            ? 'people'
            : filled === 1
              ? 'person'
              : 'people'}
        </span>
      </div>
      <div className={barClass}>
        <div
          className={cn(
            'h-full rounded-pill',
            filled === 0 ? 'bg-hive-red/60' : 'bg-hive-honey',
          )}
          style={{ width: `${Math.max(pct, filled > 0 ? 8 : 0)}%` }}
        />
      </div>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
  demoTeamSize,
  liveTeamSize,
  invitedCount,
}: {
  mode: DataMode;
  onChange: (m: DataMode) => void;
  demoTeamSize: number;
  liveTeamSize: number;
  invitedCount: number;
}) {
  return (
    <div className="flex flex-col items-end">
      <div className="inline-flex rounded-pill border border-hive-slate/60 overflow-hidden">
        {(['demo', 'live'] as const).map((m) => {
          const isActive = mode === m;
          const count = m === 'demo' ? demoTeamSize : liveTeamSize;
          return (
            <button
              key={m}
              type="button"
              onClick={() => onChange(m)}
              className={cn(
                'px-4 py-1.5 text-xs uppercase tracking-widest transition-colors flex items-center gap-2',
                isActive
                  ? 'bg-hive-honey text-hive-black font-medium'
                  : 'text-hive-mist hover:text-hive-cream hover:bg-hive-charcoal',
              )}
            >
              <Users className="w-3 h-3" />
              {m} · {count}
            </button>
          );
        })}
      </div>
      {invitedCount > 0 && (
        <p className="mt-2 text-xs text-hive-mist italic">
          {invitedCount} invitee{invitedCount === 1 ? '' : 's'} awaiting completion
        </p>
      )}
    </div>
  );
}

function ExecutiveReadout({
  personaId,
  team,
  missing,
  coverage,
  orgName,
}: {
  personaId: 'people-leader' | 'business-leader';
  team: readonly DemoMember[];
  missing: ArchetypeId[];
  coverage: ReturnType<typeof computeCoverage>;
  orgName: string;
}) {
  if (team.length === 0) {
    return (
      <p className="text-hive-mist italic">
        No results yet. The executive readout populates once your team completes their
        assessments.
      </p>
    );
  }

  // Compute team stats
  const bySystem = new Map<SystemId, number>();
  for (const m of team) {
    const a = getArchetype(m.archetype);
    bySystem.set(a.systemId, (bySystem.get(a.systemId) ?? 0) + 1);
  }
  const dominantSystemEntry = [...bySystem.entries()].sort(([, a], [, b]) => b - a)[0];
  const dominantSystem = dominantSystemEntry ? getSystem(dominantSystemEntry[0]) : null;

  const weakestSystemEntry = coverage
    .filter((c) => c.memberCount === 0)
    .map((c) => getSystem(c.systemId))[0];

  const missingNames = missing.slice(0, 3).map((id) => getArchetype(id).name);

  if (personaId === 'people-leader') {
    return (
      <div className="space-y-4 text-hive-cream/85 leading-relaxed">
        <p>
          Your hive is anchored in {dominantSystem?.code ?? 'no dominant'} —{' '}
          {dominantSystem?.label ?? 'no clear direction'}. That is where{' '}
          {dominantSystemEntry?.[1] ?? 0} of {team.length} of your operators live.
          It shapes the culture people feel when they land in {orgName}.
        </p>
        {weakestSystemEntry && (
          <p>
            The <span className="text-hive-honey">{weakestSystemEntry.code}</span>{' '}
            system is not represented among your assessed team. That does not
            mean the work is not happening. It means it is happening as invisible
            labor, usually falling on the same one or two people, and it is
            probably where your next attrition risk lives.
          </p>
        )}
        {missingNames.length > 0 && (
          <p>
            Three specific archetypes not on the map:{' '}
            <span className="text-hive-honey">{missingNames.join(', ')}</span>.
            Before hiring, ask whether one of your existing team members is
            secretly playing that role — and whether they are being credited for
            it.
          </p>
        )}
        <p className="italic text-hive-mist">
          Recommended next move: run one-on-ones with the members whose shadow bee
          appears three or more times across the team. That is the load-bearing
          pattern of your hive under stress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-hive-cream/85 leading-relaxed">
      <p>
        Your operational center of gravity is{' '}
        <span className="text-hive-honey">{dominantSystem?.code ?? 'unclear'}</span>{' '}
        ({dominantSystem?.label ?? 'no dominant direction'}). That is your
        organization's real bias, regardless of what the strategy deck says.
      </p>
      {weakestSystemEntry && (
        <p>
          You are exposed on {weakestSystemEntry.code} —{' '}
          {weakestSystemEntry.label.toLowerCase()}. Zero of your assessed team
          shows a primary in this system. In a{' '}
          {dominantSystem?.code === 'Sun' ? 'strategy-first' : 'execution-first'}{' '}
          hive that gap is usually where the next preventable crisis emerges.
        </p>
      )}
      {missingNames.length > 0 && (
        <p>
          Three archetypes worth engineering into your next quarter:{' '}
          <span className="text-hive-honey">{missingNames.join(', ')}</span>.
          Either through hire, contractor, agentic counterpart, or explicit
          role assignment on someone already inside.
        </p>
      )}
      <p className="italic text-hive-mist">
        Recommended next move: name the person on your team whose primary and
        shadow are one pattern apart. That person is your highest-leverage
        development bet this quarter.
      </p>
    </div>
  );
}