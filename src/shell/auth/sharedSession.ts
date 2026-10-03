// ============================================================================
// One sign-in for every Wugweb product
// ============================================================================
// DocWeb, Stayweb, HRweb and ConsoleWeb all sign in against the same Supabase
// project (wugweb-x). On *.wugweb.studio this store keeps the Supabase session
// in cookies on .wugweb.studio, so signing in (or out) on doc., stay., hr. or
// console.wugweb.studio signs you in (or out) on all of them. Each product
// still checks your own membership for that product.
//
// Cookies are capped at about 4 KB, so the session is split into chunks
// (sb-wugweb-auth.0, .1, …). On localhost and preview URLs the cookies stay on
// the current host (localhost cookies are shared across ports).
// ============================================================================

export const SHARED_STORAGE_KEY = 'sb-wugweb-auth';

const CHUNK_SIZE = 3000;
const MAX_CHUNKS = 12;
const MAX_AGE = 60 * 60 * 24 * 400; // browsers cap cookie lifetime at 400 days

const hasDocument = () => typeof document !== 'undefined';

function cookieAttributes(maxAge: number): string {
  const onWugweb = /(^|\.)wugweb\.studio$/.test(window.location.hostname);
  const secure = window.location.protocol === 'https:';
  return `; path=/; max-age=${maxAge}; samesite=lax${onWugweb ? '; domain=.wugweb.studio' : ''}${secure ? '; secure' : ''}`;
}

function readCookie(name: string): string | null {
  const prefix = `${name}=`;
  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(prefix)) return part.slice(prefix.length);
  }
  return null;
}

function clearChunks(key: string, from: number) {
  for (let i = from; i < MAX_CHUNKS; i++) {
    if (readCookie(`${key}.${i}`) !== null) document.cookie = `${key}.${i}=${cookieAttributes(0)}`;
  }
}

export const sharedSessionStorage = {
  getItem(key: string): string | null {
    if (!hasDocument()) return null;
    let encoded = '';
    for (let i = 0; i < MAX_CHUNKS; i++) {
      const chunk = readCookie(`${key}.${i}`);
      if (chunk === null) break;
      encoded += chunk;
    }
    if (!encoded) return null;
    try { return decodeURIComponent(encoded); } catch { return null; }
  },
  setItem(key: string, value: string): void {
    if (!hasDocument()) return;
    const encoded = encodeURIComponent(value);
    const count = Math.ceil(encoded.length / CHUNK_SIZE) || 1;
    if (count > MAX_CHUNKS) return; // never write a partial session
    for (let i = 0; i < count; i++) {
      document.cookie = `${key}.${i}=${encoded.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)}${cookieAttributes(MAX_AGE)}`;
    }
    clearChunks(key, count);
  },
  removeItem(key: string): void {
    if (!hasDocument()) return;
    clearChunks(key, 0);
  },
};

/** Auth options every Wugweb app passes to createClient. */
export const sharedAuthOptions = {
  storage: sharedSessionStorage,
  storageKey: SHARED_STORAGE_KEY,
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
  flowType: 'implicit' as const, // invite and reset links carry tokens in the URL hash
};
