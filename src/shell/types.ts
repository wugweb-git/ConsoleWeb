import type { ComponentType } from 'react';

// ============================================
// MODULE CONTRACT
// Every product (src/modules/<product>/module.ts), every shared service
// (src/services/<service>/module.ts) and the shell's own platform screens
// are described by this one manifest shape. The shell builds sidebar,
// routing and permission checks from manifests only.
// ============================================

export interface ScreenContext {
  productId: string | null;
  tenantId: string;
  navigate: (route: string) => void;
}

export type Screen = ComponentType<ScreenContext>;

export interface NavItem {
  label: string;
  route: string;           // key into `routes`
  permission?: string;     // one of the manifest's `permissions`
  children?: NavItem[];
}

export interface SettingsScreen {
  label: string;
  route: string;
  permission?: string;
  component: Screen;
}

// Data-layer functions. The first argument is always the tenant.
export type DataFn = (tenantId: string, ...args: any[]) => unknown;

export interface ModuleManifest {
  id: string;
  name: string;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  nav: NavItem[];
  routes: Record<string, Screen>;
  permissions: string[];
  data?: Record<string, DataFn>;
  settings?: SettingsScreen[];
}

export function defineModule(manifest: ModuleManifest): ModuleManifest {
  return manifest;
}
