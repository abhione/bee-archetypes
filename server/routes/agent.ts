/**
 * Agentic Counterpart chat + profile endpoints.
 *
 * Wave 2 (2026-08-29):
 *   - GET  /api/agent/profile — returns user's onboarding state + thread messages
 *   - POST /api/agent/chat   — Clerk-authed, persists messages, runs onboarding
 *
 * Auth: Clerk JWT via x-clerk-auth-token, OR QA bypass via x-qa-bearer
 * when QA_BEARER_TOKEN env var is set.
 *
 * The Anthropic key never leaves this process.
 */
import { verifyToken } from '@clerk/backend';
import Anthropic from '@anthropic-ai/sdk';
import type { Hono } from 'hono';
import {
  buildSystemPrompt,
  AGENTIC_COUNTERPARTS,
  getOnboardingQuestions,
  aiPairingProse,
  isValidArchetype,
  isValidCounterpartKey,
  type CounterpartKey,
  type PersonalizationContext,
} from '../agents/prompts.js';
import {
  getOrCreateUser,
  getOrCreateThread,
  getRecentMessages,
  getAnswers,
  saveAnswer,
  saveMessage,
  markOnboardingComplete,
} from '../db/queries.js';

const HAIKU_MODEL = 'claude-haiku-4-5';
const MAX_MESSAGES_PER_TURN = 40;
const TURN_CAP_PER_USER_PER_HOUR = 25;
const RECENT_MESSAGES_LIMIT = 40; // load last 40 for profile + context

// In-memory rate limit (resets on redeploy — acceptable for beta).
const turnCounts = new Map<string, { count: number; windowStart: number }>();
function checkTurnCap(userId: string): boolean {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;
  const rec = turnCounts.get(userId);
  if (!rec || now - rec.windowStart > ONE_HOUR) {
    turnCounts.set(userId, { count: 1, windowStart: now });
    return true;
  }
  if (rec.count >= TURN_CAP_PER_USER_PER_HOUR) return false;
  rec.count += 1;
  return true;
}

// ── Auth helper ──────────────────────────────────────────────────────────────

