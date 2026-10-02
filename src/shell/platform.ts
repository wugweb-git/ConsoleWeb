import { LayoutGrid } from 'lucide-react';
import { defineModule } from './types';

// The shell's own platform screens (users, integrations, config, ...).
// Generic across products. Screens are added here as they move in.
export const platform = defineModule({
  id: 'platform',
  name: 'Platform',
  icon: LayoutGrid,
  nav: [],
  routes: {},
  permissions: [],
});
