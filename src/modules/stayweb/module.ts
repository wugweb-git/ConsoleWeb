import { Hotel, Wrench } from 'lucide-react';
import { defineModule } from '../../shell/types';
import { routes } from './screens';

export default defineModule({
  id: 'stayweb',
  name: 'Stayweb',
  icon: Hotel,
  nav: [
    // System Core (was SuperAdminView)
    { label: 'Dashboard', route: 'dashboard', permission: 'stayweb.console' },
    { label: 'Properties', route: 'properties', permission: 'stayweb.console' },
    { label: 'Communication', route: 'communication', permission: 'stayweb.console' },
    { label: 'OTA Simulator', route: 'ota-simulator', permission: 'stayweb.console' },
    { label: 'System Logs', route: 'system-logs', permission: 'stayweb.console' },
    { label: 'API Logs', route: 'api-logs', permission: 'stayweb.console' },
    { label: 'Database', route: 'database', permission: 'stayweb.console' },
    { label: 'Performance', route: 'performance', permission: 'stayweb.console' },
    { label: 'Security', route: 'security', permission: 'stayweb.console' },
    { label: 'Platform Config', route: 'config', permission: 'stayweb.console' },
    { label: 'Config Diagnostic', route: 'config-diagnostic', permission: 'stayweb.console' },
    {
      label: 'Dev', route: 'prototype-demo', icon: Wrench, permission: 'stayweb.dev',
      children: [
        { label: 'Prototype Demo', route: 'prototype-demo' },
        { label: 'System Sitemap', route: 'sitemap' },
        { label: 'Navigation Guide', route: 'navigation-guide' },
        { label: 'Component Specs', route: 'component-specs' },
        { label: 'UI Kit', route: 'ui-kit' },
        { label: 'Add Room Demo', route: 'demo' },
        { label: 'Schema', route: 'schema' },
      ],
    },
  ],
  routes,
  permissions: ['stayweb.console', 'stayweb.dev'],
  backend: {
    kind: 'supabase',
    env: ['VITE_STAYWEB_SUPABASE_PROJECT_ID', 'VITE_STAYWEB_SUPABASE_ANON_KEY'],
  },
  // Stayweb screens call onNavigate/onBack with page ids; known ones map to module routes.
  navigation: { kind: 'callback', map: path => (path.replace(/^\//, '') in routes ? path.replace(/^\//, '') : null) },
  styles: () => import('./styles/stayweb.css'),
  // TODO: Phase 2 data layer; Supabase server functions stay in Stayweb.
  data: {},
});
