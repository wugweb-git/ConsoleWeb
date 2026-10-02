import { Box } from 'lucide-react';
import { defineModule } from '../../shell/types';
import { ExamplePage } from './ExamplePage';

// Template for a new product module. Copy this folder, rename, register.
export default defineModule({
  id: '_example',
  name: 'Example',
  icon: Box,
  nav: [{ label: 'Overview', route: 'overview', permission: '_example.view' }],
  routes: { overview: ExamplePage },
  permissions: ['_example.view'],
  data: {},
});
