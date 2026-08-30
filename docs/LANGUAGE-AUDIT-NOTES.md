# Language Audit Notes — Full App Pass

Full editorial audit of user-facing strings across Bee Archetypes, extending the Wave 6b
archetype-content voice pass (see `docs/COPY-REVIEW-NOTES.md`) to the assessment engine,
pages, components, and config-level copy. Text-only edits throughout — no `id`, `weights`,
`stressSignal`, `systemId`, or `content` block on any archetype was touched.

Consistency checks run first (see bottom of this doc): system labels, archetype-name
casing, HTML dash entities, quote style, beta/MVP wording, button casing, brand-name
casing were all grepped across `src/` before any edits began.

---

## `src/data/questions.ts` (Priority 1 — the assessment engine)

Voice pass + psychometric hygiene pass on all 21 questions × 4 options.

- **Header comment fixed**: said "18 questions" (stale from an earlier build); now says
  "21 questions." Also fixed a second stale reference to "18-answer path" and the example
  kicker string ("1 of 18" → "1 of 21").
- **Q03 prompt**: removed "cross-functional" (corporate-poison word) from "A
  cross-functional meeting is going sideways." → "A meeting between two teams is going
  sideways." Same scenario, plainer language.
- **Q03 option d**: "Log the dispute so we have a paper trail for next time" read as
  defensive/CYA behavior, notably less socially desirable than the other three options in
  that question (name the trade-off, translate, timebox-and-pilot). Rewrote to "Write down
  what was actually agreed so we are not relitigating it next month" — same archivist
  behavior (institutional memory), reframed as constructive rather than self-protective.
  This is a social-desirability balance fix per the psychometric hygiene rules, not a
  change to what the option measures.
- **Em dashes removed** from option labels (Q05d, Q09a-d, Q18d) — replaced with colons,
  commas, or rephrasing. These render directly in the assessment UI via `QuestionCard`, so
  they were in scope for the "no em dash" rule the same as any other user-facing string.
- **Q15 length parity**: options c and d were noticeably longer than a and b (10-15 word
  spread). Trimmed d ("I start seeing risk everywhere, becoming the friction...") for
  closer parity without changing the stress signal it points to.
- **Q19d length parity**: "Holding the room when the stakes get uncomfortable" (8 words)
  was short next to its siblings (11-13 words). Expanded slightly to "Holding the room
  steady when the stakes turn genuinely uncomfortable" (10 words) — same meaning, closer
  length match.
- **Q21 prompt**: "When your job title does not fit what you actually do, what do you
  actually do?" repeated "actually do" in a way that read as circular rather than
  rhetorical. Rewrote to "Your job title does not quite cover what you actually do. What
  is the work underneath it?" — same intent, cleaner read.

No changes to weights, stressSignal, ids, or which archetype cluster each option targets.
All 10 psychometric hygiene rules were checked against every question; most of the file
was already well-constructed (behaviorally anchored, single-barrel, forward-framed) and
needed no intervention.

## `src/pages/LandingPage.tsx`

