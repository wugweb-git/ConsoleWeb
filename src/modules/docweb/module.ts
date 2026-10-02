import { FileText } from 'lucide-react';
import { defineModule } from '../../shell/types';
import { AdminSchema } from './components/admin/AdminSchema';
import { AdminCRUD } from './components/admin/AdminCRUD';

export default defineModule({
  id: 'docweb',
  name: 'DocWeb',
  icon: FileText,
  nav: [
    { label: 'Schema Viewer', route: 'schema', permission: 'docweb.schema.view' },
    { label: 'CRUD Operations', route: 'crud', permission: 'docweb.crud.manage' },
  ],
  routes: {
    schema: AdminSchema,
    crud: AdminCRUD,
  },
  permissions: ['docweb.schema.view', 'docweb.crud.manage'],
  // TODO: Phase 2 data layer (src/modules/docweb/data-layer/), every function takes tenantId.
  data: {},
});
