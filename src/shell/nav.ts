import type { ElementType } from 'react';
import type { ModuleManifest, NavItem } from './types';
import { navGroups, routeKey, settingsManifests, type Area } from './registry';
import { can } from './session';

// Builds the sidebar sections (AppSidebar shape) from registered manifests.

interface SidebarItem {
  id: string;
  label: string;
  icon: ElementType;
  children?: { id: string; label: string }[];
}

export interface SidebarSection {
  label: string;
  items: SidebarItem[];
}

const flatten = (area: Area, m: ModuleManifest, items: NavItem[], inherited?: string): { id: string; label: string }[] =>
  items
    .filter(i => can(i.permission ?? inherited))
    .flatMap(i => [
      { id: routeKey(area, m.id, i.route), label: i.label },
      ...flatten(area, m, i.children ?? [], i.permission ?? inherited),
    ]);

// One sidebar item per manifest, its nav items as children.
const manifestItem = (area: Area, m: ModuleManifest, items: NavItem[]): SidebarItem | null => {
  const children = flatten(area, m, items);
  if (children.length === 0) return null;
  return { id: children[0].id, label: m.name, icon: m.icon, children };
};

// Shell: the platform manifest's own nav items are top-level items.
const platformItems = (m: ModuleManifest): SidebarItem[] =>
  m.nav
    .filter(i => can(i.permission))
    .map(i => {
      const children = flatten('shell', m, i.children ?? [], i.permission);
      return {
        id: routeKey('shell', m.id, i.route),
        label: i.label,
        icon: i.icon ?? m.icon,
        ...(children.length > 0 ? { children } : {}),
      };
    });

export const sidebarSections: SidebarSection[] = [
  ...navGroups.map(g => ({
    label: g.label,
    items:
      g.area === 'shell'
        ? g.manifests.flatMap(platformItems)
        : g.manifests.map(m => manifestItem(g.area, m, m.nav)).filter((x): x is SidebarItem => x !== null),
  })),
  {
    label: 'Settings',
    items: settingsManifests
      .map(m => manifestItem('settings', m, m.settings!.map(s => ({ label: s.label, route: s.route, permission: s.permission }))))
      .filter((x): x is SidebarItem => x !== null),
  },
].filter(s => s.items.length > 0);

export const defaultRoute: string =
  sidebarSections[0]?.items[0]?.children?.[0]?.id ?? sidebarSections[0]?.items[0]?.id ?? '';

// Breadcrumb trails (Breadcrumbs shape): section › item › child.
export const breadcrumbTrails: Record<string, { label: string; page?: string }[]> = {};

for (const section of sidebarSections) {
  for (const item of section.items) {
    breadcrumbTrails[item.id] = [{ label: section.label }, { label: item.label }];
    for (const child of item.children ?? []) {
      if (child.id === item.id) continue;
      breadcrumbTrails[child.id] = [{ label: section.label }, { label: item.label, page: item.id }, { label: child.label }];
    }
  }
}

// First route under the Settings section, if any manifest registers settings.
export const settingsRoute: string | null =
  sidebarSections.find(s => s.label === 'Settings')?.items[0]?.id ?? null;
