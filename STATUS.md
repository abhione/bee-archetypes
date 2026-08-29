# STATUS

_Last updated: 2026-08-29 by Van (Hermes agent, Opus 4.7) — after Wave 6 (Clerk auth)_

## TL;DR

**All 6 build waves are shipped. Site is live. Auth works. Content is populated. Waiting on Abhi's copy-edit pass and Miranda's voice review.**

## Live state

- **URL:** https://bee-archetypes-beta.fly.dev/
- **Basic auth:** `hive` / `honey2026`
- **Clerk instance:** `capable-camel-904.clerk.accounts.dev` (dev tier)
- **Clerk account:** `abhi@sequoiadigital.io`
- **Repo:** https://github.com/abhione/bee-archetypes (main branch, public)
- **Fly app:** `bee-archetypes-beta` (org: personal)
- **Latest commit:** `6a258d4` (Wave 6: Clerk auth + Organizations)

## Waves completed

| Wave | Commit | Summary |
|---|---|---|
| 1 | `de9377c` + `23ddc53` | Scaffold + landing + Fly deploy config; motion-safe rules |
| 2b | `08d59c0` | 15-archetype schema + 21-question assessment + scoring engine |
| 3 | `f915294` | Assessment flow + result reveal |
| 4 | `9a834f0` | Buyer signup + persona-tailored org dashboard |
| 5a | `3f9e22a` | /method page + content-import scripts |
| 5b | `cf05f37` | Real GLM-4.6 content for 14/15 archetypes (Waggle hand-written) |
| 5c | `de5d758` | Deployed to Fly.io behind basic auth |
| 6 | `6a258d4` | Clerk auth + Organizations wired end-to-end |

## What's in the repo but NOT visible yet

- **Content copy-edit doc** (`docs/COPY-EDIT.md`) — 15 KB, one section per archetype, 5 fields each. Abhi to edit inline in his voice, then `python3 scripts/merge-generated-content.py` and redeploy.
- **Server-side org metadata** — currently companion to Clerk in localStorage. Migrate to Fly SQLite in Wave 7.

## Known bugs / gotchas (real, not theoretical)

- `[6133]` unused `submitting`/`error` state in `GetStartedPage.tsx` — intentional stubs for future spinner/error UI. Suppressed with `[, setX]` destructure. Wire the UI in Wave 7.
- `activeOrganization` is `null` for a brief window between `setActive({ organization: clerkOrg.id })` and the next render. `handleInvites` guards with `activeOrganization?.id === createdOrgId`; if the check fails, invites fall through to localStorage fallback silently. **Wave 7 fix:** `await` `setActive` completion event OR poll with backoff.
- Basic auth (`hive`/`honey2026`) is site-wide. There's no way to give someone a Clerk sign-up link that bypasses the nginx gate. Design decision: acceptable for private beta, remove in Wave 8 (public launch).
- The `docs/content-import-diff.md` file was created by `generate-archetype-content.py` but has OLD == NEW rows (merge ran twice with same content in both slots). Cosmetic; ignore.
- `public/seed-*.html` is gitignored — used for headless-Chrome verification during Wave 5 development. Do NOT check in.

## Environment / credentials

- **Local dev env:** `~/Developer/bee-archetypes/.env.local` (gitignored)
- **Durable secrets:** `~/.hermes/secrets/clerk/bee-archetypes.env` (chmod 600)
- **Fly access token:** in `~/.fly/config.yml` under `access_token:` (grep + cut to extract)
- **Clerk API secret key** works from the Fly VM after `fly secrets set CLERK_SECRET_KEY=...`

## Test coverage

- ✅ `pnpm check:data` — invariant validation (all 15 archetypes reachable top-3)
- ✅ `scripts/smoke-test-assessment.ts` — 5 synthetic personas → sensible primaries
- ❌ No component tests (React Testing Library not installed)
- ❌ No E2E tests (Playwright not installed)
- ❌ No CI (no GitHub Actions)

## What NOT to touch without asking Abhi

- `src/data/archetypes.ts` content blocks — GLM output that Miranda will voice-edit. Do not "improve" prose.
- `src/data/scoring.ts` weight vectors — hand-tuned to make invariants pass. Changing one weight breaks Sentinel reachability.
- Clerk sign-in method (email code only). No password, no OAuth. Abhi's explicit choice.
- `docs/wave-5-queen-result.png` — reference screenshot. Do not overwrite.

## Model split (who wrote what)

- **Human (Abhi Bhattacharya)** — product decisions, buyer persona split, "Bring to your team" copy, Bee Archetypes framework co-author with Miranda
- **GLM-4.6 UD-Q4_K_XL (local, on starbase)** — 14 archetype content blocks; Wave 6 handler code
- **Claude Opus 4.7 (me, Van/Hermes agent)** — scaffolding, tsc/build/deploy plumbing, headless verification, bug triage, this documentation

## Recurring monthly costs

- **Fly:** ~$5/mo (shared-cpu-1x 512MB, one machine, ord region)
- **Clerk:** $0/mo (dev tier, capped at 10K MAU)
- **GitHub:** $0 (public repo, abhione org)
- **Compute (GLM-4.6 on starbase):** $0 marginal (existing hardware, ~215 GB RAM)

**Total:** ~$5/mo running cost.
