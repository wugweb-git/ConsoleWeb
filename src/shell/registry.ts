import type { ModuleManifest, NavItem, Screen } from './types';
import { platform } from './platform';
import { services } from '../services';
import { modules } from '../modules';

export type Area = 'shell' | 'services' | 'modules' | 'settings';

export interface NavGroup {
  area: Area;
  label: string;
  manifests: ModuleManifest[];
}

export interface ResolvedRoute {
  area: Area;
  manifest: ModuleManifest;
  screen: Screen;
  permission?: string;
}

// Full route key: "<area>/<manifest id>/<route>"
export const routeKey = (area: Area, manifestId: string, route: string) =>
  `${area}/${manifestId}/${route}`;

export const navGroups: NavGroup[] = [
  { area: 'shell', label: 'Shell', manifests: [platform] },
  { area: 'services', label: 'Services', manifests: services },
  { area: 'modules', label: 'Modules', manifests: modules },
];

function findPermission(items: NavItem[], route: string): string | undefined {
  for (const item of items) {
    if (item.route === route) return item.permission;
    const nested = item.children && findPermission(item.children, route);
    if (nested) return nested;
  }
  return undefined;
}

export const routeTable: Record<string, ResolvedRoute> = {};

for (const group of navGroups) {
  for (const manifest of group.manifests) {
    for (const [route, screen] of Object.entries(manifest.routes)) {
      routeTable[routeKey(group.area, manifest.id, route)] = {
        area: group.area,
        manifest,
        screen,
        permission: findPermission(manifest.nav, route),
      };
    }
    for (const s of manifest.settings ?? []) {
      routeTable[routeKey('settings', manifest.id, s.route)] = {
        area: 'settings',
        manifest,
        screen: s.component,
        permission: s.permission,
      };
    }
  }
}

export const settingsManifests = navGroups
  .flatMap(g => g.manifests)
  .filter(m => m.settings && m.settings.length > 0);

export const products = modules;
