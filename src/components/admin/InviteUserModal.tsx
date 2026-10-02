import React, { useState, useEffect, useRef } from 'react';
import { X, UserPlus, ChevronDown, Mail, AlertCircle } from 'lucide-react';
import { usePlatformConfig } from '../../stores/PlatformConfigContext';
import { IconResolver } from '../ui/IconResolver';
import { logActivity } from '../../stores/auditLog';
import type { ConfigItem } from '../../stores/platformConfig';

// ===================================================
// Invite User Modal
// Role picker driven by org-roles config category
// Org + team selectors from passed-in data
// Logs invite action to audit log
// ===================================================

interface OrgOption {
  id: string;
  name: string;
}

interface TeamOption {
  id: string;
  orgId: string;
  name: string;
}

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (data: InviteData) => void;
  orgs: OrgOption[];
  teams: TeamOption[];
  currentActorId: string;
  currentActorName: string;
}

export interface InviteData {
  email: string;
  name: string;
  orgId: string;
  teamId: string;
  role: string;
}

export function InviteUserModal({
  isOpen,
  onClose,
  onInvite,
  orgs,
  teams,
  currentActorId,
  currentActorName,
}: InviteUserModalProps) {
  const { getItems, getStatus } = usePlatformConfig();
  const orgRoleItems = getItems('org-roles');

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const orgRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Filter teams by selected org
  const availableTeams = selectedOrgId
    ? teams.filter((t) => t.orgId === selectedOrgId)
    : [];

  // Reset team when org changes
  useEffect(() => {
    setSelectedTeamId('');
  }, [selectedOrgId]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setName('');
      setSelectedOrgId('');
      setSelectedTeamId('');
      setSelectedRole('');
      setErrors({});
    }
  }, [isOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (orgRef.current && !orgRef.current.contains(e.target as Node)) {
        setOrgDropdownOpen(false);
      }
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) {
        setTeamDropdownOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(e.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format';
    if (!name.trim()) errs.name = 'Name is required';
    if (!selectedOrgId) errs.org = 'Select an organization';
    if (!selectedRole) errs.role = 'Select a role';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    const selectedOrgName = orgs.find((o) => o.id === selectedOrgId)?.name || '';
    const selectedTeamName = teams.find((t) => t.id === selectedTeamId)?.name || '';
    const selectedRoleInfo = getStatus('org-roles', selectedRole);

    // Log to audit trail
    logActivity({
      action: 'user.invited',
      actorId: currentActorId,
      actorName: currentActorName,
      targetId: `pending-${Date.now()}`,
      targetName: name,
      entityType: 'user',
      details: `Invited ${name} (${email}) as ${selectedRoleInfo.label} to ${selectedTeamName ? selectedTeamName + ' in ' : ''}${selectedOrgName}`,
      metadata: {
        email,
        role: selectedRole,
        org: selectedOrgName,
        ...(selectedTeamName ? { team: selectedTeamName } : {}),
      },
    });

    onInvite({
      email,
      name,
      orgId: selectedOrgId,
      teamId: selectedTeamId,
      role: selectedRole,
    });

    onClose();
  }

  if (!isOpen) return null;

  const selectedOrg = orgs.find((o) => o.id === selectedOrgId);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);
  const selectedRoleItem: ConfigItem | undefined = orgRoleItems.find(
    (r) => r.value === selectedRole
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-lg mx-4"
        style={{
          backgroundColor: 'var(--card)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)', borderRadius: 'var(--radius-md)' }}
            >
              <UserPlus className="w-4 h-4" style={{ color: 'var(--primary-foreground)' }} />
            </div>
            <div>
              <h4 style={{ color: 'var(--foreground)' }}>Invite User</h4>
              <small style={{ color: 'var(--muted-foreground)' }}>
                Send an invitation to join your organization
              </small>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 transition-opacity hover:opacity-70"
            style={{ color: 'var(--muted-foreground)', borderRadius: 'var(--radius-md)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Email */}
          <div>
            <label style={{ color: 'var(--foreground)' }} className="block mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: 'var(--muted-foreground)' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: '' })); }}
                placeholder="user@company.com"
                className="w-full pl-10 pr-4 py-2.5 outline-none"
                style={{
                  backgroundColor: 'var(--input-background)',
                  border: `1px solid ${errors.email ? 'var(--destructive)' : 'var(--border)'}`,
                  color: 'var(--foreground)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: 'var(--destructive)' }} />
                <small style={{ color: 'var(--destructive)' }}>{errors.email}</small>
              </div>
            )}
          </div>

          {/* Name */}
          <div>
            <label style={{ color: 'var(--foreground)' }} className="block mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: '' })); }}
              placeholder="Jane Doe"
              className="w-full px-4 py-2.5 outline-none"
              style={{
                backgroundColor: 'var(--input-background)',
                border: `1px solid ${errors.name ? 'var(--destructive)' : 'var(--border)'}`,
                color: 'var(--foreground)',
                borderRadius: 'var(--radius-md)',
              }}
            />
            {errors.name && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: 'var(--destructive)' }} />
                <small style={{ color: 'var(--destructive)' }}>{errors.name}</small>
              </div>
            )}
          </div>

          {/* Organization Selector */}
          <div ref={orgRef}>
            <label style={{ color: 'var(--foreground)' }} className="block mb-1.5">
              Organization
            </label>
            <button
              type="button"
              onClick={() => { setOrgDropdownOpen(!orgDropdownOpen); setTeamDropdownOpen(false); setRoleDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
              style={{
                backgroundColor: 'var(--input-background)',
                border: `1px solid ${errors.org ? 'var(--destructive)' : 'var(--border)'}`,
                color: selectedOrg ? 'var(--foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)' }}>
                {selectedOrg ? selectedOrg.name : 'Select organization...'}
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </button>
            {orgDropdownOpen && (
              <div
                className="mt-1 overflow-hidden z-10 relative"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--elevation-sm)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => { setSelectedOrgId(org.id); setOrgDropdownOpen(false); setErrors((prev) => ({ ...prev, org: '' })); }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-colors"
                    style={{
                      backgroundColor: selectedOrgId === org.id ? 'var(--muted)' : 'transparent',
                      color: 'var(--foreground)',
                    }}
                    onMouseEnter={(e) => { if (selectedOrgId !== org.id) (e.currentTarget.style.backgroundColor = 'var(--muted)'); }}
                    onMouseLeave={(e) => { if (selectedOrgId !== org.id) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                  >
                    <IconResolver name="Building2" className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    <p style={{ color: 'var(--foreground)' }}>{org.name}</p>
                  </button>
                ))}
              </div>
            )}
            {errors.org && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: 'var(--destructive)' }} />
                <small style={{ color: 'var(--destructive)' }}>{errors.org}</small>
              </div>
            )}
          </div>

          {/* Team Selector (optional) */}
          <div ref={teamRef}>
            <label style={{ color: 'var(--foreground)' }} className="block mb-1.5">
              Team <small style={{ color: 'var(--muted-foreground)' }}>(optional)</small>
            </label>
            <button
              type="button"
              onClick={() => {
                if (availableTeams.length > 0) {
                  setTeamDropdownOpen(!teamDropdownOpen);
                  setOrgDropdownOpen(false);
                  setRoleDropdownOpen(false);
                }
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
              style={{
                backgroundColor: 'var(--input-background)',
                border: '1px solid var(--border)',
                color: selectedTeam ? 'var(--foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius-md)',
                opacity: availableTeams.length === 0 ? 0.5 : 1,
                cursor: availableTeams.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <span style={{ fontSize: 'var(--text-sm)' }}>
                {selectedTeam
                  ? selectedTeam.name
                  : availableTeams.length === 0
                    ? 'Select an org first'
                    : 'Select team...'}
              </span>
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </button>
            {teamDropdownOpen && availableTeams.length > 0 && (
              <div
                className="mt-1 overflow-hidden z-10 relative"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--elevation-sm)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {availableTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => { setSelectedTeamId(team.id); setTeamDropdownOpen(false); }}
                    className="w-full px-4 py-2.5 text-left flex items-center gap-2 transition-colors"
                    style={{
                      backgroundColor: selectedTeamId === team.id ? 'var(--muted)' : 'transparent',
                      color: 'var(--foreground)',
                    }}
                    onMouseEnter={(e) => { if (selectedTeamId !== team.id) (e.currentTarget.style.backgroundColor = 'var(--muted)'); }}
                    onMouseLeave={(e) => { if (selectedTeamId !== team.id) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                  >
                    <IconResolver name="Network" className="w-3.5 h-3.5" style={{ color: 'var(--muted-foreground)' }} />
                    <p style={{ color: 'var(--foreground)' }}>{team.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Picker — driven by org-roles config */}
          <div ref={roleRef}>
            <label style={{ color: 'var(--foreground)' }} className="block mb-1.5">
              Role
            </label>
            <button
              type="button"
              onClick={() => { setRoleDropdownOpen(!roleDropdownOpen); setOrgDropdownOpen(false); setTeamDropdownOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
              style={{
                backgroundColor: 'var(--input-background)',
                border: `1px solid ${errors.role ? 'var(--destructive)' : 'var(--border)'}`,
                color: selectedRoleItem ? 'var(--foreground)' : 'var(--muted-foreground)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {selectedRoleItem ? (
                <span className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)' }}>
                  <IconResolver name={selectedRoleItem.icon} className="w-3.5 h-3.5" style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)' }}>{selectedRoleItem.label}</span>
                </span>
              ) : (
                <span style={{ fontSize: 'var(--text-sm)' }}>Select role...</span>
              )}
              <ChevronDown className="w-4 h-4" style={{ color: 'var(--muted-foreground)' }} />
            </button>
            {roleDropdownOpen && (
              <div
                className="mt-1 overflow-hidden z-10 relative"
                style={{
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--elevation-sm)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                {orgRoleItems
                  .filter((r) => r.value !== 'owner') // Can't invite as owner
                  .map((role) => (
                    <button
                      key={role.id}
                      onClick={() => { setSelectedRole(role.value); setRoleDropdownOpen(false); setErrors((prev) => ({ ...prev, role: '' })); }}
                      className="w-full px-4 py-3 text-left flex items-start gap-3 transition-colors"
                      style={{
                        backgroundColor: selectedRole === role.value ? 'var(--muted)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                      }}
                      onMouseEnter={(e) => { if (selectedRole !== role.value) (e.currentTarget.style.backgroundColor = 'var(--muted)'); }}
                      onMouseLeave={(e) => { if (selectedRole !== role.value) (e.currentTarget.style.backgroundColor = 'transparent'); }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ backgroundColor: 'var(--muted)', borderRadius: 'var(--radius-md)' }}
                      >
                        <IconResolver
                          name={role.icon}
                          className="w-4 h-4"
                          style={{ color: 'var(--foreground)' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 style={{ color: 'var(--foreground)' }}>{role.label}</h4>
                          <span
                            className="px-1.5 py-0.5"
                            style={{
                              backgroundColor: 'var(--muted)',
                              borderRadius: 'var(--radius-full)',
                            }}
                          >
                            <small style={{ color: 'var(--muted-foreground)' }}>
                              Level {role.order}
                            </small>
                          </span>
                        </div>
                        {role.description && (
                          <p style={{ color: 'var(--muted-foreground)' }}>
                            {role.description}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
              </div>
            )}
            {errors.role && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" style={{ color: 'var(--destructive)' }} />
                <small style={{ color: 'var(--destructive)' }}>{errors.role}</small>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2.5 transition-opacity hover:opacity-70"
            style={{
              backgroundColor: 'var(--muted)',
              color: 'var(--foreground)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <span>Cancel</span>
          </button>
          <button
            onClick={handleSubmit}
            className="flex items-center gap-2 px-4 py-2.5 transition-opacity hover:opacity-80"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <UserPlus className="w-4 h-4" />
            <span>Send Invite</span>
          </button>
        </div>
      </div>
    </div>
  );
}
