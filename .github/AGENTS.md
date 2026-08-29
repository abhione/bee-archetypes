# For AI Agents Working On This Repo

If you're an AI agent (Enigma, Claude, GLM, Cursor, Codex, Copilot, etc.) that just cloned or was pointed at this repo — READ THESE FILES FIRST, in this order:

1. **`../README.md`** — what this project is
2. **`../STATUS.md`** — where things are RIGHT NOW
3. **`../HANDOFF.md`** — how to pick up work (your onboarding)
4. **`../ARCHITECTURE.md`** — the mental model
5. **`../.omc/PLAN.md`** — historical build plan (context only)

## Fast facts for orientation

- Owner: Abhi Bhattacharya (`abhi@sequoiadigital.io`)
- Live URL: https://bee-archetypes-beta.fly.dev/ (basic auth `hive`/`honey2026`)
- Repo: https://github.com/abhione/bee-archetypes (public)
- Clerk instance: `capable-camel-904.clerk.accounts.dev` (dev tier)
- Fly app: `bee-archetypes-beta` in org `personal`

## Golden rules

1. **Never PR to this repo.** Direct-commit to `main` is Abhi's convention for `abhione/*` repos.
2. **Never touch archetype `oneLiner` copy without Abhi's approval** — those are framework identities co-owned with Miranda.
3. **Never inline a secret literal in a tool call.** See Van's skill `hermes-secrets-handling` v1.3.0 for the redaction rules. Symptoms of getting this wrong: file size ~150-200 bytes (should be 300+), HTTP 401 on Clerk API test.
4. **Ship the whole thing.** If Abhi asks for X, deliver end-to-end X. Reject partial plans.
5. **Screenshots for visual changes.** `MEDIA:/abs/path.png` at end of reply.
6. **Reasoning-heavy tasks → GLM-4.6 local first.** Endpoint `http://127.0.0.1:8081/v1`. Only fall back to Claude if GLM's answer is wrong. See `~/.hermes/skills/mlops/local-coding-model` for the router.

## The deploy command in one paste

```sh
cd ~/Developer/bee-archetypes
export FLY_ACCESS_TOKEN=$(grep '^access_token:' ~/.fly/config.yml | cut -d' ' -f2)
export CLERK_PK=$(grep '^VITE_CLERK_PUBLISHABLE_KEY=' .env.local | cut -d= -f2-)
fly deploy --app bee-archetypes-beta --now --ha=false \
  --build-arg "VITE_CLERK_PUBLISHABLE_KEY=$CLERK_PK" \
  --build-arg "VITE_APP_URL=https://bee-archetypes-beta.fly.dev"
```

## If you're stuck

- Read `STATUS.md` "Known bugs / gotchas" — most surprises are documented there
- Ask Abhi. He's fast, direct, tolerates uncertainty. "I'm stuck on X, best next?" gets a real answer in <5 min.
- Send `help me van` via Juno A2A (cron runs every minute) if my session is still warm somewhere

— Van (Hermes agent, Aug 29 2026)
