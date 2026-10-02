import { LayoutGrid, Users, Layers, Code, Wrench } from 'lucide-react';
import { defineModule } from './types';
import { usePlatformConfig } from '../stores/PlatformConfigContext';
import { UserManagement } from '../components/admin/UserManagement';
import { PlatformConfig } from '../components/admin/PlatformConfig';
import { AdminIntegrations } from '../components/admin/AdminIntegrations';
import { DeveloperPortal } from '../components/platform/DeveloperPortal';
import { InvoiceTemplatesScreen } from '../services/templates/screens';

// The shell's own platform screens. Generic across products.

function PlatformConfigScreen() {
  const { config, setConfig } = usePlatformConfig();
  return <PlatformConfig config={config} onConfigChange={setConfig} />;
}

export const platform = defineModule({
  id: 'platform',
  name: 'Platform',
  icon: LayoutGrid,
  nav: [
    {
      label: 'User Management', route: 'users', icon: Users, permission: 'platform.users',
      children: [
        { label: 'Overview', route: 'users' },
        { label: 'Organizations', route: 'users-orgs' },
        { label: 'Teams', route: 'users-teams' },
        { label: 'Roles & Hierarchy', route: 'users-roles' },
        { label: 'Activity Log', route: 'users-activity' },
      ],
    },
    {
      label: 'Templates', route: 'invoices', icon: Layers, permission: 'platform.templates',
      children: [{ label: 'Invoice', route: 'invoices' }],
    },
    { label: 'Developer Portal', route: 'developer', icon: Code, permission: 'platform.developer' },
    {
      label: 'Platform Config', route: 'config', icon: Wrench, permission: 'platform.config',
      children: [
        { label: 'Configuration', route: 'config' },
        { label: 'Integrations', route: 'integrations' },
      ],
    },
  ],
  routes: {
    'users': () => <UserManagement initialTab="overview" />,
    'users-orgs': () => <UserManagement initialTab="orgs" />,
    'users-teams': () => <UserManagement initialTab="teams" />,
    'users-roles': () => <UserManagement initialTab="roles" />,
    'users-activity': () => <UserManagement initialTab="activity" />,
    'invoices': InvoiceTemplatesScreen,
    'developer': DeveloperPortal,
    'config': PlatformConfigScreen,
    'integrations': AdminIntegrations,
  },
  permissions: ['platform.users', 'platform.templates', 'platform.developer', 'platform.config'],
});
