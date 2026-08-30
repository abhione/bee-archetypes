/**
 * Bee Archetypes production server.
 *
 * Serves the Vite-built SPA under /assets/* and /, and hosts the
 * Agentic Counterpart API at /api/agent/*.
 *
 * Wave 1 scope (2026-08-29):
 *   - POST /api/agent/chat: Clerk-authed, Haiku 4.5 with extended
 *     thinking on turn 1, ephemeral prompt cache on immutable layers,
 *     hard turn cap. No SQLite yet — messages live in React state.
 *
 * Env:
 *   PORT                  - http port (Fly sets to 8080)
 *   ANTHROPIC_API_KEY     - required
 *   CLERK_SECRET_KEY      - required
 *   VITE_CLERK_PUBLISHABLE_KEY - required (Clerk needs both halves)
 *   BASIC_AUTH_USER/PASS  - optional, gate the whole site
 *   DISABLE_BASIC_AUTH    - "1" to skip the gate (dev only)
 */
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { registerAgentRoutes } from './routes/agent.js';
import { basicAuthMiddleware } from './middleware/basicAuth.js';

const PORT = Number(process.env.PORT ?? 8080);
const DIST_DIR = process.env.DIST_DIR ?? './dist';

const app = new Hono();

app.use('*', logger());

// Basic-auth gate for the entire site (matches the old nginx behavior).
app.use('*', basicAuthMiddleware);

// API routes go under /api. Mount before the static-file fallback.
registerAgentRoutes(app);

// Health check for Fly's smoke tests.
app.get('/api/health', (c) => c.json({ ok: true, ts: Date.now() }));

// Serve built SPA assets with aggressive cache.
app.use(
  '/assets/*',
  serveStatic({
    root: DIST_DIR,
    onFound: (_path, c) => {
      c.header('Cache-Control', 'public, max-age=31536000, immutable');
    },
  }),
);

// Serve the SPA index for any other route (react-router handles client-side).
app.get('*', async (c) => {
  const url = new URL(c.req.url);
  // Try static file first for non-asset paths like /favicon.ico
  if (url.pathname !== '/' && !url.pathname.startsWith('/api')) {
    const staticHandler = serveStatic({ root: DIST_DIR });
    const res = await staticHandler(c, async () => {});
    if (res && res.status !== 404) return res;
  }
  // Fallback: serve index.html so react-router can boot.
  const indexHandler = serveStatic({ root: DIST_DIR, path: 'index.html' });
  return (await indexHandler(c, async () => {})) ?? c.text('Not found', 404);
});

console.log(`bee-archetypes server listening on :${PORT} (dist=${DIST_DIR})`);
serve({ fetch: app.fetch, port: PORT });
