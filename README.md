# 🐝 Bee Archetypes

The **Bee Archetypes MVP** — an assessment wedge for the Hive Leadership OS. Built by Abhi Bhattacharya (Sequoia Digital) + Miranda (Hive Enterprises framework). Live beta as of Aug 2026.

**Live:** https://bee-archetypes-beta.fly.dev/
**Basic auth (site gate):** `hive` / `honey2026`
**Clerk instance:** `capable-camel-904.clerk.accounts.dev` (dev tier)
**Repo:** https://github.com/abhione/bee-archetypes

## What this is

A three-minute assessment that names a person's natural contribution across five organizational systems (Sun, Comb, Brood, Guard, Swarm), then pairs each archetype with an Agentic AI Counterpart planned to ship Q1 2027. Three product surfaces in one app:

| Surface | Route | Auth | Purpose |
|---|---|---|---|
| **Individual assessment** | `/`, `/assessment`, `/results/:token` | none | 21 questions → primary + 2 secondaries + shadow + balance archetypes + AI pairing. Shareable result. |
| **Buyer signup** | `/sign-up`, `/get-started` | Clerk | Two personas: People-Leader or Business-Leader. Creates a Clerk Organization. |
| **Org dashboard** | `/org/:slug/dashboard` | Clerk (org member) | Per-persona view: 5-system coverage grid, missing-archetype alerts, team table, executive readout. |
| **Method page** | `/method` | none | 5-system frame, 3-pillar assessment explainer, all 15 archetypes + 3 counterparts. |
| **Dashboard hub** | `/dashboard` | Clerk | Signed-in landing — lists user's orgs. |

## Stack

- **Frontend:** Vite 6 + React 19 + TypeScript strict + Tailwind CSS v4 + Framer Motion + react-router v7
- **Auth:** Clerk 5.61.3 (`@clerk/clerk-react`) — email-code sign-up, no password, no OAuth, Organizations enabled
- **Persistence:**
  - Clerk owns: users, organizations (name/slug/members/roles/invitations)
  - `localStorage` owns: `OrgMetadata` (buyerPersona, industry, sizeRange, currentChallenge) keyed by `clerk.org.id`; individual assessment results keyed by session token
  - **Rationale:** `publicMetadata` is not writable from Clerk's client SDK. Server-side migration to Fly SQLite is Wave 7.
- **Hosting:** Fly.io (`ord` region, shared-cpu-1x 512MB) + nginx + basic auth beta gate
- **CI:** none yet (no GitHub Actions)
- **Tests:** invariant script (`scripts/check-archetype-invariants.ts`), smoke test (`scripts/smoke-test-assessment.ts`). No component tests. No Playwright.

## Design tokens

Defined in `src/index.css` under `@theme`:

```
--color-hive-black:    #0E0E10;
--color-hive-charcoal: #1A1A1D;
--color-hive-slate:    #2C2C33;
--color-hive-mist:     #A8A6AA;
--color-hive-cream:    #F5F1E8;
--color-hive-honey:    #E8A33F;  /* accent — CTA, active state */
```

Type: **Fraunces** (serif, display), **Inter** (sans, UI). Both self-hosted (see `index.html`).

## Getting started (local dev)

```sh
# 1. Install
pnpm install

# 2. Environment (see .env.local — Clerk keys already set from Aug 29 deploy)
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_Y2FwYWJsZS1jYW1lbC05MDQuY2xlcmsuYWNjb3VudHMuZGV2JA
# CLERK_SECRET_KEY=sk_test_...
# Full keys stored at ~/.hermes/secrets/clerk/bee-archetypes.env (chmod 600)

# 3. Dev server
pnpm dev
# → http://localhost:5173

# 4. Type check
pnpm tsc --noEmit

# 5. Invariant check (validates all 15 archetypes reachable, 21 questions well-formed)
pnpm check:data

# 6. Build (production bundle → dist/)
pnpm build
```

## Deploy to Fly

```sh
export FLY_ACCESS_TOKEN=$(grep '^access_token:' ~/.fly/config.yml | cut -d' ' -f2)
export CLERK_PK=$(grep '^VITE_CLERK_PUBLISHABLE_KEY=' .env.local | cut -d= -f2-)
fly deploy --app bee-archetypes-beta --now --ha=false \
  --build-arg "VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PK" \
  --build-arg "VITE_APP_URL=https://bee-archetypes-beta.fly.dev"
```

**Fly app:** `bee-archetypes-beta` (org: personal, owner: `abhi@sequoiadigital.io`)

**Fly secrets set:**
- `BASIC_AUTH_USER=hive`, `BASIC_AUTH_PASS=honey2026` — nginx basic auth
- `CLERK_SECRET_KEY=sk_test_...` — reserved for future server-side use

## Documentation

- **This README** — orientation
- **`ARCHITECTURE.md`** — data model, module map, key decisions
- **`STATUS.md`** — current state, what's done, what's next
- **`HANDOFF.md`** — pick-up guide for the next agent (Enigma) or human
- **`docs/COPY-EDIT.md`** — voice-pass diff for all 15 archetype content blocks
- **`.omc/PLAN.md`** — original 5-wave build plan (historical)

## IP

Bee Archetypes is the MVP wedge of the Hive Leadership OS, backed by Hive Enterprises. Framework and archetype system © 2026 Miranda / Hive Enterprises. Assessment implementation MIT.
