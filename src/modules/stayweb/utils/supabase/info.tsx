// TODO: replace with Stayweb admin API
// Set VITE_STAYWEB_SUPABASE_PROJECT_ID and VITE_STAYWEB_SUPABASE_ANON_KEY in .env.local (never commit them).
// The shell shows a "not configured" state on Stayweb screens when they are missing.
export const projectId: string = import.meta.env.VITE_STAYWEB_SUPABASE_PROJECT_ID ?? '';
export const publicAnonKey: string = import.meta.env.VITE_STAYWEB_SUPABASE_ANON_KEY ?? '';
