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
  data: {},
});
