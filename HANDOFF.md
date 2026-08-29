# HANDOFF — for Enigma (or next agent picking this up)

_Written 2026-08-29 by Van (Hermes agent, Opus 4.7). If you're reading this, Abhi has handed you the Bee Archetypes MVP mid-flight and wants you to continue. Everything you need is in this file._

## Who you are, who I was, who Abhi is

- **You (Enigma):** OpenClaw agent, running in Abhi's environment. You have terminal, git, Fly CLI, GLM-4.6 endpoint at `http://127.0.0.1:8081/v1`, Notion, and Clerk API access via secrets on disk.
- **Me (Van, aka this Hermes session):** built waves 1–6, wrote every doc in this repo. My conversation ended when Abhi typed the handoff message.
- **Abhi Bhattacharya:** owns the product and the vision. Reports up to Miranda / Hive Enterprises on the framework side. Judgment calls escalate to him.

## Zeroth thing: read these files IN THIS ORDER

1. **`README.md`** — orientation, what this is, how to run it
2. **`ARCHITECTURE.md`** — mental model, module map, data flow
3. **`STATUS.md`** — what's shipped, what's broken, what's queued
4. **This file (`HANDOFF.md`)** — pickup guide
5. **`.omc/PLAN.md`** — original 5-wave plan (historical, superseded by STATUS.md)

Budget 10 min to read all four. It'll save you an hour of rediscovery.

## First thing: verify the live site

```sh
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://bee-archetypes-beta.fly.dev/    # → 401 (auth gate working)
curl -s -u hive:honey2026 https://bee-archetypes-beta.fly.dev/ | head -5              # → valid HTML
```

If both work, the site is up. If either fails, check Fly:

```sh
export FLY_ACCESS_TOKEN=$(grep '^access_token:' ~/.fly/config.yml | cut -d' ' -f2)
fly status --app bee-archetypes-beta
fly logs --app bee-archetypes-beta --no-tail | tail -30
```

## Second thing: verify your local dev environment

```sh
cd ~/Developer/bee-archetypes
git pull origin main            # get any commits Abhi added between sessions
pnpm install                    # install deps
pnpm tsc --noEmit               # must return clean (0 errors)
pnpm check:data                 # all 15 archetypes reachable top-3
pnpm dev                        # → http://localhost:5173
```

If Clerk isn't loading in dev, check `.env.local`:

```sh
ls -la .env.local               # → 365 bytes, chmod 600
grep -c CLERK .env.local        # → 2 (publishable + secret)
```

If the file is missing or too small (<300 bytes), the redactor ate it during creation. Rehydrate from `~/.hermes/secrets/clerk/bee-archetypes.env`:

```sh
cp ~/.hermes/secrets/clerk/bee-archetypes.env .env.local
chmod 600 .env.local
```

## Third thing: the standing waves that are QUEUED (pick one)

Pick these in this priority order unless Abhi says otherwise:

### 🔥 Wave 7a: Copy-edit pass (highest ROI, low complexity)

- Abhi (and possibly Miranda) will drop voice-edited content into `docs/COPY-EDIT.md`
- Re-run `python3 scripts/merge-generated-content.py` (currently reads from `/tmp/bee-archetype-content-keyed.json` — you may need to adapt it to read from `docs/COPY-EDIT.md` if Abhi wants that workflow)
- Verify with `pnpm check:data` + local preview
- Deploy (see command below)
- **Do NOT** touch `oneLiner` copy without Abhi's explicit approval — those are the archetype identities, framework-owned

### 🚀 Wave 7b: Custom domain

- Abhi wants `bee-archetypes.com` (or similar) → point at Fly
- Steps: `fly certs add bee-archetypes.com --app bee-archetypes-beta`, then Abhi adds DNS records at his registrar
- Update `VITE_APP_URL` build arg in deploy command
- Add Clerk allowed origin: dashboard.clerk.com → Configure → Domains → add production URL

### 🏗️ Wave 7c: Server-side org metadata

