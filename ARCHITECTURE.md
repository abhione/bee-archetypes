# Architecture — Bee Archetypes

## The mental model

**One React SPA. Three product surfaces. Deterministic scoring engine. Split persistence.**

- Anonymous users take an assessment → get a shareable result (localStorage + sessionStorage keyed by an opaque token).
- Signed-in users create a Clerk Organization and land in a dashboard sized to their buyer persona.
- The scoring engine is pure (no I/O, no framework calls) so we can smoke-test 5 synthetic personas without booting the browser.

## Module map

```
src/
├── main.tsx                 # ClerkProvider (conditional on VITE_CLERK_PUBLISHABLE_KEY)
├── App.tsx                  # Routes: public + <ProtectedRoute>-wrapped
├── components/
│   ├── Layout.tsx           # Header w/ nav + <UserButton /> + <OrganizationSwitcher />
│   ├── ProtectedRoute.tsx   # <SignedIn>/<SignedOut>/<RedirectToSignIn> wrapper
│   └── QuestionCard.tsx     # 21-question assessment UI unit
├── data/                    # PURE — no framework imports, safe to test with node
│   ├── archetypes.ts        # 15 archetypes × 5 fields of GLM-drafted content
│   ├── questions.ts         # 21 questions × 4 options × weight vectors
│   ├── scoring.ts           # answerMap → primary + secondaries + shadow + balance + counterpartKey
│   ├── buyerPersonas.ts     # People-Leader vs Business-Leader definitions
│   ├── demoTeam.ts          # 12 synthetic teammates for the seeded demo dashboard
│   └── orgStore.ts          # localStorage-backed org store + Clerk metadata companion
├── pages/
│   ├── LandingPage.tsx      # Hero + CTA to /assessment
│   ├── AssessmentPage.tsx   # 21-question flow, LocalStorage drafts, auto-advance
│   ├── ResultsPage.tsx      # Reveal: primary + secondaries + shadow + balance + AI counterpart
│   ├── MethodPage.tsx       # 5-system frame + 3-pillar explainer + 3 counterparts
│   ├── SignInPage.tsx       # Clerk <SignIn /> wrapper
│   ├── SignUpPage.tsx       # Clerk <SignUp /> wrapper
│   ├── DashboardHubPage.tsx # Signed-in landing: user's orgs + CTA to create new hive
│   ├── GetStartedPage.tsx   # 3-step wizard: Lens → Org (creates Clerk org) → Invite
│   ├── OrgDashboardPage.tsx # Persona-tailored dashboard
│   └── NotFoundPage.tsx
scripts/                     # tsx-runnable, no framework
├── check-archetype-invariants.ts   # Every archetype reachable as top-3?
├── smoke-test-assessment.ts        # 5 personas → sensible primary + counterpart hits
├── generate-archetype-content.py   # GLM-4.6 driver (28 min for 14 archetypes)
├── merge-generated-content.py      # /tmp/*-keyed.json → archetypes.ts content blocks
└── retry-failed-archetypes.py
deploy/                       # Fly container config
├── Dockerfile               # node:22 build → nginx:1.27 runtime
├── nginx.conf               # SPA fallback + auth_basic
└── entrypoint.sh            # generates .htpasswd from BASIC_AUTH_USER/PASS env
```

## Data model

### Clerk (source of truth for identity)

- `User` — id, email, name, avatar
- `Organization` — id, name, slug, memberships, roles, invitations
- Roles: `org:admin` (full access, 8 permissions), `org:member` (limited, 2 permissions)

### Our localStorage (companion data, keyed by Clerk org.id)

```typescript
interface OrgMetadata {
  buyerPersona: 'people-leader' | 'business-leader';
  industry: string;
  sizeRange: '1-10' | '11-50' | '51-200' | '201-500' | '501-2000' | '2001+';
  currentChallenge: 'growth-phase' | 'transformation' | 'mna-integration'
                  | 'workforce-redesign' | 'ai-adoption' | 'other' | null;
}

// Storage key: 'bee-archetypes:org-meta:${orgId}'
```

