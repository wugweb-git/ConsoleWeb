import { NotebookPen, Wrench } from 'lucide-react';
import { defineModule } from '../../shell/types';
import { routes } from './screens';

export default defineModule({
  id: 'thinkweb',
  name: 'ThinkWeb',
  icon: NotebookPen,
  nav: [
    { label: 'Admin Portal', route: 'admin', permission: 'thinkweb.admin' },
    {
      label: 'Dev', route: 'test', icon: Wrench, permission: 'thinkweb.dev',
      children: [{ label: 'Build & Feature Test Center', route: 'test' }],
    },
  ],
  routes,
  permissions: ['thinkweb.admin', 'thinkweb.dev'],
  backend: {
    kind: 'supabase',
    env: ['VITE_THINKWEB_SUPABASE_URL', 'VITE_THINKWEB_SUPABASE_ANON_KEY'],
  },
  // Some screens use React Router; their paths (e.g. /doc/:id) have no ConsoleWeb route.
  navigation: { kind: 'react-router', map: () => null },
  styles: () => import('./styles/thinkweb.css'),
  data: {},
});
