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
import { sharedAuthOptions } from './sharedSession';

export const platformProjectId = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? '';
export const platformPublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';

export const supabase = createClient(
  `https://${platformProjectId || 'not-configured'}.supabase.co`,
  platformPublishableKey || 'not-configured',
  // Session shared with every Wugweb product on .wugweb.studio (see sharedSession.ts);
  // the Stayweb module's client uses the same store, so it sees the same session.
  { auth: sharedAuthOptions },
);

export const core = () => supabase.schema('core');
