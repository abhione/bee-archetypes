# Bee Archetypes

The **Bee Archetypes MVP** — an assessment wedge for the Hive Leadership OS.

## What this is

A three-minute assessment that names a person's natural contribution across five organizational systems, and pairs each archetype with an Agentic Counterpart. Three surfaces in one app:

1. **Individual assessment** (`/`, `/assessment`, `/results/:token`) — free, no auth needed, shareable result
2. **Buyer signup** (`/get-started`, `/org/new`) — People-Leader or Business-Leader onboarding for team beta
3. **Org dashboard** (`/org/:slug/dashboard`) — five-system coverage view + executive readout

## Stack

- Vite + React 19 + TypeScript strict
- Tailwind CSS v4
- Framer Motion for micro-interactions
- Clerk (auth + org membership)
- react-router v7
- Fly.io + nginx + basic auth (beta gate)

## Design tokens

- Base: `#0E0E10` (hive black), `#1A1A1D` (charcoal), `#2C2C33` (slate)
- Accent: `#E8A317` (honey gold)
- Type: Fraunces (serif), Inter (sans)

## Getting started (local)

```sh
pnpm install
pnpm dev
```

Runs on `http://localhost:5173`.

## Deploy to Fly

```sh
fly launch --copy-config --no-deploy   # first time only
fly secrets set BASIC_AUTH_PASS=<pw> VITE_CLERK_PUBLISHABLE_KEY=<key>
fly deploy
```

Beta URL: `https://bee-archetypes-beta.fly.dev`
Basic auth username: `hive`

## Architecture

See `.omc/PLAN.md` for the 5-wave build plan.

## IP

Bee Archetypes is the MVP wedge of the Hive Leadership OS, backed by Hive Enterprises. Framework and archetype system © 2026 Miranda / Hive Enterprises. Assessment implementation MIT.
