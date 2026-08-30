/**
 * Org member assessment routes — Wave 7l (real team data).
 *
 * POST /api/org/members/submit
 *   Signed-in user submits their own assessment result to their org.
 *   Body: { clerkOrgId, archetypeId, secondary1, secondary2, shadowId,
 *           counterpartKey, displayName?, email? }
 *   Upserts by (clerk_user_id, clerk_org_id) — taking the assessment
 *   twice just updates your result.
 *
 * GET /api/org/members?clerkOrgId=xxx
 *   Returns all assessed members for the given org. Requires the
 *   requesting user to be authenticated (Clerk JWT).
 *   Does NOT verify that the user is actually a member of that org
 *   (Clerk org membership is enforced by ProtectedRoute on the frontend;
 *   adding server-side org membership verification is Wave 7m+).
 */

import { verifyToken } from '@clerk/backend';
import type { Hono } from 'hono';
import { db } from '../db/index.js';

const VALID_ARCHETYPE_IDS = new Set([
  'queen','forager','alchemist','pollinator','scout',
  'builder','catalyst','archivist','nurse','waggle','regulator',
  'hygienist','guardian','sentinel','swarm-leader',
]);
const VALID_COUNTERPART_KEYS = new Set(['Queen','Catalyst','Hygienist']);

async function resolveUserId(
  c: { req: { header: (k: string) => string | undefined } },
  clerkSecretKey: string | undefined,
): Promise<string | null> {
  const qaTokenEnv = process.env.QA_BEARER_TOKEN;
  const qaHeader = (c.req.header('x-qa-bearer') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (qaTokenEnv && qaHeader && qaHeader === qaTokenEnv) return 'qa-runner';
  const authHeader = (c.req.header('x-clerk-auth-token') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!authHeader) return null;
  try {
    if (!clerkSecretKey) throw new Error('no clerk secret');
    const verified = await verifyToken(authHeader, { secretKey: clerkSecretKey });
    return verified.sub;
  } catch {
    return null;
  }
}

// Prepared statements (created once at module load after DB is ready).
function getStmts() {
  const upsertMember = db.prepare(`
    INSERT INTO org_members
      (clerk_user_id, clerk_org_id, display_name, email,
       archetype_id, secondary_1, secondary_2, shadow_id, counterpart_key, submitted_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch('now','subsec')*1000)
    ON CONFLICT(clerk_user_id, clerk_org_id) DO UPDATE SET
      display_name    = excluded.display_name,
      email           = excluded.email,
      archetype_id    = excluded.archetype_id,
      secondary_1     = excluded.secondary_1,
      secondary_2     = excluded.secondary_2,
      shadow_id       = excluded.shadow_id,
      counterpart_key = excluded.counterpart_key,
      submitted_at    = excluded.submitted_at
  `);

  const getMembers = db.prepare(`
    SELECT clerk_user_id, display_name, email,
           archetype_id, secondary_1, secondary_2, shadow_id, counterpart_key,
           submitted_at
    FROM org_members
    WHERE clerk_org_id = ?
    ORDER BY submitted_at DESC
  `);

  const getMember = db.prepare(`
    SELECT * FROM org_members
    WHERE clerk_user_id = ? AND clerk_org_id = ?
  `);

  return { upsertMember, getMembers, getMember };
}

let stmts: ReturnType<typeof getStmts> | null = null;
function getOrInitStmts() {
  if (!stmts) stmts = getStmts();
  return stmts;
}

export function registerOrgMemberRoutes(app: Hono) {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  // ── POST /api/org/members/submit ────────────────────────────────────────
  app.post('/api/org/members/submit', async (c) => {
    const userId = await resolveUserId(c as Parameters<typeof resolveUserId>[0], clerkSecretKey);
    if (!userId) return c.json({ error: 'unauthorized' }, 401);

    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_json' }, 400); }
    if (!body || typeof body !== 'object') return c.json({ error: 'invalid_body' }, 400);

    const b = body as Record<string, unknown>;
    const clerkOrgId     = typeof b.clerkOrgId    === 'string' ? b.clerkOrgId.trim()    : '';
    const archetypeId    = typeof b.archetypeId   === 'string' ? b.archetypeId.trim()   : '';
    const secondary1     = typeof b.secondary1    === 'string' ? b.secondary1.trim()    : '';
    const secondary2     = typeof b.secondary2    === 'string' ? b.secondary2.trim()    : '';
    const shadowId       = typeof b.shadowId      === 'string' ? b.shadowId.trim()      : '';
    const counterpartKey = typeof b.counterpartKey=== 'string' ? b.counterpartKey.trim(): '';
    const displayName    = typeof b.displayName   === 'string' ? b.displayName.trim()   : '';
    const email          = typeof b.email         === 'string' ? b.email.trim()         : '';

    if (!clerkOrgId)                             return c.json({ error: 'clerkOrgId required' }, 400);
    if (!VALID_ARCHETYPE_IDS.has(archetypeId))   return c.json({ error: 'invalid archetypeId' }, 400);
    if (!VALID_ARCHETYPE_IDS.has(secondary1))    return c.json({ error: 'invalid secondary1' }, 400);
    if (!VALID_ARCHETYPE_IDS.has(secondary2))    return c.json({ error: 'invalid secondary2' }, 400);
    if (!VALID_ARCHETYPE_IDS.has(shadowId))      return c.json({ error: 'invalid shadowId' }, 400);
    if (!VALID_COUNTERPART_KEYS.has(counterpartKey)) return c.json({ error: 'invalid counterpartKey' }, 400);

    // QA runner: don't persist
    if (userId === 'qa-runner') {
      return c.json({ ok: true, qa: true });
    }

    try {
      const { upsertMember } = getOrInitStmts();
      upsertMember.run(
        userId, clerkOrgId, displayName, email,
        archetypeId, secondary1, secondary2, shadowId, counterpartKey,
      );
      console.log(`[org/members] submitted ${userId} → ${clerkOrgId} as ${archetypeId}`);
      return c.json({ ok: true });
    } catch (err) {
      console.error('[org/members/submit] db error', err);
      return c.json({ error: 'db_error' }, 500);
    }
  });

  // ── GET /api/org/members ─────────────────────────────────────────────────
  app.get('/api/org/members', async (c) => {
    const userId = await resolveUserId(c as Parameters<typeof resolveUserId>[0], clerkSecretKey);
    if (!userId) return c.json({ error: 'unauthorized' }, 401);

    const clerkOrgId = c.req.query('clerkOrgId') ?? '';
    if (!clerkOrgId) return c.json({ error: 'clerkOrgId required' }, 400);

    try {
      const { getMembers } = getOrInitStmts();
      const rows = getMembers.all(clerkOrgId) as {
        clerk_user_id: string;
        display_name: string;
        email: string;
        archetype_id: string;
        secondary_1: string;
        secondary_2: string;
        shadow_id: string;
        counterpart_key: string;
        submitted_at: number;
      }[];

      return c.json({
        members: rows.map((r) => ({
          clerkUserId:  r.clerk_user_id,
          displayName:  r.display_name || r.email.split('@')[0] || 'Team member',
          email:        r.email,
          archetypeId:  r.archetype_id,
          secondaries:  [r.secondary_1, r.secondary_2] as [string, string],
          shadowId:     r.shadow_id,
          counterpartKey: r.counterpart_key,
          submittedAt:  r.submitted_at,
        })),
      });
    } catch (err) {
      console.error('[org/members] db error', err);
      return c.json({ error: 'db_error' }, 500);
    }
  });
}
