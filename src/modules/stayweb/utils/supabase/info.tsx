// TODO: replace with Stayweb admin API
// Set VITE_SUPABASE_PROJECT_ID and VITE_SUPABASE_ANON_KEY in .env.local (never commit them).
// Fallbacks keep the client constructible when unset; requests then fail inside Stayweb screens only.
export const projectId: string = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'not-configured';
export const publicAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY || 'not-configured';
