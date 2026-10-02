// TODO: replace with Stayweb admin API
import { supabase } from '../../utils/supabase/client';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ead79e26`;

export interface ApiError {
  message: string;
  status: number;
}

// ─── Fallback: read token from localStorage when supabase.auth throws ───
function getStoredToken(): string | null {
  try {
    const storageKey = `sb-${projectId}-auth-token`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const accessToken = parsed?.access_token;
    if (!accessToken) return null;
    const expiresAt = parsed?.expires_at;
    if (expiresAt && Date.now() / 1000 > expiresAt) {
      console.warn('[ApiClient] Stored auth token is expired');
      return null;
    }
    return accessToken;
  } catch {
    return null;
  }
}

// ─── Get a fresh access token, refreshing if expired or about to expire ───
const AUTH_TOKEN_TIMEOUT = 8_000; // 8s — must resolve before fetch timeout (12-15s)

const getFreshToken = async (): Promise<string | null> => {
  // 1. FAST PATH — try localStorage first (instant, no lock contention)
  //    This avoids the getSession() lock deadlock when AuthContext is
  //    still initializing and holding the in-memory auth lock.
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  // 2. SLOW PATH — call getSession() only if localStorage has no valid token
  let session: any;
  try {
    const result = await Promise.race([
      supabase.auth.getSession(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('getSession() timed out after 8s')), AUTH_TOKEN_TIMEOUT)
      ),
    ]);
    session = result?.data?.session;
  } catch (e) {
    console.error('[ApiClient] supabase.auth.getSession() threw:', e);
    // Already tried localStorage above — no session available
    return null;
  }

  if (!session) {
    return null;
  }

  // Check if the token is expired or will expire within 60 seconds
  const expiresAt = session.expires_at; // Unix timestamp in seconds
  const now = Math.floor(Date.now() / 1000);

  if (expiresAt && now >= expiresAt - 60) {
    // Token is expired or about to expire — force a refresh
    console.log('[ApiClient] Token expired/expiring, refreshing...');
    try {
      const { data: refreshed, error } = await supabase.auth.refreshSession();
      if (error || !refreshed.session) {
        console.warn('[ApiClient] Token refresh failed:', error?.message);
        return null;
      }
      return refreshed.session.access_token;
    } catch (e) {
      console.error('[ApiClient] supabase.auth.refreshSession() threw:', e);
      return null;
    }
  }

  return session.access_token;
};

// ─── Core fetch with auth ───
async function doFetch<T>(endpoint: string, options: RequestInit, token: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers as Record<string, string> || {}),
  };

  // ─── Timeout: abort requests that hang too long (cold-start protection) ───
  // batch-sync is the heaviest endpoint (loads ALL tenant data) — give it extra
  // time on cold starts. Other endpoints are lighter and can abort sooner.
  const timeoutMs = endpoint === '/batch-sync' ? 60000 : 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  // Track whether the abort came from the caller's signal (vs our timeout)
  let abortedByCaller = false;
  // If caller provided their own signal, listen to it as well
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      const err = new DOMException('The operation was aborted.', 'AbortError');
      throw err;
    }
    options.signal.addEventListener('abort', () => {
      abortedByCaller = true;
      controller.abort();
    });
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch (fetchErr: any) {
    clearTimeout(timeoutId);
    if (fetchErr.name === 'AbortError' || fetchErr.message?.includes('aborted')) {
      // If the caller's signal caused the abort, re-throw as AbortError
      // so upstream code can distinguish from a timeout
      if (abortedByCaller) {
        fetchErr.name = 'AbortError';
        throw fetchErr;
      }
      throw { message: `Request timed out after ${timeoutMs / 1000}s — server may be cold-starting. Please retry.`, status: 0 } as ApiError;
    }
    throw fetchErr;
  }
  clearTimeout(timeoutId);

  if (response.status === 401) {
    throw { message: 'Unauthorized', status: 401 } as ApiError;
  }

  const text = await response.text();
  let responseData;
  try {
    responseData = JSON.parse(text);
  } catch (e) {
    // HTML error pages from Cloudflare (502/503/504) — treat as transient
    if (text.includes('<!DOCTYPE') || text.includes('<html')) {
      const statusMatch = text.match(/(\d{3}):\s*(Bad gateway|Service Temporarily Unavailable|Gateway Timeout)/i);
      const gwStatus = statusMatch ? parseInt(statusMatch[1]) : response.status;
      console.error(`[ApiClient] Received HTML error page (HTTP ${gwStatus}) for ${endpoint}`);
      throw { message: `Server returned ${gwStatus} gateway error — please retry`, status: gwStatus };
    }
    console.error('JSON Parse Error:', e, 'Response Text:', text.substring(0, 200));
    throw { message: `Invalid JSON response: ${text.substring(0, 100)}`, status: 500 };
  }

  if (!response.ok) {
    throw {
      message: responseData.error || responseData.message || 'API request failed',
      status: response.status
    } as ApiError;
  }

  return (responseData.data !== undefined ? responseData.data : responseData) as T;
};

// ─── Retry helper for transient network errors (cold-start recovery) ───
const MAX_NETWORK_RETRIES = 2;
const RETRY_DELAYS = [1500, 3000]; // ms — progressive backoff

// Debounce recovery toasts so parallel requests don't spam the user
let lastRecoveryToastAt = 0;
const RECOVERY_TOAST_COOLDOWN = 5000; // 5s

async function fetchWithRetry<T>(endpoint: string, options: RequestInit, token: string): Promise<T> {
  let lastError: any;
  let didRetry = false;
  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    try {
      const result = await doFetch<T>(endpoint, options, token);
      // If we retried and succeeded, notify the user (debounced)
      if (didRetry) {
        const now = Date.now();
        if (now - lastRecoveryToastAt > RECOVERY_TOAST_COOLDOWN) {
          lastRecoveryToastAt = now;
          toast.success('Connection recovered', {
            description: 'A temporary server issue was resolved automatically.',
          });
        }
      }
      return result;
    } catch (err: any) {
      lastError = err;
      // Don't retry if the request was explicitly aborted by the caller
      if (err.name === 'AbortError' || err.message?.includes('aborted')) throw err;
      // Retry on network-level failures (status 0) AND transient gateway errors (502/503/504)
      const isNetworkError = !err.status || err.status === 0;
      const isGatewayError = err.status === 502 || err.status === 503 || err.status === 504;
      if ((!isNetworkError && !isGatewayError) || attempt >= MAX_NETWORK_RETRIES) {
        throw err;
      }
      didRetry = true;
      const delay = RETRY_DELAYS[attempt] || 3000;
      console.log(`[ApiClient] Network error on ${endpoint} (attempt ${attempt + 1}/${MAX_NETWORK_RETRIES + 1}), retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError;
}