async function resolveUserId(
  c: { req: { header: (k: string) => string | undefined } },
  clerkSecretKey: string | undefined,
): Promise<{ userId: string; isQa: boolean } | null> {
  const qaTokenEnv = process.env.QA_BEARER_TOKEN;
  const qaHeader = (c.req.header('x-qa-bearer') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (qaTokenEnv && qaHeader && qaHeader === qaTokenEnv) {
    return { userId: 'qa-runner', isQa: true };
  }
  const authHeader = (c.req.header('x-clerk-auth-token') ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!authHeader) return null;
  try {
    if (!clerkSecretKey) throw new Error('no clerk secret');
    const verified = await verifyToken(authHeader, { secretKey: clerkSecretKey });
    return { userId: verified.sub, isQa: false };
  } catch {
    return null;
  }
}

// ── Route registration ───────────────────────────────────────────────────────

export function registerAgentRoutes(app: Hono) {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

  // Health + config probe.
  app.get('/api/agent/status', (c) =>
    c.json({
      ok: true,
      anthropicConfigured: !!anthropicKey,
      clerkConfigured: !!clerkSecretKey,
      model: HAIKU_MODEL,
      counterparts: AGENTIC_COUNTERPARTS.map((cp) => cp.key),
      turnCapPerHour: TURN_CAP_PER_USER_PER_HOUR,
      persistenceEnabled: true,
    }),
  );

  // ── GET /api/agent/profile ─────────────────────────────────────────────────
  // Returns the signed-in user's onboarding state + recent thread messages.
  // The panel calls this on mount to pre-populate the chat.
  //
  // Query params:
  //   archetypeId    — 'queen', 'forager', etc.
  //   counterpartKey — 'Queen' | 'Catalyst' | 'Hygienist'
  //   clerkOrgId     — optional org context
  app.get('/api/agent/profile', async (c) => {
    const auth = await resolveUserId(c as Parameters<typeof resolveUserId>[0], clerkSecretKey);
    if (!auth) return c.json({ error: 'unauthorized' }, 401);

    const archetypeId = c.req.query('archetypeId') ?? '';
    const counterpartKey = c.req.query('counterpartKey') ?? '';
    const clerkOrgId = c.req.query('clerkOrgId') ?? null;

    if (!isValidArchetype(archetypeId) || !isValidCounterpartKey(counterpartKey)) {
      return c.json({ error: 'invalid_params' }, 400);
    }

    // QA runner always gets a clean slate.
    if (auth.isQa) {
      return c.json({
        onboardingComplete: false,
        answerCount: 0,
        totalQuestions: getOnboardingQuestions(counterpartKey as CounterpartKey).length,
        messages: [],
      });
    }

    const user = getOrCreateUser(auth.userId, archetypeId, counterpartKey);
    const thread = getOrCreateThread(user.id, clerkOrgId);
    const rawMessages = getRecentMessages(thread.id, RECENT_MESSAGES_LIMIT);
    const answers = getAnswers(user.id);

    return c.json({
      onboardingComplete: user.onboarding_complete === 1,
      answerCount: answers.length,
      totalQuestions: getOnboardingQuestions(counterpartKey as CounterpartKey).length,
      messages: rawMessages.map((m) => ({ role: m.role, content: m.content })),
    });
  });

  // ── POST /api/agent/chat ───────────────────────────────────────────────────
  app.post('/api/agent/chat', async (c) => {
    if (!anthropic) return c.json({ error: 'agent_not_configured' }, 500);

    const auth = await resolveUserId(c as Parameters<typeof resolveUserId>[0], clerkSecretKey);
    if (!auth) return c.json({ error: 'missing_or_invalid_token' }, 401);

    if (!checkTurnCap(auth.userId)) {
      return c.json({ error: 'rate_limited', retryAfterSeconds: 3600 }, 429);
    }

    // Parse + validate body.
    let body: unknown;
    try { body = await c.req.json(); } catch { return c.json({ error: 'invalid_json' }, 400); }
    if (!body || typeof body !== 'object') return c.json({ error: 'invalid_body' }, 400);

    const b = body as Record<string, unknown>;
    const archetypeId    = typeof b.archetypeId    === 'string' ? b.archetypeId    : '';
    const counterpartKey = typeof b.counterpartKey === 'string' ? b.counterpartKey : '';
    const clerkOrgId     = typeof b.clerkOrgId     === 'string' ? b.clerkOrgId     : null;
    // isFirstTurn is now advisory (used only for extended-thinking decision).
    // We derive the real onboarding state from the DB.
    const isFirstTurnHint = b.isFirstTurn === true;

    const messages = Array.isArray(b.messages) ? b.messages : [];

    if (!isValidArchetype(archetypeId))        return c.json({ error: 'invalid_archetype' }, 400);
    if (!isValidCounterpartKey(counterpartKey)) return c.json({ error: 'invalid_counterpart' }, 400);
    if (messages.length === 0 || messages.length > MAX_MESSAGES_PER_TURN) {
      return c.json({ error: 'invalid_messages_length' }, 400);
    }

    // Normalize messages.
    type Msg = { role: 'user' | 'assistant'; content: string };
    const normalized: Msg[] = messages
      .filter((m): m is Msg =>
        !!m && typeof m === 'object' &&
        (typeof (m as Msg).content === 'string') &&
        ((m as Msg).role === 'user' || (m as Msg).role === 'assistant'),
      )
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (normalized.length === 0 || normalized[normalized.length - 1].role !== 'user') {
      return c.json({ error: 'last_message_must_be_user' }, 400);
    }

    // ── Persistence layer ──────────────────────────────────────────────────

    // For QA runner: skip DB writes; build a clean ephemeral context.
    let onboardingComplete = false;
    let answerCount = 0;
    let personalization: PersonalizationContext[] = [];
    let dbThreadId: number | null = null;

    if (!auth.isQa) {
      const user    = getOrCreateUser(auth.userId, archetypeId, counterpartKey);
      const thread  = getOrCreateThread(user.id, clerkOrgId);
      dbThreadId = thread.id;

      // Count existing messages BEFORE saving the new user message.
      const prevMessages = getRecentMessages(thread.id, RECENT_MESSAGES_LIMIT);
      const prevAgentCount = prevMessages.filter((m) => m.role === 'assistant').length;

      const existingAnswers = getAnswers(user.id);
      const questions = getOnboardingQuestions(counterpartKey as CounterpartKey);
      let currentAnswerCount = existingAnswers.length;

      // If still in onboarding AND the agent has already asked at least one
      // question (prevAgentCount > 0), the incoming user message is the
      // answer to questions[currentAnswerCount].
      if (
        currentAnswerCount < questions.length &&
        prevAgentCount > 0
      ) {
        const incomingUserText = normalized[normalized.length - 1].content;
        const qKey = questions[currentAnswerCount].key;
        saveAnswer(user.id, qKey, incomingUserText);
        currentAnswerCount += 1;

        // If that was the last question, mark complete.
        if (currentAnswerCount >= questions.length) {
          markOnboardingComplete(user.id);
        }
      }

      answerCount = currentAnswerCount;
      onboardingComplete = answerCount >= questions.length;

      // Build personalization context from stored answers.
      const freshAnswers = getAnswers(user.id);
      personalization = freshAnswers.map((a) => ({
        questionKey: a.question_key,
        answer: a.answer,
      }));

      // Save incoming user message to DB.
      saveMessage(thread.id, 'user', normalized[normalized.length - 1].content);
    }

    // ── Build system prompt ─────────────────────────────────────────────────

    const systemPrompt = buildSystemPrompt({
      counterpartKey: counterpartKey as CounterpartKey,
      archetypeId,
      aiPairingProse: aiPairingProse(archetypeId) ?? '',
      personalization: onboardingComplete ? personalization : [],
      onboardingAnswerCount: answerCount,
    });

    // Extended thinking only on turn 1 of a session (the "framing" turn).
    // We use the isFirstTurnHint from the client (based on React message state),
    // which is a good proxy: the client sends true when its local state is empty.
    const useExtendedThinking = isFirstTurnHint || (answerCount === 0 && !onboardingComplete);

    // ── Call Anthropic ──────────────────────────────────────────────────────
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const req: any = {
        model: HAIKU_MODEL,
        max_tokens: useExtendedThinking ? 2500 : 1200,
        system: [
          {
            type: 'text',
            text: systemPrompt,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: normalized,
      };
      if (useExtendedThinking) req.thinking = { type: 'enabled', budget_tokens: 1024 };

      const response = await anthropic.messages.create(req);

      const textParts: string[] = [];
      for (const block of response.content) {
        if (block.type === 'text') textParts.push(block.text);
      }
      const text = textParts.join('\n').trim();

      // Persist agent response.
      if (!auth.isQa && dbThreadId !== null) {
        saveMessage(
          dbThreadId,
          'assistant',
          text,
          response.usage.input_tokens,
          response.usage.output_tokens,
          response.model,
        );
      }

      // Cost logging.
      console.log('[agent/chat]', JSON.stringify({
        userId:           auth.userId,
        counterpart:      counterpartKey,
        archetype:        archetypeId,
        firstTurn:        useExtendedThinking,
        onboardingAnswer: answerCount,
        onboardingDone:   onboardingComplete,
        inputTokens:      response.usage.input_tokens,
        outputTokens:     response.usage.output_tokens,
        cacheHit:         response.usage.cache_read_input_tokens ?? 0,
      }));

      return c.json({
        text,
        model: response.model,
        thinkingUsed: useExtendedThinking,
        onboardingComplete,
        answerCount,
        usage: {
          input:         response.usage.input_tokens,
          output:        response.usage.output_tokens,
          cacheCreation: response.usage.cache_creation_input_tokens ?? 0,
          cacheRead:     response.usage.cache_read_input_tokens ?? 0,
        },
      });
    } catch (err) {
      console.error('[agent/chat] anthropic error', err);
      return c.json(
        { error: 'anthropic_error', message: err instanceof Error ? err.message : String(err) },
        502,
      );
    }
  });
}