- Currently: `OrgMetadata` (buyerPersona, industry, sizeRange, currentChallenge) is in localStorage keyed by `clerk.org.id`
- Problem: doesn't survive browser wipe, doesn't sync across devices, can't be queried
- Solution: add a Fly SQLite volume + minimal Express/Hono API + Clerk JWT verification middleware
- Migration path: on first Clerk sign-in, backfill `OrgMetadata` from localStorage → API → SQLite
- **New surface area:** the app becomes full-stack. Don't start this without a clear ask.

### 📊 Wave 7d: Analytics

- Abhi wants Plausible or PostHog (his preference, ask him)
- Install script, event-track assessment completions, signup conversions, dashboard visits
- Config in `.env.local` (client-side keys are safe to bake in)

### 🎨 Wave 7e: Polish UI states

- `submitting` and `error` state in `GetStartedPage` are unused (suppressed with `[, setX]` destructure). Wire up a spinner and inline error toast.
- `OrgDashboardPage` reads localStorage by slug, not by Clerk org.id — migrate to `getOrgMetadata(clerkOrg.id)` for consistency
- Add empty-state art on `/dashboard` when a user has no orgs (currently just text)

### ✅ Wave 7f: CI

- Add `.github/workflows/ci.yml`: install → tsc → check:data → build
- Optional: Playwright E2E test for the assessment happy path
- Optional: deploy on merge to main via `superfly/flyctl-actions`

## Fourth thing: the workflow shape Abhi expects

**Absorbed from watching him work with me:**

1. **He says "do X" → you do X, then report what happened.** No plans, no "here's what I would do." Just do it and show the result.
2. **Screenshot for visual changes.** He can't always download files; use `MEDIA:/absolute/path.png` at the end of your reply for images ≤13 MB.
3. **He values momentum over perfection.** Ship broken things that show progress; don't polish invisible things.
4. **Reject partial plans.** If he asks for the assessment, deliver the whole assessment, not "step 1 of the assessment."
5. **Never PR client repos without asking.** For `abhione/*`, direct-push to `main` is fine.
6. **Reasoning-heavy tasks → GLM-4.6 first (`use glm` trigger).** Only fall back to Claude if GLM's answer is wrong.
7. **Secrets NEVER go inline in tool arguments.** See `~/.hermes/skills/software-development/hermes-secrets-handling` — read that skill BEFORE touching any file with a token.

## Fifth thing: what to do if you're stuck

1. **Read `STATUS.md` "Known bugs / gotchas"** — most surprises are documented
2. **Check `git log --oneline`** — every wave has a descriptive commit message
3. **Read the source files' inline JSDoc** — Wave 6 added TSDoc to `orgStore.ts`, `ProtectedRoute.tsx`, `GetStartedPage.tsx`
4. **Run `python3 scripts/verify_clerk.py`** — proves Clerk API auth works (if you write it, or reuse the script Van left at `/tmp/verify_clerk.py`)
5. **Send the word "help me van" via Juno A2A** — the a2a dispatch cron runs every minute; I'll answer if my session is still warm somewhere
6. **Ask Abhi.** He's fast and direct. "I'm stuck on X, best next move?" gets a real answer in <5 min.

## Sixth thing: the deploy command in one paste

```sh
cd ~/Developer/bee-archetypes
export FLY_ACCESS_TOKEN=$(grep '^access_token:' ~/.fly/config.yml | cut -d' ' -f2)
export CLERK_PK=$(grep '^VITE_CLERK_PUBLISHABLE_KEY=' .env.local | cut -d= -f2-)
fly deploy --app bee-archetypes-beta --now --ha=false \
  --build-arg "VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PK" \
  --build-arg "VITE_APP_URL=https://bee-archetypes-beta.fly.dev"
```

Takes ~90 seconds cold, ~40 seconds if the Docker cache is warm.

## The vibe

Abhi is at his ceiling as a solo operator (per his memory profile). This project is one of many. He wants **you to reduce his cognitive load**, not add to it. If you finish a task and there's a natural next step, do it and report both. If you're not sure whether he wants the next step, do the first and ask about the second.

Good luck. Ship things. Ping if you need me.

— Van
