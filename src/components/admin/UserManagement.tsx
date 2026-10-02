import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Users, Building2, UserPlus, Search, MoreVertical, Shield,
  ChevronRight, CheckCircle, XCircle, Edit2, Trash2,
  Eye, User, Network, Clock, Activity,
} from 'lucide-react';
import { usePlatformConfig } from '../../stores/PlatformConfigContext';
import { IconResolver } from '../ui/IconResolver';
import { InviteUserModal } from './InviteUserModal';
import type { InviteData } from './InviteUserModal';
import {
  getAuditLog, logActivity, auditActionLabels, auditActionIcons,
} from '../../stores/auditLog';
import type { AuditEntry, EntityType } from '../../stores/auditLog';

// ===================================================
// Multi-tenant hierarchy: Organization → Team → User
// All role definitions, statuses, and plan tiers are
// read from usePlatformConfig() — not hardcoded.
// ===================================================

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  memberCount: number;
  teamCount: number;
  createdAt: string;
  owner: string;
}

interface Team {
  id: string;
  orgId: string;
  name: string;
  description: string;
  memberCount: number;
  lead: string;
  createdAt: string;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  orgId: string;
  teamId: string;
  role: string;
  status: string;
  lastActive: string;
  createdAt: string;
}

// Mock data — will be replaced when Supabase is connected
const initialOrgs: Organization[] = [
  { id: 'org-001', name: 'Acme Corporation', slug: 'acme-corp', plan: 'enterprise', status: 'active', memberCount: 24, teamCount: 5, createdAt: '2024-01-15', owner: 'John Chen' },
  { id: 'org-002', name: 'TechStart Labs', slug: 'techstart', plan: 'pro', status: 'active', memberCount: 8, teamCount: 2, createdAt: '2024-06-20', owner: 'Sarah Kim' },
  { id: 'org-003', name: 'GlobalTrade Inc', slug: 'globaltrade', plan: 'enterprise', status: 'active', memberCount: 42, teamCount: 8, createdAt: '2023-11-05', owner: 'Raj Patel' },
  { id: 'org-004', name: 'EduVerify', slug: 'eduverify', plan: 'free', status: 'trial', memberCount: 3, teamCount: 1, createdAt: '2025-02-10', owner: 'Maria Santos' },
];

const initialTeams: Team[] = [
  { id: 'team-001', orgId: 'org-001', name: 'Engineering', description: 'Platform development & API integrations', memberCount: 8, lead: 'Alice Wong', createdAt: '2024-01-20' },
  { id: 'team-002', orgId: 'org-001', name: 'Compliance', description: 'Document certification & audit', memberCount: 5, lead: 'Bob Sharma', createdAt: '2024-02-10' },
  { id: 'team-003', orgId: 'org-001', name: 'Operations', description: 'Product labeling & warranty management', memberCount: 6, lead: 'Chen Wei', createdAt: '2024-03-05' },
  { id: 'team-004', orgId: 'org-001', name: 'Sales', description: 'Client onboarding & demos', memberCount: 3, lead: 'Diana Lee', createdAt: '2024-04-15' },
  { id: 'team-005', orgId: 'org-001', name: 'Admin', description: 'Platform configuration & user management', memberCount: 2, lead: 'John Chen', createdAt: '2024-01-15' },
  { id: 'team-006', orgId: 'org-002', name: 'Core Team', description: 'All-hands development', memberCount: 6, lead: 'Sarah Kim', createdAt: '2024-06-22' },
  { id: 'team-007', orgId: 'org-002', name: 'QA', description: 'Testing & verification', memberCount: 2, lead: 'Tom Park', createdAt: '2024-07-01' },
  { id: 'team-008', orgId: 'org-003', name: 'Supply Chain', description: 'Product traceability', memberCount: 12, lead: 'Priya Nair', createdAt: '2023-11-10' },
];

