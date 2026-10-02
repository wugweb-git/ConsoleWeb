import { Layers } from 'lucide-react';
import { defineModule } from '../../shell/types';
import { StayWebTemplatesScreen, HRLettersScreen } from './screens';

export default defineModule({
  id: 'templates',
  name: 'Templates',
  icon: Layers,
  nav: [
    { label: 'StayWeb Hospitality', route: 'stayweb', permission: 'templates.manage' },
    { label: 'HR Letters', route: 'hr-letters', permission: 'templates.manage' },
  ],
  routes: {
    'stayweb': StayWebTemplatesScreen,
    'hr-letters': HRLettersScreen,
  },
  permissions: ['templates.manage'],
});
