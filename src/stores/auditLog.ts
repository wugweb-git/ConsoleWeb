// ============================================
// AUDIT LOG STORE
// In-memory activity log for all user management
// actions. Will be backed by Supabase activity_logs
// table once connected.
// ============================================

export type AuditAction =
  | 'user.invited'
  | 'user.created'
  | 'user.removed'
  | 'user.suspended'
  | 'user.reactivated'
  | 'user.role_changed'
  | 'user.team_changed'
  | 'team.created'
  | 'team.deleted'
  | 'team.member_added'
  | 'team.member_removed'
  | 'org.created'
  | 'org.settings_changed'
  | 'org.plan_changed'
  | 'config.role_added'
  | 'config.role_removed'
  | 'config.role_updated';

export type EntityType = 'user' | 'team' | 'org' | 'config';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  entityType: EntityType;
  details: string;
  metadata?: Record<string, string>;
}

// ============================================
// MOCK SEED DATA
// ============================================

let _nextId = 100;
function genId(): string {
  return `audit-${++_nextId}`;
}

const seedEntries: AuditEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-03-17T09:12:00Z',
    action: 'user.invited',
    actorId: 'usr-001',
    actorName: 'John Chen',
    targetId: 'usr-006',
    targetName: 'Eva Chen',
    entityType: 'user',
    details: 'Invited Eva Chen (eva@acme.com) as Member to Engineering team',
    metadata: { role: 'member', team: 'Engineering', email: 'eva@acme.com' },
  },
  {
    id: 'audit-002',
    timestamp: '2026-03-16T14:30:00Z',
    action: 'user.role_changed',
    actorId: 'usr-001',
    actorName: 'John Chen',
    targetId: 'usr-003',
    targetName: 'Bob Sharma',
    entityType: 'user',
    details: 'Changed Bob Sharma role from Member to Manager',
    metadata: { oldRole: 'member', newRole: 'manager' },
  },
  {
    id: 'audit-003',
    timestamp: '2026-03-15T11:45:00Z',
    action: 'team.created',
    actorId: 'usr-001',
    actorName: 'John Chen',
    targetId: 'team-004',
    targetName: 'Sales',
    entityType: 'team',
    details: 'Created team "Sales" in Acme Corporation',
    metadata: { org: 'Acme Corporation' },
  },
  {
    id: 'audit-004',
    timestamp: '2026-03-14T16:20:00Z',
    action: 'user.suspended',
    actorId: 'usr-007',
    actorName: 'Sarah Kim',
    targetId: 'usr-010',
    targetName: 'Tom Park',
    entityType: 'user',
    details: 'Suspended Tom Park — policy violation review',
    metadata: { reason: 'policy_violation' },
  },
  {
    id: 'audit-005',
    timestamp: '2026-03-13T10:00:00Z',
    action: 'org.plan_changed',
    actorId: 'usr-001',
    actorName: 'John Chen',
    targetId: 'org-001',
    targetName: 'Acme Corporation',
    entityType: 'org',
    details: 'Upgraded Acme Corporation from Pro to Enterprise plan',
    metadata: { oldPlan: 'pro', newPlan: 'enterprise' },
  },
  {
    id: 'audit-006',
    timestamp: '2026-03-12T08:15:00Z',
    action: 'user.team_changed',
    actorId: 'usr-002',
    actorName: 'Alice Wong',
    targetId: 'usr-005',
    targetName: 'Diana Lee',
    entityType: 'user',
    details: 'Moved Diana Lee from Operations to Sales team',
    metadata: { oldTeam: 'Operations', newTeam: 'Sales' },
  },
  {
    id: 'audit-007',
    timestamp: '2026-03-11T13:30:00Z',
    action: 'team.member_added',
    actorId: 'usr-003',
    actorName: 'Bob Sharma',
    targetId: 'team-002',
    targetName: 'Compliance',
    entityType: 'team',
    details: 'Added 2 new members to Compliance team',
  },
  {
    id: 'audit-008',
    timestamp: '2026-03-10T15:45:00Z',
    action: 'user.role_changed',
    actorId: 'usr-007',
    actorName: 'Sarah Kim',
    targetId: 'usr-010',
    targetName: 'Tom Park',
    entityType: 'user',
    details: 'Changed Tom Park role from Viewer to Member',
    metadata: { oldRole: 'viewer', newRole: 'member' },
  },
  {
    id: 'audit-009',
    timestamp: '2026-03-09T09:00:00Z',
    action: 'org.created',
    actorId: 'usr-009',
    actorName: 'Maria Santos',
    targetId: 'org-004',
    targetName: 'EduVerify',
    entityType: 'org',
    details: 'Created organization "EduVerify" on Free trial plan',
    metadata: { plan: 'free' },
  },
  {
    id: 'audit-010',
    timestamp: '2026-03-08T12:00:00Z',
    action: 'config.role_added',
    actorId: 'usr-001',
    actorName: 'John Chen',
    targetId: 'orgrole-manager',
    targetName: 'Manager',
    entityType: 'config',
    details: 'Added "Manager" to organization role hierarchy at level 3',
  },
];

