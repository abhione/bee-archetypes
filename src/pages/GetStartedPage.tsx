/**
 * GetStartedPage — the 3-step signup wizard.
 *
 * FLOW
 * ====
 *   Step 1 (persona)  → pick People-Leader or Business-Leader
 *   Step 2 (org)      → org name, industry, size, current challenge
 *   Step 3 (invite)   → invite emails (skippable)
 *   Step 4 (done)     → confirmation → navigate to /org/:slug/dashboard
 *
 * CLERK INTEGRATION
 * =================
 * `handleCreateOrg` calls `createOrganization({ name, slug })` from
 * `useOrganizationList()`. Clerk creates the org server-side, returns a shape
 * with `.id` and `.slug`. We then:
 *   1. Call `saveOrgMetadata(clerkOrg.id, {...})` — our extra fields
 *      (buyerPersona, industry, sizeRange, currentChallenge) into localStorage
 *   2. Call `setActive({ organization: clerkOrg.id })` so subsequent hooks see it
 *   3. Advance the wizard to Step 3
 *
 * WHY WE DON'T CALL `clerkOrg.update({ publicMetadata })`
 * =====================================================
 * Client SDK returns HTTP 403 for publicMetadata mutations. Server-side write
 * would work but requires a backend, which we don't have yet. Deferred to
 * Wave 7 SQLite migration.
 *
 * HOOKS-INSIDE-CALLBACK RULE
 * ==========================
 * `handleInvites` reads `activeOrganization` from `useOrganization()` — a hook
 * called at the TOP of the component (see line 27). Do NOT call `useOrganization`
 * or `useOrganizationList` inside `handleInvites` or React will throw
 * "hooks must be called in the same order every render."
 *
 * INVITE FLOW
 * ===========
 * Loops over parsed emails, calls `activeOrganization.inviteMember({ emailAddress,
 * role: 'org:member' })`. Individual errors (typo emails, dupes) are swallowed
 * so one bad email doesn't kill the whole batch.
 *
 * FALLBACK MODE
 * =============
 * When `VITE_CLERK_PUBLISHABLE_KEY` is unset, `createOrganization` from
 * `useOrganizationList()` is undefined and we fall through to `createOrg()`
 * (the pure localStorage function in orgStore.ts). Invites go to
 * `inviteMembers(slug, emails)` (also localStorage). Preview mode only.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrganizationList, useUser, useOrganization } from '@clerk/clerk-react';
import { cn } from '@/lib/utils';
import { BUYER_PERSONAS, type BuyerPersonaId } from '@/data/buyerPersonas';
import {
  createOrg,
  inviteMembers,
  SIZE_RANGES,
  CHALLENGES,
  slugify,
  saveOrgMetadata,
  type SizeRange,
  type ChallengeTag,
} from '@/data/orgStore';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

type Step = 'persona' | 'org' | 'invite' | 'done';

const CLERK_ENABLED = !!import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function GetStartedPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { createOrganization, setActive } = useOrganizationList();
  const { organization: activeOrganization } = useOrganization();

  const [step, setStep] = useState<Step>('persona');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Persona step
  const [persona, setPersona] = useState<BuyerPersonaId | null>(null);

  // Org step
  const [orgName, setOrgName] = useState('');
  const [industry, setIndustry] = useState('');
  const [sizeRange, setSizeRange] = useState<SizeRange | null>(null);
  const [challenge, setChallenge] = useState<ChallengeTag | null>(null);
  // Owner email: only used when Clerk isn't wired (fallback preview mode).
  const [ownerEmail, setOwnerEmail] = useState('');

  // Invite step
  const [inviteEmails, setInviteEmails] = useState('');

  // Submitted org (needed to build final CTA URL)
  const [createdOrgSlug, setCreatedOrgSlug] = useState<string | null>(null);
  const [createdOrgId, setCreatedOrgId] = useState<string | null>(null);

  const canProceedPersona = !!persona;
  const canProceedOrg =
    orgName.trim().length >= 2 &&
    industry.trim().length >= 2 &&
    !!sizeRange &&
    !!challenge &&
    (CLERK_ENABLED || /\S+@\S+\.\S+/.test(ownerEmail));

  const handleCreateOrg = async () => {
    if (!persona || !sizeRange || !challenge) return;
    setError(null);
    setSubmitting(true);
    try {
      const slug = slugify(orgName.trim());
      if (CLERK_ENABLED && createOrganization) {
        // Real Clerk-backed org. Clerk stores name/slug/members. Our extra
        // metadata (buyerPersona, industry, sizeRange, currentChallenge) is
        // NOT writable to Clerk publicMetadata from the client, so we keep
        // it in localStorage keyed by clerkOrg.id.
        const clerkOrg = await createOrganization({
          name: orgName.trim(),
          slug,
        });
        saveOrgMetadata(clerkOrg.id, {
          buyerPersona: persona,
          industry: industry.trim(),
          sizeRange,
          currentChallenge: challenge,
        });
        if (setActive) {
          await setActive({ organization: clerkOrg.id });
        }
        setCreatedOrgId(clerkOrg.id);
        setCreatedOrgSlug(clerkOrg.slug ?? slug);
      } else {
        // Fallback: localStorage-backed (preview mode without Clerk).
        const org = createOrg({
          name: orgName.trim(),
          buyerPersona: persona,
          industry: industry.trim(),
          sizeRange,
          currentChallenge: challenge,
          ownerEmail: ownerEmail.trim() || user?.primaryEmailAddress?.emailAddress || '',
        });
        setCreatedOrgSlug(org.slug);
      }
      setStep('invite');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Could not create hive: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvites = async () => {
    const emails = inviteEmails
      .split(/[\s,;\n]+/)
      .map((e) => e.trim())
      .filter((e) => e.includes('@'));
    if (emails.length === 0) {
      setStep('done');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      if (CLERK_ENABLED && activeOrganization?.id === createdOrgId) {
        // Real Clerk invites. Loop, swallow individual errors so a single
        // typo doesn't kill the whole batch.
        const failedEmails: string[] = [];
        for (const emailAddress of emails) {
          try {
            await activeOrganization.inviteMember({ emailAddress, role: 'org:member' });
          } catch {
            failedEmails.push(emailAddress);
          }
        }
        if (failedEmails.length > 0) {
          setError(`Could not invite: ${failedEmails.join(', ')} — the rest succeeded.`);
        }
      } else if (createdOrgSlug) {
        // Fallback: localStorage-backed (preview mode without Clerk).
        inviteMembers(createdOrgSlug, emails);
      }
      setStep('done');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Some invites failed: ${msg}`);
      setStep('done');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipInvites = () => {
    setStep('done');
  };

  const handleGoToDashboard = () => {
    if (createdOrgSlug) navigate(`/org/${createdOrgSlug}/dashboard`);
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pt-10 pb-24">
      {/* Step indicator */}
      <StepIndicator step={step} />

      <AnimatePresence mode="wait">
        {step === 'persona' && (
          <motion.div
            key="persona"
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-sm uppercase tracking-widest text-hive-mist mb-3">
              Step 1 of 3
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-hive-cream mb-4">
              Which lens do you look through?
            </h1>
            <p className="text-lg text-hive-mist mb-10">
              This shapes how we frame the dashboard and executive readout for you.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BUYER_PERSONAS.map((p) => {
                const isSelected = persona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPersona(p.id)}
                    className={cn(
                      'text-left p-6 rounded-card border transition-all',
                      isSelected
                        ? 'border-hive-honey bg-hive-honey/10'
                        : 'border-hive-slate/50 bg-hive-charcoal/60 hover:border-hive-slate',
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-serif text-2xl text-hive-cream">{p.label}</h3>
                      {isSelected && <Check className="w-5 h-5 text-hive-honey" />}
                    </div>
                    <p className="text-sm text-hive-mist mb-3">{p.roleExamples}</p>
                    <p className="text-hive-cream/85">{p.tagline}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-10 flex justify-end">
              <button
                type="button"
                onClick={() => setStep('org')}
                disabled={!canProceedPersona}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 'org' && (
          <motion.div
            key="org"
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-sm uppercase tracking-widest text-hive-mist mb-3">
              Step 2 of 3
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-hive-cream mb-4">
              Tell us about your hive.
            </h1>
            <p className="text-lg text-hive-mist mb-10">
              Just enough to seed the dashboard. You can edit any of this later.
            </p>

            <div className="space-y-6">
              <Field label="Organization name" required>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Meridian Growth Partners"
                  className="w-full px-4 py-3 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 text-hive-cream focus:border-hive-honey focus:outline-none placeholder:text-hive-mist/60"
                />
              </Field>

              <Field label="Industry" required>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Consumer packaged goods, SaaS, Healthcare"
                  className="w-full px-4 py-3 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 text-hive-cream focus:border-hive-honey focus:outline-none placeholder:text-hive-mist/60"
                />
              </Field>

              <Field label="Team size" required>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {SIZE_RANGES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSizeRange(s.value)}
                      className={cn(
                        'px-4 py-3 rounded-card border text-sm text-left transition-colors',
                        sizeRange === s.value
                          ? 'border-hive-honey bg-hive-honey/10 text-hive-cream'
                          : 'border-hive-slate/50 bg-hive-charcoal/40 text-hive-cream/85 hover:border-hive-slate',
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="What's your current challenge?" required>
                <div className="space-y-2">
                  {CHALLENGES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setChallenge(c.value)}
                      className={cn(
                        'w-full px-4 py-3 rounded-card border text-left text-sm transition-colors',
                        challenge === c.value
                          ? 'border-hive-honey bg-hive-honey/10 text-hive-cream'
                          : 'border-hive-slate/50 bg-hive-charcoal/40 text-hive-cream/85 hover:border-hive-slate',
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Your work email" required>
                <input
                  type="email"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 text-hive-cream focus:border-hive-honey focus:outline-none placeholder:text-hive-mist/60"
                />
              </Field>
            </div>

            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('persona')}
                className="inline-flex items-center gap-2 px-4 py-2 text-hive-mist hover:text-hive-cream transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                type="button"
                onClick={handleCreateOrg}
                disabled={submitting || !canProceedOrg}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Working…' : 'Create hive'}
                <ChevronRight className="w-4 h-4" />
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-400/90" role="alert">{error}</p>
              )}
            </div>
          </motion.div>
        )}

        {step === 'invite' && (
          <motion.div
            key="invite"
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
          >
            <p className="text-sm uppercase tracking-widest text-hive-mist mb-3">
              Step 3 of 3
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-hive-cream mb-4">
              Invite your team.
            </h1>
            <p className="text-lg text-hive-mist mb-10">
              Up to 25 for beta. They will get a link to take the assessment and
              their results will populate your dashboard as they complete.
            </p>

            <Field label="Email addresses" hint="Paste any format — one per line, commas, or spaces.">
              <textarea
                value={inviteEmails}
                onChange={(e) => setInviteEmails(e.target.value)}
                rows={8}
                placeholder="alex@company.com&#10;jordan@company.com&#10;priya@company.com"
                className="w-full px-4 py-3 rounded-card bg-hive-charcoal/60 border border-hive-slate/50 text-hive-cream focus:border-hive-honey focus:outline-none placeholder:text-hive-mist/60 font-sans text-sm resize-none"
              />
            </Field>

            <p className="mt-4 text-sm text-hive-mist italic">
              Beta note: invite emails are stored locally for this demo. Production
              sends via Resend from <span className="text-hive-cream">hive@bee-archetypes.com</span>.
            </p>

            <div className="mt-10 flex items-center justify-between">
              <button
                type="button"
                onClick={handleSkipInvites}
                className="inline-flex items-center gap-2 px-4 py-2 text-hive-mist hover:text-hive-cream transition-colors"
              >
                Skip for now
              </button>
              <button
                type="button"
                onClick={handleInvites}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
              >
                {submitting ? 'Working…' : 'Send invites'}
                <ChevronRight className="w-4 h-4" />
              </button>
              {error && (
                <p className="mt-3 text-sm text-red-400/90" role="alert">{error}</p>
              )}
            </div>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 1, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center pt-12"
          >
            <div className="w-16 h-16 rounded-pill bg-hive-honey/20 border-2 border-hive-honey mx-auto flex items-center justify-center mb-8">
              <Check className="w-8 h-8 text-hive-honey" />
            </div>
            <h1 className="font-serif text-4xl md:text-5xl text-hive-cream mb-4">
              Your hive is live.
            </h1>
            <p className="text-lg text-hive-mist mb-10 max-w-xl mx-auto">
              Your dashboard is populated with a demo team so you can see how it
              feels. As your invitees complete their assessments, the live data
              replaces the demo view.
            </p>
            <button
              type="button"
              onClick={handleGoToDashboard}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-pill bg-hive-honey text-hive-black font-medium hover:bg-hive-honey/90 transition-colors"
            >
              Open your dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const stepIdx =
    step === 'persona' ? 0 : step === 'org' ? 1 : step === 'invite' ? 2 : 3;
  const labels = ['Lens', 'Org', 'Invite'];
  return (
    <div className="mb-12 flex items-center gap-3 text-xs uppercase tracking-widest text-hive-mist">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-6 h-6 rounded-pill border flex items-center justify-center tabular-nums',
                i < stepIdx
                  ? 'border-hive-honey bg-hive-honey text-hive-black'
                  : i === stepIdx
                    ? 'border-hive-honey text-hive-honey'
                    : 'border-hive-slate/60 text-hive-mist',
              )}
            >
              {i < stepIdx ? <Check className="w-3 h-3" /> : i + 1}
            </span>
            <span className={cn(i === stepIdx && 'text-hive-cream')}>{label}</span>
          </div>
          {i < labels.length - 1 && <span className="w-6 h-px bg-hive-slate/60" />}
        </div>
      ))}
    </div>
  );
}

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}
function Field({ label, hint, required, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm text-hive-cream mb-2">
        {label}
        {required && <span className="text-hive-honey ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="mt-2 text-xs text-hive-mist italic">{hint}</p>}
    </div>
  );
}