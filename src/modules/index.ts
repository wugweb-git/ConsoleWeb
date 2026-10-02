import type { ModuleManifest } from '../shell/types';
import { loadManifests } from '../shell/loadManifests';

// Registered products, one line each. Adding a product = add its folder + one line here.
const registered: string[] = [
];

export const modules: ModuleManifest[] = loadManifests(
  import.meta.glob<{ default: ModuleManifest }>('./*/module.ts', { eager: true }),
  registered,
);