// ============================================
// IN-MEMORY STORE
// ============================================

let auditLog: AuditEntry[] = [...seedEntries];

export function getAuditLog(): AuditEntry[] {
  return [...auditLog].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function getAuditLogForEntity(entityType: EntityType, entityId: string): AuditEntry[] {
  return getAuditLog().filter(
    (e) => e.entityType === entityType && (e.targetId === entityId || e.actorId === entityId)
  );
}

export function logActivity(entry: Omit<AuditEntry, 'id' | 'timestamp'>): AuditEntry {
  const newEntry: AuditEntry = {
    ...entry,
    id: genId(),
    timestamp: new Date().toISOString(),
  };
  auditLog = [newEntry, ...auditLog];
  return newEntry;
}

export function getAuditLogFiltered(filters: {
  entityType?: EntityType;
  action?: AuditAction;
  actorId?: string;
}): AuditEntry[] {
  return getAuditLog().filter((e) => {
    if (filters.entityType && e.entityType !== filters.entityType) return false;
    if (filters.action && e.action !== filters.action) return false;
    if (filters.actorId && e.actorId !== filters.actorId) return false;
    return true;
  });
}

// Action label mapping for display
export const auditActionLabels: Record<AuditAction, string> = {
  'user.invited': 'User Invited',
  'user.created': 'User Created',
  'user.removed': 'User Removed',
  'user.suspended': 'User Suspended',
  'user.reactivated': 'User Reactivated',
  'user.role_changed': 'Role Changed',
  'user.team_changed': 'Team Changed',
  'team.created': 'Team Created',
  'team.deleted': 'Team Deleted',
  'team.member_added': 'Member Added',
  'team.member_removed': 'Member Removed',
  'org.created': 'Org Created',
  'org.settings_changed': 'Settings Changed',
  'org.plan_changed': 'Plan Changed',
  'config.role_added': 'Role Added',
  'config.role_removed': 'Role Removed',
  'config.role_updated': 'Role Updated',
};

// Icon mapping for action types
export const auditActionIcons: Record<AuditAction, string> = {
  'user.invited': 'UserPlus',
  'user.created': 'UserPlus',
  'user.removed': 'UserX',
  'user.suspended': 'Ban',
  'user.reactivated': 'CheckCircle',
  'user.role_changed': 'Shield',
  'user.team_changed': 'Network',
  'team.created': 'FolderPlus',
  'team.deleted': 'Trash2',
  'team.member_added': 'UserPlus',
  'team.member_removed': 'UserX',
  'org.created': 'Building2',
  'org.settings_changed': 'Settings',
  'org.plan_changed': 'CreditCard',
  'config.role_added': 'Plus',
  'config.role_removed': 'Minus',
  'config.role_updated': 'Edit2',
};
