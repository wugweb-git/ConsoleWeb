// TODO: replace with Docweb admin API
// ============================================================================
// DocWeb — Turso (libSQL) Database Client
// ============================================================================
// This module provides a singleton client for connecting to the Turso database.
// It reads connection config from the AdminDatabase UI (stored in memory)
// and will be replaced with env vars in production deployment.
//
// Usage:
//   import { getDB, isDBConnected } from '../lib/db';
//   const db = getDB();
//   const result = await db.execute('SELECT * FROM users');
// ============================================================================

import { createClient, type Client, type ResultSet } from '@libsql/client';

// ────────────────────────────────────────────
// Connection config (in-memory store)
// ────────────────────────────────────────────

interface DBConfig {
  url: string;
  authToken: string;
}

let _config: DBConfig | null = null;
let _client: Client | null = null;

/**
 * Set the DB connection config. Called from AdminDatabase when saving credentials.
 */
export function setDBConfig(config: DBConfig) {
  _config = config;
  _client = null; // Reset client so next getDB() creates a fresh one
}

/**
 * Get the current DB config (for display in AdminDatabase).
 */
export function getDBConfig(): DBConfig | null {
  return _config;
}

/**
 * Get or create the libSQL client singleton.
 * Throws if no config has been set.
 */
export function getDB(): Client {
  if (!_config) {
    throw new Error('Database not configured. Go to Admin → Database to set up your connection.');
  }
  if (!_client) {
    _client = createClient({
      url: _config.url,
      authToken: _config.authToken,
    });
  }
  return _client;
}

/**
 * Check if we have a valid DB config set.
 */
export function isDBConfigured(): boolean {
  return _config !== null && _config.url.length > 0 && _config.authToken.length > 0;
}

/**
 * Test the connection by running a simple query.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export async function testDBConnection(config?: DBConfig): Promise<{ ok: boolean; error?: string; latencyMs?: number }> {
  const cfg = config || _config;
  if (!cfg) {
    return { ok: false, error: 'No database configuration provided.' };
  }

  const start = performance.now();
  try {
    const client = createClient({ url: cfg.url, authToken: cfg.authToken });
    await client.execute('SELECT 1 as ping');
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, latencyMs };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Connection failed' };
  }
}

/**
 * Execute a raw SQL string (for migrations, schema creation, etc.).
 * Splits by semicolons and executes each statement.
 */
export async function executeSQL(sql: string): Promise<{ ok: boolean; results: ResultSet[]; error?: string }> {
  try {
    const db = getDB();
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const results: ResultSet[] = [];
    for (const stmt of statements) {
      const result = await db.execute(stmt);
      results.push(result);
    }
    return { ok: true, results };
  } catch (err: any) {
    return { ok: false, results: [], error: err?.message || 'SQL execution failed' };
  }
}

/**
 * Execute a batch of statements in a transaction.
 */
export async function executeBatch(statements: string[]): Promise<{ ok: boolean; error?: string }> {
  try {
    const db = getDB();
    await db.batch(
      statements.filter(s => s.trim().length > 0).map(s => ({ sql: s, args: [] })),
      'write'
    );
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Batch execution failed' };
  }
}
