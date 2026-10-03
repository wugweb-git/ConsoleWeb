import { Users } from 'lucide-react';
import { defineModule } from '../../shell/types';

// HRweb (HR + Employee app lives in wugweb-git/hr_web). No platform screens yet;
// organisation management will come to the shell for all products.
export default defineModule({
  id: 'hrweb',
  name: 'HRweb',
  icon: Users,
  nav: [],
  routes: {},
  permissions: [],
  data: {},
});