- One em dash removed from the hero subhead ("...names your natural contribution — and
  the Agentic Counterpart...") → rewritten as two clauses joined with "then" instead of a
  dash-inserted aside.
- Verified "beta" badge text is the only lifecycle-stage marker on this page and is
  consistent with README/MethodPage usage — no MVP/beta conflict found (see consistency
  checks below).

## `src/pages/MethodPage.tsx`

- **Six `&mdash;` HTML entities removed** — the file used
  `dangerouslySetInnerHTML={{ __html: x.desc }}` specifically to render these entities as
  em dashes in three stat-card descriptions. Rewrote all three descriptions to use plain
  colons instead, then removed `dangerouslySetInnerHTML` entirely in favor of plain JSX
  text rendering — it no longer served a purpose once the entities were gone, and dropping
  it removes an unnecessary (if low-risk, since the source was a static array) raw-HTML
  injection point.
- Body copy dash removals: "not what people's titles say, but what patterns they
  contribute" was both a dash-as-aside AND an "not X, but Y" AI-parallel construction.
  Rewrote as two short declarative sentences ("Titles say one thing. The patterns people
  contribute when the work is real say another.") — same claim, no banned construction.
- Similarly rewrote "not a replacement, an amplifier" (about the AI counterpart) into
  three short sentences that preserve the reassurance without the "not X, Y" pattern.
- **Fixed a timing inconsistency**: this page said "Takes about six minutes," while the
  README, LandingPage, and DashboardHubPage all say "three-minute assessment." Normalized
  to "three minutes" — flagging in case six minutes reflects an actual product change (see
  Flagged section).

## `src/pages/ResultsPage.tsx`

- One em dash in the native share-sheet title template (`I'm the ${name} — Bee
  Archetypes`) replaced with the middle-dot separator already used elsewhere in this same
  file and in MethodPage for metadata pairs (`· Bee Archetypes`), for internal
  consistency.

## `src/pages/AssessmentPage.tsx`

Read in full. No changes — no dashes, no corporate-poison words, buttons already
sentence-case, second-person copy used only in the draft-resume prompt (an assessment-flow
CTA context, which the voice rules explicitly permit).

## `src/pages/GetStartedPage.tsx`

- Two em dashes fixed: an error-message template (`Could not invite: ... — the rest
  succeeded.` → period-separated sentence) and a form hint (`Paste any format — one per
  line...` → colon).

## `src/pages/DashboardHubPage.tsx`

- **Timing inconsistency**: "Take the 6-minute assessment" → "Take the three-minute
  assessment," matching the now-consistent three-minute figure used everywhere else.
- **Brand-name grammar**: "bring the Bee Archetypes to your team" → "bring Bee Archetypes
  to your team." "Bee Archetypes" is a proper product name, not a countable noun phrase
  that takes an article; the extra "the" was inconsistent with identical CTAs elsewhere
  (ResultsPage, LandingPage) that already drop it.

## `src/pages/OrgDashboardPage.tsx`

- Five em dashes removed across the missing-archetype note and the two persona-specific
  executive-readout bodies (people-leader and business-leader variants). Replaced with
  colons (for "X: Y" apposition) or commas (for joining parallel clauses), matching the
  pattern used elsewhere in the file.
- **Corporate-poison word**: "your highest-leverage development bet this quarter" →
  "your highest-value development bet this quarter." "Leverage" is on the explicit
  banned list; "highest-value" preserves the meaning (this is the person whose growth
  matters most) without the jargon.

## `src/pages/SignInPage.tsx` / `src/pages/SignUpPage.tsx`

- **Accuracy fix, not just voice**: SignInPage said "We'll send you a magic link" and
  SignUpPage said "One-click sign-up... No password." Per README and `ARCHITECTURE.md`,
  Clerk is configured for **email-code** sign-in (not magic links), and sign-up is not
  literally one click (it requires entering the code). Rewrote both to describe the actual
  flow: "We'll send you a one-time code" / "No password, just a one-time code." This is a
  factual-accuracy correction surfaced during the voice pass, not a stylistic one.

## `src/pages/NotFoundPage.tsx`

Read in full. No changes — already in voice, no issues found.

## `src/components/Layout.tsx`, `src/components/QuestionCard.tsx`, `src/components/ProtectedRoute.tsx`

Read in full. No changes needed in Layout.tsx or QuestionCard.tsx (clean, no dashes, no
poison words, consistent brand casing). `ProtectedRoute.tsx` has no user-facing strings
(comments and code only) — skipped per the mission's own guidance for that file.

## `src/data/buyerPersonas.ts`

Read in full (labels, role examples, taglines, dashboard-framing copy). No changes — no
dashes, no corporate poison, taglines are a clean parallel pair ("You are responsible
for..."), and second-person use is appropriate for a persona-selection UI.

## `src/data/demoTeam.ts`

Read in full. Synthetic names and titles are professional and plausible; nothing
user-facing needed editing.

## `src/data/archetypes.ts` (SYSTEMS / AGENTIC_COUNTERPARTS only — `content` blocks untouched)

- Confirmed `SYSTEMS[]` labels are the sole canonical source and are already used
  consistently everywhere else in the app (see consistency checks below) — no drift to
  fix.
- One em dash removed from `AGENTIC_COUNTERPARTS` → Hygienist → `description` ("Watches
  for the drift patterns — quality, process, technical, cultural — that only compound in
  the dark...") — restructured into a colon-led list. This field is explicitly in scope
  per the mission brief (distinct from the off-limits archetype `content` blocks) and
  renders on both MethodPage and ResultsPage.
- `SYSTEMS[].description` fields and the Queen/Catalyst counterpart descriptions were
  already clean.

## `src/data/orgStore.ts` (not in the original priority list, added because it feeds Priority-2 page copy directly)

- The `CHALLENGES` array's five real labels (the "other" catch-all excluded) all used em
  dashes ("Growth phase — scaling the org," etc.) and render verbatim as buttons on
  GetStartedPage's "What's your current challenge?" step. Replaced with colons/rephrasing.
  Flagging this file wasn't in the original priority list, but its strings are rendered
  directly on an audited page, so they were in scope for the same "no em dash" rule.
- `SIZE_RANGES` labels use en dashes for numeric ranges ("1–10 (early stage)") — this is
  correct typography for a number range, a different character and use case from the
  em-dash-as-aside the voice rules ban, so left untouched.

---

## Consistency checks (run across all of `src/`)

1. **System labels** — grepped for "Care & Development," "Health & Governance," "People &
   Development," "Risk & Protection," "Growth & Movement," "Growth & Expansion." Found
   `SYSTEMS[]` already uses "People & Development," "Risk & Protection," and "Growth &
   Expansion" consistently everywhere they appear (`archetypes.ts`, `index.css` comments,
   `LandingPage.tsx`). No drift found — nothing to normalize. (Note: the mission brief's
   own system table names Swarm as "Growth & Movement"; the codebase's actual canonical
   label per `SYSTEMS[]` is "Growth & Expansion," which is what was kept, per the explicit
   instruction that `SYSTEMS[]` is canonical.)
2. **Archetype-name casing** — grepped for "Swarm-Leader" / "SwarmLeader" variants. Only
   "Swarm Leader" (the canonical form in `archetypes.ts`) appears anywhere.
3. **HTML dash entities** — grepped for `&mdash;`, `&ndash;`, `&#8212;`, `&#8211;` across
   `src/`. Only MethodPage.tsx had them (six instances); all fixed and confirmed clean by
   re-grep after edits.
4. **Straight vs. curly quotes** — spot-checked; codebase consistently uses straight quotes
   in string literals (JSX/TS requires this anyway). No issues.
5. **"Beta" vs "MVP"** — "beta" appears in user-facing copy (LandingPage badge,
   GetStartedPage invite-step copy) consistently. "MVP" only appears in code comments
   (buyerPersonas.ts, README), never in rendered UI, so there was no actual conflict to
   resolve.
6. **Button casing** — every button/CTA audited across all files already uses sentence
   case ("Take the assessment," "Bring to your team," "Continue," "Create hive"). No
   Title-Case outliers found; nothing to normalize.
7. **"Bee Archetypes" capitalization** — grepped every occurrence; all consistently
   "Bee Archetypes." One grammar issue (an extra "the" in DashboardHubPage) was fixed (see
   above) but the casing itself was already correct everywhere.
8. **"Hive Leadership OS"** — appears once (ResultsPage, the Agentic Counterpart section)
   in the exact canonical form. Nothing to fix.

---

## Flagged for human decision

- **MethodPage's "six minutes" vs the app-wide "three minutes."** I normalized this to
  three minutes to match the README, LandingPage, and DashboardHubPage, on the assumption
  it was a copy-paste drift rather than an intentional distinction (e.g., "three minutes"
  for the individual flow vs. a longer estimate somewhere for a team/org context). If six
  minutes was actually correct for some flow, that number should be re-applied deliberately
  rather than left as an unexplained outlier.
- **`summarizeResult()` in `src/data/scoring.ts`** (line ~186) contains a
  user-facing-shaped string (`${primary.name} — ${primary.systemLabel}`, described in its
  own docstring as "useful for OG images and share text") with an em dash. `scoring.ts` was
  explicitly marked out of scope ("pure logic, no copy") in the mission brief, so I left it
  untouched, but it is not currently called anywhere in the app (no imports of
  `summarizeResult` found). If this function is wired up for OG-image or share-text
  generation later, its em dash should be fixed at that time.
- **The `Field label="Your work email" required` on GetStartedPage's org step.** This field
  is rendered and marked `required` unconditionally, but the actual validation
  (`canProceedOrg`) only requires it when Clerk is disabled (fallback/preview mode) — when
  Clerk is enabled, the email is collected by Clerk itself and this field's value isn't
  used to gate progression. This is a functional/UX question, not a language one, so I left
  it as-is and am surfacing it here rather than changing form logic unilaterally.
- **Archivist/Regulator system-grouping mismatch**, already flagged in the prior Wave 6b
  notes (`docs/COPY-REVIEW-NOTES.md`): the mission brief's canonical table places Archivist
  under Brood and Regulator under Guard, but `archetypes.ts` has `systemId: 'comb'` for
  Archivist and `systemId: 'brood'` for Regulator. This pass didn't touch `systemId` or
  `system` fields (out of scope), but it's worth surfacing again since it affects how
  those two archetypes are grouped and labeled throughout the app.
