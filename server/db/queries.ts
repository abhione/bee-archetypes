/**
 * Typed query helpers for the agent persistence layer. All queries are
 * synchronous (better-sqlite3 is sync-only) and prepared once at module
 * load time for performance.
 */

import { db } from './index.js';

// ── Types ──────────────────────────────────────────────────────────────────

export interface DbUser {
  id: number;
  clerk_user_id: string;
  archetype_id: string;
  counterpart_key: string;
  onboarding_complete: number;  // 0 | 1
  created_at: number;
  updated_at: number;
}

export interface DbOnboardingAnswer {
  id: number;
  user_id: number;
  question_key: string;
  answer: string;
  created_at: number;
}

export interface DbThread {
  id: number;
  user_id: number;
  clerk_org_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface DbMessage {
  id: number;
  thread_id: number;
  role: 'user' | 'assistant';
  content: string;
  input_tokens: number | null;
  output_tokens: number | null;
  model: string | null;
  created_at: number;
}

// ── Prepared statements ───────────────────────────────────────────────────

const stmts = {
  getUser: db.prepare<[string], DbUser>(
    `SELECT * FROM users WHERE clerk_user_id = ?`,
  ),
  upsertUser: db.prepare<[string, string, string]>(
    `INSERT INTO users (clerk_user_id, archetype_id, counterpart_key, created_at, updated_at)
     VALUES (?, ?, ?, unixepoch('now','subsec')*1000, unixepoch('now','subsec')*1000)
     ON CONFLICT(clerk_user_id) DO UPDATE SET
       archetype_id    = excluded.archetype_id,
       counterpart_key = excluded.counterpart_key,
       updated_at      = excluded.updated_at`,
  ),
  markOnboardingComplete: db.prepare<[number]>(
    `UPDATE users SET onboarding_complete = 1, updated_at = unixepoch('now','subsec')*1000 WHERE id = ?`,
  ),

  getAnswers: db.prepare<[number], DbOnboardingAnswer>(
    `SELECT * FROM onboarding_answers WHERE user_id = ? ORDER BY created_at ASC`,
  ),
  upsertAnswer: db.prepare<[number, string, string]>(
    `INSERT INTO onboarding_answers (user_id, question_key, answer, created_at)
     VALUES (?, ?, ?, unixepoch('now','subsec')*1000)
     ON CONFLICT(user_id, question_key) DO UPDATE SET answer = excluded.answer`,
  ),

  getLatestThread: db.prepare<[number], DbThread>(
    `SELECT * FROM chat_threads WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1`,
  ),
  createThread: db.prepare<[number, string | null]>(
    `INSERT INTO chat_threads (user_id, clerk_org_id, created_at, updated_at)
     VALUES (?, ?, unixepoch('now','subsec')*1000, unixepoch('now','subsec')*1000)`,
  ),
  touchThread: db.prepare<[number]>(
    `UPDATE chat_threads SET updated_at = unixepoch('now','subsec')*1000 WHERE id = ?`,
  ),

  getMessages: db.prepare<[number, number], DbMessage>(
    `SELECT * FROM chat_messages WHERE thread_id = ? ORDER BY created_at ASC LIMIT ?`,
  ),
  insertMessage: db.prepare<[number, string, string, number | null, number | null, string | null]>(
    `INSERT INTO chat_messages (thread_id, role, content, input_tokens, output_tokens, model, created_at)
     VALUES (?, ?, ?, ?, ?, ?, unixepoch('now','subsec')*1000)`,
  ),
};

// ── User ──────────────────────────────────────────────────────────────────

export function getOrCreateUser(
  clerkUserId: string,
  archetypeId: string,
  counterpartKey: string,
): DbUser {
  stmts.upsertUser.run(clerkUserId, archetypeId, counterpartKey);
  return stmts.getUser.get(clerkUserId)!;
}

export function markOnboardingComplete(userId: number): void {
  stmts.markOnboardingComplete.run(userId);
}

// ── Onboarding answers ────────────────────────────────────────────────────

export function getAnswers(userId: number): DbOnboardingAnswer[] {
  return stmts.getAnswers.all(userId);
}

export function saveAnswer(userId: number, questionKey: string, answer: string): void {
  stmts.upsertAnswer.run(userId, questionKey, answer);
}

// ── Threads + messages ────────────────────────────────────────────────────

export function getOrCreateThread(userId: number, clerkOrgId: string | null): DbThread {
  const existing = stmts.getLatestThread.get(userId);
  if (existing) return existing;
  stmts.createThread.run(userId, clerkOrgId);
  return stmts.getLatestThread.get(userId)!;
}

export function getRecentMessages(threadId: number, limit = 40): DbMessage[] {
  return stmts.getMessages.all(threadId, limit);
}

export function saveMessage(
  threadId: number,
  role: 'user' | 'assistant',
  content: string,
  inputTokens?: number,
  outputTokens?: number,
  model?: string,
): DbMessage {
  stmts.insertMessage.run(threadId, role, content, inputTokens ?? null, outputTokens ?? null, model ?? null);
  stmts.touchThread.run(threadId);
  const messages = stmts.getMessages.all(threadId, 1000);
  return messages[messages.length - 1];
}