**Why localStorage and not Clerk publicMetadata:** Clerk's client SDK rejects `organization.update({ publicMetadata })` with 403. Server-side write via `POST /v1/organizations/{id}` + Bearer secret is available but requires a backend. Deferred to Wave 7.

### Assessment result (sessionStorage + localStorage, keyed by token)

```typescript
// Storage keys: 'bee-archetypes:result:${token}' (both storages)
// token is a base36 random string generated at result save time
```

## Scoring engine (src/data/scoring.ts)

Pure function. Given a map of `questionId → optionId`, returns:

```typescript
interface ArchetypeResult {
  primary: Archetype;       // top score
  secondaries: [Archetype, Archetype];  // 2nd + 3rd
  shadow: Archetype;        // lowest score (the "cost of your strength")
  balance: [Archetype, Archetype];  // 4th + 5th (support archetypes)
  counterpartKey: 'Queen' | 'Catalyst' | 'Hygienist';  // AI pairing target
  scoreMap: Record<ArchetypeId, number>;
}
```

**Invariant enforcement:** `scripts/check-archetype-invariants.ts` walks every possible answer path and verifies all 15 archetypes are reachable as top-3. Bug caught during Wave 2b: Sentinel was unreachable (added Q19/Q20/Q21 to fix).

## Auth flow

```
Anonymous → /assessment → /results/:token       (works, no login)
Anonymous → /sign-up → Clerk email code → /dashboard
Anonymous → /get-started → <RedirectToSignIn>
Signed-in, no org → /dashboard → /get-started → create Clerk org → /org/:slug/dashboard
Signed-in, org exists → OrganizationSwitcher in header → pick org
```

`<ProtectedRoute>` (src/components/ProtectedRoute.tsx) wraps everything auth-gated:
- Clerk enabled + signed out → `<RedirectToSignIn>` with return_to preserved
- Clerk enabled + signed in → render children
- Clerk disabled (no VITE_CLERK_PUBLISHABLE_KEY) → render children (preview mode)

## Content pipeline

15 archetypes × 5 content fields (oneLiner, contribution, shadow, balance, aiPairing) were drafted by GLM-4.6 UD-Q4_K_XL running locally on starbase (M3 Ultra Mac Studio, 512GB):

- 14/15 archetypes: 28 min sequential (~112s each), max_tokens=3000
- Waggle: JSON truncation twice at max_tokens=4000, hand-written in same voice

To re-generate:
```sh
python3 scripts/generate-archetype-content.py    # writes /tmp/bee-archetype-content.json
python3 scripts/merge-generated-content.py        # merges into src/data/archetypes.ts
pnpm check:data                                    # validates invariants + content shape
```

## Fly deploy

- **App:** `bee-archetypes-beta`
- **Image:** `registry.fly.io/bee-archetypes-beta` (19 MB)
- **Build:** multi-stage Docker (node:22 build → nginx:1.27 runtime)
- **VITE_CLERK_PUBLISHABLE_KEY** is a build ARG (Vite inlines it into the bundle)
- **Basic auth** at nginx layer: `hive` / `honey2026` (Fly secrets)

## Known limits

- **Bundle size:** 384 KB (117 KB gzipped) main + 33 KB Clerk chunks. React 19 + Clerk are heavy. Code-splitting per route already applied via `React.lazy`.
- **No CI:** the invariant script runs manually. Add to a GitHub Action for Wave 7.
- **No backend:** no API routes, no database. All persistence is Clerk + localStorage. Fine for beta, migrate for scale.
- **Clerk dev tier:** capped at ~10K MAU, 100 orgs. Move to prod tier when a paying customer signs.
- **Content:** all 15 archetypes have GLM-drafted content, awaiting Miranda's copy-edit pass (see `docs/COPY-EDIT.md`).