const initialUsers: UserRecord[] = [
  { id: 'usr-001', name: 'John Chen', email: 'john@acme.com', orgId: 'org-001', teamId: 'team-005', role: 'owner', status: 'active', lastActive: '2026-03-17', createdAt: '2024-01-15' },
  { id: 'usr-002', name: 'Alice Wong', email: 'alice@acme.com', orgId: 'org-001', teamId: 'team-001', role: 'admin', status: 'active', lastActive: '2026-03-17', createdAt: '2024-01-20' },
  { id: 'usr-003', name: 'Bob Sharma', email: 'bob@acme.com', orgId: 'org-001', teamId: 'team-002', role: 'manager', status: 'active', lastActive: '2026-03-16', createdAt: '2024-02-10' },
  { id: 'usr-004', name: 'Chen Wei', email: 'chen@acme.com', orgId: 'org-001', teamId: 'team-003', role: 'manager', status: 'active', lastActive: '2026-03-15', createdAt: '2024-03-05' },
  { id: 'usr-005', name: 'Diana Lee', email: 'diana@acme.com', orgId: 'org-001', teamId: 'team-004', role: 'member', status: 'active', lastActive: '2026-03-14', createdAt: '2024-04-15' },
  { id: 'usr-006', name: 'Eva Chen', email: 'eva@acme.com', orgId: 'org-001', teamId: 'team-001', role: 'member', status: 'invited', lastActive: '', createdAt: '2026-03-10' },
  { id: 'usr-007', name: 'Sarah Kim', email: 'sarah@techstart.com', orgId: 'org-002', teamId: 'team-006', role: 'owner', status: 'active', lastActive: '2026-03-17', createdAt: '2024-06-20' },
  { id: 'usr-008', name: 'Raj Patel', email: 'raj@globaltrade.com', orgId: 'org-003', teamId: 'team-008', role: 'owner', status: 'active', lastActive: '2026-03-17', createdAt: '2023-11-05' },
  { id: 'usr-009', name: 'Maria Santos', email: 'maria@eduverify.com', orgId: 'org-004', teamId: '', role: 'owner', status: 'active', lastActive: '2026-03-16', createdAt: '2025-02-10' },
  { id: 'usr-010', name: 'Tom Park', email: 'tom@techstart.com', orgId: 'org-002', teamId: 'team-007', role: 'member', status: 'suspended', lastActive: '2026-02-01', createdAt: '2024-07-05' },
];

// Permission matrix — maps permission to which hierarchy levels can perform it
const permissionRows = [
  { perm: 'Manage billing & plan', levels: [1] },
  { perm: 'Delete organization', levels: [1] },
  { perm: 'Transfer ownership', levels: [1] },
  { perm: 'Create / delete teams', levels: [1, 2] },
  { perm: 'Manage org settings', levels: [1, 2] },
  { perm: 'Invite / remove users', levels: [1, 2] },
  { perm: 'Assign roles', levels: [1, 2] },
  { perm: 'Manage team members', levels: [1, 2, 3] },
  { perm: 'Issue credentials', levels: [1, 2, 3, 4] },
  { perm: 'Certify documents', levels: [1, 2, 3, 4] },
  { perm: 'View audit trail', levels: [1, 2, 3, 4] },
  { perm: 'View dashboards', levels: [1, 2, 3, 4, 5] },
  { perm: 'Verify documents', levels: [1, 2, 3, 4, 5] },
];

// Current actor (mock — will come from auth)
const CURRENT_ACTOR_ID = 'usr-001';
const CURRENT_ACTOR_NAME = 'John Chen';

type Tab = 'overview' | 'orgs' | 'teams' | 'roles' | 'activity';

interface UserManagementProps {
  initialTab?: Tab;
}

