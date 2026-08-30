/**
 * Agentic Counterpart chat endpoint.
 *
 * Wave 1 scope: single `POST /api/agent/chat` accepting:
 *   {
 *     archetypeId: string,       // 'queen', 'forager', ...
 *     counterpartKey: 'Queen' | 'Catalyst' | 'Hygienist',
 *     messages: { role: 'user' | 'assistant', content: string }[],
 *     isFirstTurn: boolean,      // if true, use extended thinking
 *   }
 *
 * Returns: { text: string, usage: {...}, model: string, thinkingUsed: boolean }
 *
 * Safety:
 *   - Clerk JWT verified server-side. No archetype trust from client
 *     beyond string tag (this beta doesn't hold spendable secrets so
 *     the risk is low, but we still verify identity).
 *   - Turn cap: hard 25 messages/user across the ephemeral in-memory
 *     store per hour. Blunt but effective for beta.
 *   - Prompt caching: system prompt is cached (ephemeral 5-min TTL).
 *
 * The Anthropic key never leaves this process.
 */
import { verifyToken } from '@clerk/backend';
import Anthropic from '@anthropic-ai/sdk';
import type { Hono } from 'hono';
import {
  buildSystemPrompt,
  AGENTIC_COUNTERPARTS,
  isValidArchetype,
  isValidCounterpartKey,
  aiPairingProse,
} from '../agents/prompts.js';

const HAIKU_MODEL = 'claude-haiku-4-5';
const MAX_MESSAGES_PER_TURN = 20;   // reject requests with runaway history
const TURN_CAP_PER_USER_PER_HOUR = 25;

const turnCounts = new Map<string, { count: number; windowStart: number }>();

function checkTurnCap(userId: string): boolean {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  const record = turnCounts.get(userId);
  if (!record || now - record.windowStart > oneHour) {
    turnCounts.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (record.count >= TURN_CAP_PER_USER_PER_HOUR) return false;
  record.count += 1;
  return true;
}

export function registerAgentRoutes(app: Hono) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

  // Simple GET to confirm the endpoint is wired.
  app.get('/api/agent/status', (c) => {
    return c.json({
      ok: true,
      anthropicConfigured: !!anthropicKey,
      clerkConfigured: !!clerkSecretKey,
      model: HAIKU_MODEL,
      counterparts: AGENTIC_COUNTERPARTS.map((cp) => cp.key),
      turnCapPerHour: TURN_CAP_PER_USER_PER_HOUR,
    });
  });

  app.post('/api/agent/chat', async (c) => {
    if (!anthropic) {
      return c.json({ error: 'agent_not_configured' }, 500);
    }

    // ---- 1. Clerk auth ----
    const authHeader = c.req.header('x-clerk-auth-token') ?? '';
    const clerkToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!clerkToken) {
      return c.json({ error: 'missing_clerk_token' }, 401);
    }
    let userId: string;
    try {
      if (!clerkSecretKey) throw new Error('no clerk secret');
      const verified = await verifyToken(clerkToken, { secretKey: clerkSecretKey });
      userId = verified.sub;
    } catch (err) {
      console.warn('[agent/chat] clerk verify failed', err);
      return c.json({ error: 'invalid_clerk_token' }, 401);
    }

    // ---- 2. Rate limit ----
    if (!checkTurnCap(userId)) {
      return c.json({ error: 'rate_limited', retryAfterSeconds: 3600 }, 429);
    }

    // ---- 3. Parse + validate body ----
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'invalid_json' }, 400);
    }
    if (!body || typeof body !== 'object') {
      return c.json({ error: 'invalid_body' }, 400);
    }
    const b = body as Record<string, unknown>;
    const archetypeId = typeof b.archetypeId === 'string' ? b.archetypeId : '';
    const counterpartKey = typeof b.counterpartKey === 'string' ? b.counterpartKey : '';
    const isFirstTurn = b.isFirstTurn === true;
    const messages = Array.isArray(b.messages) ? b.messages : [];

    if (!isValidArchetype(archetypeId)) {
      return c.json({ error: 'invalid_archetype' }, 400);
    }
    if (!isValidCounterpartKey(counterpartKey)) {
      return c.json({ error: 'invalid_counterpart' }, 400);
    }
    if (messages.length === 0 || messages.length > MAX_MESSAGES_PER_TURN) {
      return c.json({ error: 'invalid_messages_length' }, 400);
    }

    // Normalize messages
    const normalized = messages
      .filter(
        (m): m is { role: 'user' | 'assistant'; content: string } =>
          !!m &&
          typeof m === 'object' &&
          (m as { role?: unknown }).role !== undefined &&
          typeof (m as { content?: unknown }).content === 'string' &&
          ((m as { role: string }).role === 'user' ||
            (m as { role: string }).role === 'assistant'),
      )
      .map((m) => ({
        role: m.role,
        content: m.content.slice(0, 4000), // cap per-message user input
      }));

    if (normalized.length === 0) {
      return c.json({ error: 'no_valid_messages' }, 400);
    }
    if (normalized[normalized.length - 1].role !== 'user') {
      return c.json({ error: 'last_message_must_be_user' }, 400);
    }

    // ---- 4. Build the prompt ----
    const systemPrompt = buildSystemPrompt({
      counterpartKey: counterpartKey as 'Queen' | 'Catalyst' | 'Hygienist',
      archetypeId,
      aiPairingProse: aiPairingProse(archetypeId) ?? '',
    });

    // ---- 5. Call Anthropic ----
    try {
      const thinkingParam = isFirstTurn
        ? { type: 'enabled' as const, budget_tokens: 1024 }
        : undefined;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = {
        model: HAIKU_MODEL,
        max_tokens: isFirstTurn ? 2500 : 1200,
        // Cache the immutable system prompt (5-minute ephemeral).
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: normalized,
      };
      if (thinkingParam) req.thinking = thinkingParam;

      const response = await anthropic.messages.create(req);

      // The response.content is a list of blocks. Concatenate text blocks
      // in order; skip thinking blocks (client doesn't need them).
      const textParts: string[] = [];
      for (const block of response.content) {
        if (block.type === 'text') textParts.push(block.text);
      }
      const text = textParts.join('\n').trim();

      // Log for cost dashboard (Wave 3 will persist).
      console.log('[agent/chat]', JSON.stringify({
        userId,
        counterpart: counterpartKey,
        archetype: archetypeId,
        firstTurn: isFirstTurn,
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        cacheCreationTokens: response.usage.cache_creation_input_tokens ?? 0,
        cacheReadTokens: response.usage.cache_read_input_tokens ?? 0,
      }));

      return c.json({
        text,
        model: response.model,
        thinkingUsed: !!thinkingParam,
        usage: {
          input: response.usage.input_tokens,
          output: response.usage.output_tokens,
          cacheCreation: response.usage.cache_creation_input_tokens ?? 0,
          cacheRead: response.usage.cache_read_input_tokens ?? 0,
        },
      });
    } catch (err) {
      console.error('[agent/chat] anthropic error', err);
      return c.json(
        {
          error: 'anthropic_error',
          message: err instanceof Error ? err.message : String(err),
        },
        502,
      );
    }
  });
}
