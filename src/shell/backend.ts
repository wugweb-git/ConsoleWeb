import type { ModuleManifest } from './types';

const env = import.meta.env as Record<string, string | undefined>;

export function readEnv(name: string): string {
  return env[name] ?? '';
}

// Required env vars that are not set for this manifest's backend.
export function missingEnv(manifest: ModuleManifest): string[] {
  const b = manifest.backend;
  if (!b || b.optional) return [];
  return b.env.filter(name => !env[name]);
}
