import { Link2 } from 'lucide-react';
import { defineModule } from '../../shell/types';
import { BlockchainScreen } from './BlockchainScreen';

export default defineModule({
  id: 'blockchain',
  name: 'Blockchain',
  icon: Link2,
  nav: [{ label: 'Blockchain', route: 'panel', permission: 'blockchain.manage' }],
  routes: { panel: BlockchainScreen },
  permissions: ['blockchain.manage'],
});
