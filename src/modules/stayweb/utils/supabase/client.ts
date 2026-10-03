// TODO: replace with Stayweb admin API
import { createClient } from '@supabase/supabase-js';
import { lazy } from '../../../../shell/lazy';
import { projectId, publicAnonKey } from './info';

// ─── Custom in-memory lock to replace navigator.locks ───
// navigator.locks causes "Lock was not released within 5000ms" errors
// when React Strict Mode double-mounts components (the first mount's lock
// becomes orphaned on unmount). An in-memory lock avoids this entirely
// since it's cleaned up by the JS garbage collector.
const _locks = new Map<string, Promise<any>>();

async function inMemoryLock<R>(
  name: string,
  acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> {
  // Wait for any existing lock on this name to resolve (with safety timeout)
  // Use a shorter effective deadline to avoid cascading timeouts in callers
  const effectiveTimeout = Math.min(Math.max(acquireTimeout || 5000, 3000), 8000);
  const lockDeadline = Date.now() + effectiveTimeout;
  while (_locks.has(name)) {
    if (Date.now() > lockDeadline) {
      // Lock is stuck — force-release it to prevent permanent deadlock
      console.warn(`[inMemoryLock] Lock "${name}" stuck for ${effectiveTimeout}ms — force-releasing`);
      _locks.delete(name);
      break;
    }
    try {
      await Promise.race([
        _locks.get(name),
        new Promise(r => setTimeout(r, 500)), // Check every 500ms (was 2s — too slow)
      ]);
    } catch {
      // Previous lock holder threw — that's fine, we can proceed
      break;
    }
  }

  // Acquire the lock by setting our promise
  let resolve: () => void;
  const lockPromise = new Promise<void>((r) => { resolve = r; });
  _locks.set(name, lockPromise);

  try {
    return await fn();
  } finally {
    _locks.delete(name);
    resolve!();
  }
}

// Created on first use (shell/lazy), so importing Stayweb never connects or throws.
export const supabase = lazy(() => {
  const client = createClient(`https://${projectId}.supabase.co`, publicAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: inMemoryLock,
    }
  });
  prewarmServer();
  return client;
});

// ─── Deduplicated session initializer ───
// Prevents double getSession() calls during React Strict Mode re-mounts.
// Includes timeout protection: if getSession() hangs (lock contention,
// unreachable auth service), the promise rejects after AUTH_TIMEOUT_MS
// so callers aren't stuck forever with isLoading=true.
const AUTH_TIMEOUT_MS = 10_000; // 10s — generous for cold starts

let _initialSessionPromise: ReturnType<typeof supabase.auth.getSession> | null = null;

export function getInitialSession() {
  if (!_initialSessionPromise) {
    const sessionCall = supabase.auth.getSession();
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout: getSession() did not respond within 10s')), AUTH_TIMEOUT_MS)
    );
    // Race the actual call against the timeout. If timeout wins, the cached
    // promise is rejected — callers will catch it and resetSessionCache() so
    // the next attempt makes a fresh getSession() call.
    _initialSessionPromise = Promise.race([sessionCall, timeout]) as typeof sessionCall;
  }
  return _initialSessionPromise;
}

// Allow resetting after sign-out so the next sign-in gets a fresh check
export function resetSessionCache() {
  _initialSessionPromise = null;
}

// ─── Server pre-warm ───────────────────────────────────────────────────────
// Fire-and-forget ping to the /health endpoint on module load.
// This triggers the Edge Function cold start BEFORE auth + batch-sync,
// so by the time the real request fires, the Deno runtime is already warm.
const PREWARM_URL = `https://${projectId}.supabase.co/functions/v1/stayweb-api/health`;
let _prewarmDone = false;

export function prewarmServer() {
  if (_prewarmDone) return;
  _prewarmDone = true;
  fetch(PREWARM_URL, { method: 'GET' }).catch(() => {});
}

// Prewarm now runs when the client is first created (see `supabase` above), not on import.
