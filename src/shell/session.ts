import { navGroups } from './registry';

// TODO: replace with real auth + tenant directory. Step 0a placeholders.
export const tenants = [
  { id: 'wugweb', name: 'Wugweb' },
];

// Placeholder: the master admin holds every permission any manifest declares.
const granted = new Set(navGroups.flatMap(g => g.manifests).flatMap(m => m.permissions));

export function can(permission?: string): boolean {
  return !permission || granted.has(permission);
}
