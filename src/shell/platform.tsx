import { LayoutGrid, Users, Code, Wrench } from 'lucide-react';
import { defineModule } from './types';
import { usePlatformConfig } from '../stores/PlatformConfigContext';
import { UserManagement } from '../components/admin/UserManagement';
import { PlatformConfig } from '../components/admin/PlatformConfig';
import { AdminIntegrations } from '../components/admin/AdminIntegrations';
import { DeveloperPortal } from '../components/platform/DeveloperPortal';

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
    'developer': DeveloperPortal,
    'config': PlatformConfigScreen,
    'integrations': AdminIntegrations,
  },
  permissions: ['platform.users', 'platform.developer', 'platform.config'],
});