export const apiClient = {
  async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // 1. Get a fresh token (refreshes automatically if expired/expiring)
    let token: string | null;
    try {
      token = await getFreshToken();
    } catch (tokenError: any) {
      console.error('[ApiClient] getFreshToken() threw:', tokenError);
      throw {
        message: `Auth token error: ${tokenError?.message || 'Failed to retrieve session'}`,
        status: 401
      } as ApiError;
    }

    if (!token) {
      // No session at all — throw immediately instead of sending a doomed request
      throw { message: 'Unauthorized', status: 401 } as ApiError;
    }

    try {
      return await fetchWithRetry<T>(endpoint, options, token);
    } catch (error: any) {
      // 2. On 401, attempt ONE token refresh + retry
      if (error.status === 401) {
        console.log('[ApiClient] 401 received, attempting token refresh + retry...');
        try {
          const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
          if (refreshErr || !refreshed.session) {
            console.warn('[ApiClient] Retry refresh failed — session is truly expired');
            throw { message: 'Unauthorized', status: 401 } as ApiError;
          }
          token = refreshed.session.access_token;
          // Retry once with the fresh token (no network retry here — already retried)
          return await doFetch<T>(endpoint, options, token);
        } catch (refreshError: any) {
          if (refreshError.status) throw refreshError;
          console.error('[ApiClient] Token refresh threw:', refreshError);
          throw { message: 'Unauthorized', status: 401 } as ApiError;
        }
      }
      // Re-throw non-401 errors as-is
      if (error.status) throw error;
      if (error.name === 'AbortError' || error.message?.includes('aborted')) throw error;
      
      // Network-level failures (CORS, server down, DNS, timeout)
      console.error(`[ApiClient] Network error on ${endpoint}:`, error.message || error);
      throw { message: `Network error: ${error.message || 'Failed to reach server'}`, status: 0 } as ApiError;
    }
  }
};