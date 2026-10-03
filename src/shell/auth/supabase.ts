// ============================================================================
// ConsoleWeb — platform database client
// ============================================================================
// ConsoleWeb signs in against the shared Wugweb database (Supabase project
// "wugweb-x"), the same project DocWeb, Stayweb and HRweb use. Set both in
// Vercel and in .env.local:
//   VITE_SUPABASE_PROJECT_ID        e.g. rgdjesmelruxgwkqkbrh
//   VITE_SUPABASE_PUBLISHABLE_KEY   the project's publishable key (sb_publishable_…)
// ============================================================================

import { createClient } from '@supabase/supabase-js';

export const platformProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '';
export const platformPublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabase = createClient(
  `https://${platformProjectId || 'not-configured'}.supabase.co`,
  platformPublishableKey || 'not-configured',
  // Default storage key (sb-<project>-auth-token), so the Stayweb module's own client sees the same session.
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);

export const core = () => supabase.schema('core');
