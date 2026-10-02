import type { ModuleManifest } from '../shell/types';
import { loadManifests } from '../shell/loadManifests';

// Shared capabilities (blockchain, templates, ...), one line each.
const registered: string[] = [
];

export const services: ModuleManifest[] = loadManifests(
  import.meta.glob<{ default: ModuleManifest }>('./*/module.ts', { eager: true }),
  registered,
);
