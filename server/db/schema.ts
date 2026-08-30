/**
 * SQLite schema for the Agentic Counterpart persistence layer.
 * Wave 2 (2026-08-29).
 *
 * The DB file lives at /data/agent.db on the Fly machine (mounted volume
 * agent_db). In local dev it falls back to ./dev-agent.db (gitignored).
 *
 * Migrations are versioned by a simple user_version pragma. Each numbered
 * migration runs exactly once; the current version is stored in the DB.
 */

import type Database from 'better-sqlite3';

const MIGRATIONS: { version: number; sql: string }[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        clerk_user_id       TEXT UNIQUE NOT NULL,
        archetype_id        TEXT NOT NULL,
        counterpart_key     TEXT NOT NULL,
        onboarding_complete INTEGER NOT NULL DEFAULT 0,
        created_at          INTEGER NOT NULL,
        updated_at          INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS onboarding_answers (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question_key TEXT NOT NULL,
        answer       TEXT NOT NULL,
        created_at   INTEGER NOT NULL,
        UNIQUE(user_id, question_key)
      );

      CREATE TABLE IF NOT EXISTS chat_threads (
        id           INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        clerk_org_id TEXT,
        created_at   INTEGER NOT NULL,
        updated_at   INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        thread_id     INTEGER NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
        role          TEXT NOT NULL CHECK(role IN ('user','assistant')),
        content       TEXT NOT NULL,
        input_tokens  INTEGER,
        output_tokens INTEGER,
        model         TEXT,
        created_at    INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_threads_user     ON chat_threads(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_messages_thread  ON chat_messages(thread_id, created_at ASC);
      CREATE INDEX IF NOT EXISTS idx_onboarding_user  ON onboarding_answers(user_id, question_key);
    `,
  },
];

export function runMigrations(db: Database.Database): void {
  // WAL mode: better concurrency, fast writes, safe on Fly volumes.
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const currentVersion = (db.pragma('user_version') as { user_version: number }[])[0]
    .user_version;

  const pending = MIGRATIONS.filter((m) => m.version > currentVersion);
  if (pending.length === 0) {
    console.log(`[db] schema up to date (v${currentVersion})`);
    return;
  }

  for (const m of pending) {
    console.log(`[db] running migration v${m.version}`);
    db.transaction(() => {
      db.exec(m.sql);
      db.pragma(`user_version = ${m.version}`);
    })();
  }
  console.log(`[db] schema now at v${MIGRATIONS[MIGRATIONS.length - 1].version}`);
}