export function UserManagement({ initialTab = 'overview' }: UserManagementProps) {
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [users, setUsers] = useState<UserRecord[]>(initialUsers);
  const [auditEntries, setAuditEntries] = useState<AuditEntry[]>(getAuditLog());
  const [roleChangeUser, setRoleChangeUser] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<EntityType | 'all'>('all');

  const roleChangeRef = useRef<HTMLDivElement>(null);

  // Read all dynamic definitions from the platform config store
  const { getItems, getStatus } = usePlatformConfig();
  const orgRoleItems = getItems('org-roles');

  // Close role-change dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (roleChangeRef.current && !roleChangeRef.current.contains(e.target as Node)) {
        setRoleChangeUser(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: Users },
    { id: 'orgs', label: 'Organizations', icon: Building2 },
    { id: 'teams', label: 'Teams', icon: Network },
    { id: 'roles', label: 'Roles & Hierarchy', icon: Shield },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  // Look up styles from config store
  const getUserStatusStyle = (status: string) => {
    const s = getStatus('user-statuses', status);
    return { color: s.color, bg: s.bgColor };
  };

  const getRoleStyle = (role: string) => {
    const s = getStatus('org-roles', role);
    return { color: s.color, bg: s.bgColor };
  };

  const getPlanStyle = (plan: string) => {
    const s = getStatus('org-plans', plan);
    return { color: s.color, bg: s.bgColor };
  };

  const getOrgStatusStyle = (status: string) => {
    const s = getStatus('org-statuses', status);
    return { color: s.color, bg: s.bgColor };
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredOrgs = initialOrgs.filter(o =>
    o.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTeams = initialTeams.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrg = selectedOrg ? t.orgId === selectedOrg : true;
    return matchesSearch && matchesOrg;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const totalOrgs = initialOrgs.length;
  const totalTeams = initialTeams.length;

  // Handle invite
  const handleInvite = useCallback((data: InviteData) => {
    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email,
      orgId: data.orgId,
      teamId: data.teamId,
      role: data.role,
      status: 'invited',
      lastActive: '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, newUser]);
    setAuditEntries(getAuditLog());
  }, []);

  // Handle role change
  const handleRoleChange = useCallback((userId: string, newRole: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    const oldRoleInfo = getStatus('org-roles', user.role);
    const newRoleInfo = getStatus('org-roles', newRole);

    logActivity({
      action: 'user.role_changed',
      actorId: CURRENT_ACTOR_ID,
      actorName: CURRENT_ACTOR_NAME,
      targetId: userId,
      targetName: user.name,
      entityType: 'user',
      details: `Changed ${user.name} role from ${oldRoleInfo.label} to ${newRoleInfo.label}`,
      metadata: { oldRole: user.role, newRole },
    });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setAuditEntries(getAuditLog());
    setRoleChangeUser(null);
    setActiveMenu(null);
  }, [users, getStatus]);

  // Filtered activity log
  const filteredActivity = activityFilter === 'all'
    ? auditEntries
    : auditEntries.filter((e) => e.entityType === activityFilter);

  // Format relative time
  function relativeTime(ts: string): string {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(ts).toLocaleDateString();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" style={{ minHeight: 'calc(100vh - 5rem)' }}>
      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInvite}
        orgs={initialOrgs.map((o) => ({ id: o.id, name: o.name }))}
        teams={initialTeams.map((t) => ({ id: t.id, orgId: t.orgId, name: t.name }))}
        currentActorId={CURRENT_ACTOR_ID}
        currentActorName={CURRENT_ACTOR_NAME}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 flex items-center justify-center"
            style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}
          >
            <Users className="w-5 h-5" style={{ color: 'var(--primary-foreground)' }} />
          </div>
          <div>
            <h2 style={{ color: 'var(--foreground)' }}>User Management</h2>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Multi-tenant hierarchy — Organization → Team → User
            </p>
          </div>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: 'var(--radius-lg)' }}
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite User</span>
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: totalUsers, icon: Users },
          { label: 'Active Users', value: activeUsers, icon: CheckCircle },
          { label: 'Organizations', value: totalOrgs, icon: Building2 },
          { label: 'Teams', value: totalTeams, icon: Network },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="p-4"
              style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 flex items-center justify-center"
                  style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)' }}
                >
                  <Icon className="w-4 h-4" style={{ color: 'var(--foreground)' }} />
                </div>
                <div>
                  <h2 style={{ color: 'var(--foreground)' }}>{kpi.value}</h2>
                  <small style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</small>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div
        className="flex items-center gap-1 mb-6 p-1 overflow-x-auto"
        style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 transition-all flex-1 justify-center whitespace-nowrap"
              style={{
                backgroundColor: isActive ? 'var(--card)' : 'transparent',
                color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                boxShadow: isActive ? 'var(--elevation-sm)' : 'none',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search (not shown on activity tab) */}
      {activeTab !== 'activity' && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 outline-none"
            style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              borderRadius: 'var(--radius-lg)',
            }}
          />
        </div>
      )}

      {/* =========================================
          TAB: Overview — all users
          ========================================= */}
      {activeTab === 'overview' && (
        <div
          className="overflow-hidden"
          style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
        >
          <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <h3 style={{ color: 'var(--foreground)' }}>All Users</h3>
              <small style={{ color: 'var(--muted-foreground)' }}>{filteredUsers.length} users</small>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Organization', 'Team', 'Role', 'Status', 'Last Active', ''].map((h) => (
                    <th key={h} className="text-left px-6 py-3" style={{ backgroundColor: 'var(--muted)' }}>
                      <h6 style={{ color: 'var(--muted-foreground)' }}>{h}</h6>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, idx) => {
                  const org = initialOrgs.find(o => o.id === user.orgId);
                  const team = initialTeams.find(t => t.id === user.teamId);
                  const roleStyle = getRoleStyle(user.role);
                  const roleInfo = getStatus('org-roles', user.role);
                  const statusStyle = getUserStatusStyle(user.status);
                  const statusInfo = getStatus('user-statuses', user.status);

                  return (
                    <tr
                      key={user.id}
                      style={{ borderBottom: idx < filteredUsers.length - 1 ? '1px solid var(--border)' : 'none' }}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                          >
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p style={{ color: 'var(--foreground)' }}>{user.name}</p>
                            <small style={{ color: 'var(--muted-foreground)' }}>{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p style={{ color: 'var(--foreground)' }}>{org?.name || '—'}</p>
                      </td>
                      <td className="px-6 py-3">
                        <p style={{ color: 'var(--muted-foreground)' }}>{team?.name || '—'}</p>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1"
                          style={{ backgroundColor: roleStyle.bg, color: roleStyle.color, borderRadius: 'var(--radius-full)' }}
                        >
                          <IconResolver name={roleInfo.icon} className="w-3 h-3" />
                          <small style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>{roleInfo.label}</small>
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.color, borderRadius: 'var(--radius-full)' }}
                        >
                          <IconResolver name={statusInfo.icon} className="w-3 h-3" />
                          <small>{statusInfo.label}</small>
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <small style={{ color: 'var(--muted-foreground)' }}>
                          {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                        </small>
                      </td>
                      <td className="px-6 py-3">
                        <div className="relative">
                          <button
                            onClick={() => {
                              setActiveMenu(activeMenu === user.id ? null : user.id);
                              setRoleChangeUser(null);
                            }}
                            className="p-1.5 transition-opacity hover:opacity-70"
                            style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-md)' }}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          {activeMenu === user.id && !roleChangeUser && (
                            <div
                              className="absolute right-0 mt-1 w-44 z-10 overflow-hidden"
                              style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--elevation-sm)',
                                borderRadius: 'var(--radius-lg)',
                              }}
                            >
                              <button
                                className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-opacity hover:opacity-70"
                                style={{ color: 'var(--foreground)' }}
                              >
                                <Edit2 className="w-3.5 h-3.5" /> <small>Edit User</small>
                              </button>
                              <button
                                onClick={() => setRoleChangeUser(user.id)}
                                className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-opacity hover:opacity-70"
                                style={{ color: 'var(--foreground)' }}
                              >
                                <Shield className="w-3.5 h-3.5" /> <small>Change Role</small>
                              </button>
                              <button
                                className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-opacity hover:opacity-70"
                                style={{ color: 'var(--destructive)' }}
                              >
                                <Trash2 className="w-3.5 h-3.5" /> <small>Remove</small>
                              </button>
                            </div>
                          )}
                          {/* Role Change Dropdown */}
                          {roleChangeUser === user.id && (
                            <div
                              ref={roleChangeRef}
                              className="absolute right-0 mt-1 w-56 z-20 overflow-hidden"
                              style={{
                                backgroundColor: 'var(--card)',
                                border: '1px solid var(--border)',
                                boxShadow: 'var(--elevation-sm)',
                                borderRadius: 'var(--radius-lg)',
                              }}
                            >
                              <div
                                className="px-4 py-2.5"
                                style={{ borderBottom: '1px solid var(--border)' }}
                              >
                                <h6 style={{ color: 'var(--muted-foreground)' }}>Change Role</h6>
                              </div>
                              {orgRoleItems.map((role) => {
                                const isCurrent = user.role === role.value;
                                return (
                                  <button
                                    key={role.id}
                                    onClick={() => {
                                      if (!isCurrent) handleRoleChange(user.id, role.value);
                                    }}
                                    className="w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors"
                                    style={{
                                      backgroundColor: isCurrent ? 'var(--muted)' : 'transparent',
                                      color: isCurrent ? 'var(--foreground)' : 'var(--foreground)',
                                      cursor: isCurrent ? 'default' : 'pointer',
                                      borderBottom: '1px solid var(--border)',
                                    }}
                                    onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget.style.backgroundColor = 'var(--muted)'); }}
                                    onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                                  >
                                    <IconResolver
                                      name={role.icon}
                                      className="w-4 h-4"
                                      style={{ color: isCurrent ? 'var(--foreground)' : 'var(--muted-foreground)' }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p style={{
                                        color: 'var(--foreground)',
                                        fontWeight: isCurrent ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                                      } as React.CSSProperties}>
                                        {role.label}
                                      </p>
                                    </div>
                                    {isCurrent && (
                                      <small style={{ color: 'var(--muted-foreground)' }}>Current</small>
                                    )}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => { setRoleChangeUser(null); setActiveMenu(null); }}
                                className="w-full px-4 py-2 text-center transition-opacity hover:opacity-70"
                                style={{ color: 'var(--muted-foreground)' }}
                              >
                                <small>Cancel</small>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================
          TAB: Organizations
          ========================================= */}
      {activeTab === 'orgs' && (
        <div className="grid gap-4">
          {filteredOrgs.map((org) => {
            const planStyle = getPlanStyle(org.plan);
            const planInfo = getStatus('org-plans', org.plan);
            const orgStatusStyle = getOrgStatusStyle(org.status);
            const orgStatusInfo = getStatus('org-statuses', org.status);
            const orgTeams = initialTeams.filter(t => t.orgId === org.id);
            const orgUsers = users.filter(u => u.orgId === org.id);

            return (
              <div
                key={org.id}
                className="p-6"
                style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-lg)' }}
                    >
                      <Building2 className="w-6 h-6" style={{ color: 'var(--primary-foreground)' }} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 style={{ color: 'var(--foreground)' }}>{org.name}</h3>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5"
                          style={{ backgroundColor: planStyle.bg, color: planStyle.color, borderRadius: 'var(--radius-full)' }}
                        >
                          <IconResolver name={planInfo.icon} className="w-3 h-3" />
                          <small style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                            {planInfo.label}
                          </small>
                        </span>
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5"
                          style={{ backgroundColor: orgStatusStyle.bg, color: orgStatusStyle.color, borderRadius: 'var(--radius-full)' }}
                        >
                          <IconResolver name={orgStatusInfo.icon} className="w-3 h-3" />
                          <small>{orgStatusInfo.label}</small>
                        </span>
                      </div>
                      <p style={{ color: 'var(--muted-foreground)' }}>
                        Owner: {org.owner} · slug: <code>{org.slug}</code>
                      </p>
                    </div>
                  </div>
                  <button
                    className="p-2 transition-opacity hover:opacity-70"
                    style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-md)' }}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[
                    { label: 'Members', value: orgUsers.length },
                    { label: 'Teams', value: orgTeams.length },
                    { label: 'Created', value: new Date(org.createdAt).toLocaleDateString() },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3" style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)' }}>
                      <small style={{ color: 'var(--muted-foreground)' }}>{stat.label}</small>
                      <p style={{ color: 'var(--foreground)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {orgTeams.length > 0 && (
                  <div>
                    <h6 style={{ color: 'var(--muted-foreground)' }} className="mb-2">Teams</h6>
                    <div className="flex flex-wrap gap-2">
                      {orgTeams.map((team) => (
                        <span
                          key={team.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5"
                          style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', borderRadius: 'var(--radius-md)' }}
                        >
                          <Network className="w-3 h-3" style={{ color: 'var(--muted-foreground)' }} />
                          <small style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>{team.name}</small>
                          <small style={{ color: 'var(--muted-foreground)' }}>({team.memberCount})</small>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================
          TAB: Teams
          ========================================= */}
      {activeTab === 'teams' && (
        <div>
          <div className="flex gap-2 mb-4 flex-wrap">
            <button
              onClick={() => setSelectedOrg(null)}
              className="px-3 py-1.5 transition-all"
              style={{
                backgroundColor: !selectedOrg ? 'var(--primary)' : 'var(--muted)',
                color: !selectedOrg ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <small style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>All Orgs</small>
            </button>
            {initialOrgs.map((org) => (
              <button
                key={org.id}
                onClick={() => setSelectedOrg(org.id)}
                className="px-3 py-1.5 transition-all"
                style={{
                  backgroundColor: selectedOrg === org.id ? 'var(--primary)' : 'var(--muted)',
                  color: selectedOrg === org.id ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <small style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>{org.name}</small>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredTeams.map((team) => {
              const org = initialOrgs.find(o => o.id === team.orgId);
              const teamUsers = users.filter(u => u.teamId === team.id);

              return (
                <div
                  key={team.id}
                  className="p-5"
                  style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center"
                        style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-lg)' }}
                      >
                        <Network className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--foreground)' }}>{team.name}</h4>
                        <small style={{ color: 'var(--muted-foreground)' }}>{org?.name}</small>
                      </div>
                    </div>
                    <button className="p-1.5" style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-md)' }}>
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>

                  <p style={{ color: 'var(--muted-foreground)' }} className="mb-3">{team.description}</p>

                  <div className="flex items-center justify-between mb-3">
                    <small style={{ color: 'var(--muted-foreground)' }}>Lead: {team.lead}</small>
                    <small style={{ color: 'var(--muted-foreground)' }}>{teamUsers.length} members</small>
                  </div>

                  <div className="flex -space-x-2">
                    {teamUsers.slice(0, 5).map((u) => (
                      <div
                        key={u.id}
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--primary)',
                          color: 'var(--primary-foreground)',
                          border: '2px solid var(--card)',
                        }}
                        title={u.name}
                      >
                        <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                          {u.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                    ))}
                    {teamUsers.length > 5 && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: 'var(--muted)',
                          color: 'var(--muted-foreground)',
                          border: '2px solid var(--card)',
                        }}
                      >
                        <span style={{ fontSize: 'var(--text-xs)' }}>+{teamUsers.length - 5}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================
          TAB: Roles & Hierarchy
          ========================================= */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div
            className="p-6"
            style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
          >
            <h3 style={{ color: 'var(--foreground)' }} className="mb-2">Role Hierarchy</h3>
            <p style={{ color: 'var(--muted-foreground)' }} className="mb-6">
              Permissions cascade downward — each role inherits all permissions of roles below it.
              Roles are managed in Admin → Platform Config → Organization Roles.
            </p>

            <div className="space-y-3">
              {orgRoleItems.map((role, idx) => {
                const usersWithRole = users.filter(u => u.role === role.value).length;
                const isTopLevel = idx === 0;
                return (
                  <div
                    key={role.id}
                    className="flex items-center gap-4 p-4"
                    style={{
                      backgroundColor: isTopLevel ? 'var(--primary)' : 'var(--muted)',
                      marginLeft: `${idx * 24}px`,
                      borderRadius: 'var(--radius-lg)',
                    }}
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: isTopLevel ? 'rgba(255,255,255,0.15)' : 'var(--card)',
                        borderRadius: 'var(--radius-lg)',
                      }}
                    >
                      <IconResolver
                        name={role.icon}
                        className="w-5 h-5"
                        style={{ color: isTopLevel ? 'var(--primary-foreground)' : 'var(--foreground)' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 style={{ color: isTopLevel ? 'var(--primary-foreground)' : 'var(--foreground)' }}>
                          Level {role.order}: {role.label}
                        </h4>
                        <span
                          className="px-2 py-0.5"
                          style={{
                            backgroundColor: isTopLevel ? 'rgba(255,255,255,0.15)' : 'var(--card)',
                            color: isTopLevel ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                            borderRadius: 'var(--radius-full)',
                          }}
                        >
                          <small>{usersWithRole} users</small>
                        </span>
                      </div>
                      {role.description && (
                        <p style={{
                          color: isTopLevel ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                          opacity: isTopLevel ? 0.8 : 1,
                        }}>
                          {role.description}
                        </p>
                      )}
                    </div>
                    {idx < orgRoleItems.length - 1 && (
                      <ChevronRight
                        className="w-4 h-4 flex-shrink-0 rotate-90"
                        style={{ color: isTopLevel ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="overflow-hidden"
            style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ color: 'var(--foreground)' }}>Permission Matrix</h3>
              <p style={{ color: 'var(--muted-foreground)' }}>Scope: Organization → Team → User</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th className="text-left px-6 py-3" style={{ backgroundColor: 'var(--muted)' }}>
                      <h6 style={{ color: 'var(--muted-foreground)' }}>Permission</h6>
                    </th>
                    {orgRoleItems.map((r) => (
                      <th key={r.id} className="text-center px-4 py-3" style={{ backgroundColor: 'var(--muted)' }}>
                        <h6 style={{ color: 'var(--muted-foreground)' }}>{r.label}</h6>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionRows.map((row) => (
                    <tr key={row.perm} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-6 py-3">
                        <p style={{ color: 'var(--foreground)' }}>{row.perm}</p>
                      </td>
                      {orgRoleItems.map((r) => (
                        <td key={r.id} className="text-center px-4 py-3">
                          {row.levels.includes(r.order) ? (
                            <CheckCircle className="w-4 h-4 mx-auto" style={{ color: 'var(--foreground)' }} />
                          ) : (
                            <XCircle className="w-4 h-4 mx-auto" style={{ color: 'var(--neutral-4)' }} />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          TAB: Activity — audit log
          ========================================= */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {/* Entity type filter */}
          <div className="flex gap-2 flex-wrap">
            {(['all', 'user', 'team', 'org', 'config'] as const).map((filter) => {
              const labels: Record<string, string> = {
                all: 'All Activity',
                user: 'Users',
                team: 'Teams',
                org: 'Organizations',
                config: 'Config',
              };
              return (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className="px-3 py-1.5 transition-all"
                  style={{
                    backgroundColor: activityFilter === filter ? 'var(--primary)' : 'var(--muted)',
                    color: activityFilter === filter ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <small style={{ fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                    {labels[filter]}
                  </small>
                </button>
              );
            })}
          </div>

          {/* Activity list */}
          <div
            className="overflow-hidden"
            style={{ backgroundColor: 'var(--card)', boxShadow: 'var(--elevation-sm)', borderRadius: 'var(--radius-lg)' }}
          >
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between">
                <h3 style={{ color: 'var(--foreground)' }}>Audit Trail</h3>
                <small style={{ color: 'var(--muted-foreground)' }}>{filteredActivity.length} entries</small>
              </div>
              <p style={{ color: 'var(--muted-foreground)' }}>
                All user management actions are logged here. Will sync to Supabase activity_logs table.
              </p>
            </div>

            <div>
              {filteredActivity.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--neutral-4)' }} />
                  <p style={{ color: 'var(--muted-foreground)' }}>No activity to show</p>
                </div>
              ) : (
                filteredActivity.map((entry, idx) => {
                  const actionLabel = auditActionLabels[entry.action] || entry.action;
                  const actionIcon = auditActionIcons[entry.action] || 'Activity';

                  // Entity badge color
                  const entityColors: Record<string, { color: string; bg: string }> = {
                    user: { color: 'var(--foreground)', bg: 'var(--muted)' },
                    team: { color: 'var(--foreground)', bg: 'var(--muted)' },
                    org: { color: 'var(--primary-foreground)', bg: 'var(--primary)' },
                    config: { color: 'var(--muted-foreground)', bg: 'var(--muted)' },
                  };
                  const entityStyle = entityColors[entry.entityType] || entityColors.user;

                  return (
                    <div
                      key={entry.id}
                      className="px-6 py-4 flex items-start gap-4"
                      style={{
                        borderBottom: idx < filteredActivity.length - 1 ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {/* Icon */}
                      <div
                        className="w-9 h-9 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}
                      >
                        <IconResolver
                          name={actionIcon}
                          className="w-4 h-4"
                          style={{ color: 'var(--foreground)' }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 style={{ color: 'var(--foreground)' }}>{actionLabel}</h4>
                          <span
                            className="px-1.5 py-0.5"
                            style={{
                              backgroundColor: entityStyle.bg,
                              color: entityStyle.color,
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            <small>{entry.entityType}</small>
                          </span>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)' }}>{entry.details}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                            >
                              <span style={{ fontSize: '8px', fontWeight: 'var(--font-weight-medium)' } as React.CSSProperties}>
                                {entry.actorName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <small style={{ color: 'var(--muted-foreground)' }}>{entry.actorName}</small>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" style={{ color: 'var(--neutral-5)' }} />
                            <small style={{ color: 'var(--muted-foreground)' }}>{relativeTime(entry.timestamp)}</small>
                          </div>
                        </div>

                        {/* Metadata badges */}
                        {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {Object.entries(entry.metadata).map(([key, val]) => (
                              <span
                                key={key}
                                className="inline-flex items-center gap-1 px-2 py-0.5"
                                style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-full)' }}
                              >
                                <small style={{ color: 'var(--muted-foreground)' }}>{key}:</small>
                                <small style={{ color: 'var(--foreground)' }}>{val}</small>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="text-right flex-shrink-0">
                        <small style={{ color: 'var(--muted-foreground)' }}>
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </small>
                        <br />
                        <small style={{ color: 'var(--neutral-5)' }}>
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
