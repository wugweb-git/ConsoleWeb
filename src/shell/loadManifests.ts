import type { ModuleManifest } from './types';

// Resolve registered folder names to their module.ts default exports.
// Fails loudly if a registered folder has no manifest.
export function loadManifests(
  found: Record<string, { default: ModuleManifest }>,
  registered: string[],
): ModuleManifest[] {
  return registered.map(name => {
    const mod = found[`./${name}/module.ts`];
    if (!mod) throw new Error(`Registered "${name}" has no ${name}/module.ts`);
    return mod.default;
  });
}
