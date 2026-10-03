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
  navigate: (route: string) => void;   // full shell route key
  onNavigate: (path: string) => void;  // module's own path, mapped by its `navigation`
}

export type Screen = ComponentType<ScreenContext>;

export interface NavItem {
  label: string;
  route: string;           // key into `routes`
  icon?: ModuleManifest['icon']; // used for top-level platform items
  permission?: string;     // one of the manifest's `permissions`
  children?: NavItem[];
}

export interface SettingsScreen {
  label: string;
  route: string;
  permission?: string;
  component: Screen;
}

// Backend the module talks to. Env names follow VITE_<MODULE>_*.
// Clients are created lazily (see shell/lazy.ts). If a required env var is
// missing, the shell shows an error state on that module's screens only.
export interface ModuleBackend {
  kind: 'supabase' | 'libsql' | 'rpc' | 'mock';
  env: string[];        // required env var names
  optional?: boolean;   // module still works without it (e.g. mock fallback)
}

// For screens that navigate with their own paths (onNavigate or React Router).
export interface ModuleNavigation {
  kind: 'callback' | 'react-router';
  map?: (path: string) => string | null;  // module path -> module route, null = stay
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
  backend?: ModuleBackend;
  navigation?: ModuleNavigation;
  styles?: () => Promise<unknown>;   // module CSS, loaded by the shell
}

export function defineModule(manifest: ModuleManifest): ModuleManifest {
  return manifest;
}
