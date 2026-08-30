/**
 * DB singleton. Opens (or creates) the SQLite file on first import,
 * runs migrations, exports a single typed Database instance.
 *
 * Path resolution:
 *   - /data/agent.db   — Fly production (volume mounted at /data)
 *   - ./dev-agent.db   — local development fallback
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { runMigrations } from './schema.js';

function openDb(): Database.Database {
  const flyPath = '/data/agent.db';
  const devPath = path.resolve('./dev-agent.db');

  const dbPath = fs.existsSync('/data') ? flyPath : devPath;
  console.log(`[db] opening ${dbPath}`);

  const db = new Database(dbPath);
  runMigrations(db);
  return db;
}

// Module-level singleton — Node caches module exports.
export const db = openDb();
