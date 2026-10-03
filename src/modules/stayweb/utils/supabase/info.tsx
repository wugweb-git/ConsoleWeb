// TODO: replace with Stayweb admin API
// Uses the platform's VITE_SUPABASE_PROJECT_ID / VITE_SUPABASE_PUBLISHABLE_KEY; VITE_STAYWEB_* override them if set.
// The shell shows a "not configured" state on Stayweb screens when neither is set.
// Stayweb now lives in the shared wugweb-x project, so the platform settings are the default.
export const projectId: string = import.meta.env.VITE_STAYWEB_SUPABASE_PROJECT_ID || import.meta.env.VITE_SUPABASE_PROJECT_ID || '';
export const publicAnonKey: string = import.meta.env.VITE_STAYWEB_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
