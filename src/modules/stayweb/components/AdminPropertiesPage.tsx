/**
 * AdminPropertiesPage
 * ───────────────────
 * Super Admin view — lists every property, shows profile + logo + staff,
 * lets admin configure modules, suspend/delete properties, and manage users.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Search, RefreshCw, ChevronRight, ChevronDown,
  Users, Mail, Calendar, Wifi, ShoppingCart, BedDouble,
  ReceiptText, BarChart3, CheckCircle, XCircle, AlertCircle,
  Save, Loader2, SlidersHorizontal, X, Globe, MapPin,
  ToggleLeft, ToggleRight, Package, ArrowUpRight, IndianRupee,
  Phone, Shield, Trash2, Ban, UserX, UserCheck, Eye, EyeOff,
  ChevronUp, Database, AlertTriangle, Zap
} from 'lucide-react';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { ConfirmDialog } from './ConfirmDialog';
import { notifySuccess, notifyError } from '../utils/notify';
import {
  MODULE_DEFINITIONS,
  TenantModuleConfig,
  buildDefaultConfig,
  isFeatureEnabled
} from '../utils/moduleConfig';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TenantRecord {
  tenantId: string;
  userIds: string[];
  userEmails: string[];
  profile: Record<string, any> | null;
  modules: TenantModuleConfig | null;
  staff?: any[];
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
  lastSignIn: string | null;
  tenantMapping: { tenant_id: string; role: string } | null;
  banned_until?: string | null;
}

interface KVAuditData {
  totalKeys: number;
  categories: Record<string, number>;
  tenantCount: number;
  tenantKeys: Record<string, number>;
  systemKeys: number;
  orphanedKeys: string[];
  orphanedCount: number;
  tenantsWithoutProfile: string[];
  userMappingCount: number;
  timestamp: string;
}

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  BedDouble, ShoppingCart, Users, ReceiptText, BarChart3, Package, IndianRupee, Mail, Building2,
  Home: Building2, // Property Setup uses 'Home' iconKey — map to Building2
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function countEnabled(config: TenantModuleConfig | null): { modules: number; features: number; total: number } {
  const effective = config ?? {};
  let modules = 0; let features = 0; let total = 0;
  for (const mod of MODULE_DEFINITIONS) {
    total += 1 + mod.features.length;
    const modEnabled = isFeatureEnabled(effective, mod.id);
    if (modEnabled) {
      modules++;
      for (const feat of mod.features) {
        features++;
      }
    }
  }
  return { modules, features, total };
}

const BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ead79e26`;

async function getSuperAdminToken(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  } catch { return null; }
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = await getSuperAdminToken();
  if (!token) throw new Error('Not authenticated — please sign in as Super Admin');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Request failed');
  return json;
}

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 ${
        enabled ? 'bg-primary' : 'bg-muted border border-border'
      }`}
      aria-checked={enabled}
      role="switch"
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-background shadow transition-transform ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  );
}

// ─── Module panel (right-side drawer) ────────────────────────────────────────

interface ModulePanelProps {
  tenant: TenantRecord;
  onClose: () => void;
  onSaved: (tenantId: string, config: TenantModuleConfig) => void;
}

function ModulePanel({ tenant, onClose, onSaved }: ModulePanelProps) {
  const [config, setConfig] = useState<TenantModuleConfig>(() =>
    tenant.modules && Object.keys(tenant.modules).length > 0
      ? { ...buildDefaultConfig(), ...tenant.modules }
      : buildDefaultConfig()
  );
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(MODULE_DEFINITIONS[0]?.id ?? null);

  const setModuleEnabled = (moduleId: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        enabled,
        features: prev[moduleId]?.features ?? Object.fromEntries(
          (MODULE_DEFINITIONS.find(m => m.id === moduleId)?.features ?? []).map(f => [f.id, true])
        ),
      },
    }));
    setDirty(true);
  };

  const setFeatureEnabled = (moduleId: string, featureId: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        enabled: prev[moduleId]?.enabled ?? true,
        features: {
          ...(prev[moduleId]?.features ?? {}),
          [featureId]: enabled,
        },
      },
    }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch(`/super-admin/modules/${tenant.tenantId}`, {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      onSaved(tenant.tenantId, config);
      setDirty(false);
      notifySuccess(`Module config saved for ${tenant.profile?.name || tenant.tenantId}`);
    } catch (err: any) {
      notifyError(err, 'Failed to save module config');
    } finally {
      setSaving(false);
    }
  };

  const propertyName = tenant.profile?.name || 'Unnamed Property';
  const propertyCity = tenant.profile?.city || '';

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] bg-card border-l border-border shadow-[var(--elevation-xl)] flex flex-col">
      <div className="flex items-start justify-between px-6 py-5 border-b border-border shrink-0">
        <div>
          <h3 className="font-[var(--font-weight-semibold)] text-[length:var(--text-lg)] text-card-foreground leading-tight">
            Module Configuration
          </h3>
          <p className="text-[length:var(--text-sm)] text-muted-foreground mt-0.5">
            {propertyName}{propertyCity ? ` · ${propertyCity}` : ''}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-[var(--radius-md)] text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {dirty && (
        <div className="mx-4 mt-4 flex items-center gap-2 px-4 py-2.5 bg-warning-bg border border-warning-border rounded-[var(--radius-md)] text-warning-foreground text-[length:var(--text-sm)] shrink-0">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Unsaved changes
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {MODULE_DEFINITIONS.map(mod => {
          const Icon = ICON_MAP[mod.iconKey] ?? Package;
          const modEnabled = isFeatureEnabled(config, mod.id);
          const isExpanded = expanded === mod.id;
          const enabledFeatCount = mod.features.filter(f => isFeatureEnabled(config, mod.id, f.id)).length;

          return (
            <div key={mod.id} className={`border rounded-[var(--radius-lg)] overflow-hidden transition-colors ${modEnabled ? 'border-border' : 'border-border/50 opacity-70'}`}>
              <div className="flex items-center gap-3 px-4 py-3.5 bg-card">
                <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${modEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                  <Icon className={`w-4.5 h-4.5 ${modEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] ${modEnabled ? 'text-card-foreground' : 'text-muted-foreground'}`}>
                      {mod.name}
                    </span>
                    {mod.badge && (
                      <span className="px-1.5 py-0.5 bg-primary/15 text-primary text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] rounded-[var(--radius-sm)] uppercase tracking-wide">
                        {mod.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[length:var(--text-xs)] text-muted-foreground truncate">{mod.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {modEnabled && <span className="text-[length:var(--text-xs)] text-muted-foreground">{enabledFeatCount}/{mod.features.length}</span>}
                  <Toggle enabled={modEnabled} onChange={v => setModuleEnabled(mod.id, v)} />
                  <button onClick={() => setExpanded(isExpanded ? null : mod.id)} className="p-1 text-muted-foreground hover:text-card-foreground transition-colors">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-muted/30 divide-y divide-border/60">
                  {mod.features.map(feat => {
                    const featEnabled = isFeatureEnabled(config, mod.id, feat.id);
                    return (
                      <div key={feat.id} className={`flex items-start gap-3 px-5 py-3 transition-colors ${!modEnabled ? 'opacity-40 pointer-events-none' : ''}`}>
                        <div className="flex-1 min-w-0 pt-0.5">
                          <p className={`text-[length:var(--text-sm)] font-[var(--font-weight-medium)] ${featEnabled ? 'text-card-foreground' : 'text-muted-foreground'}`}>{feat.name}</p>
                          <p className="text-[length:var(--text-xs)] text-muted-foreground leading-relaxed">{feat.description}</p>
                        </div>
                        <Toggle enabled={featEnabled} onChange={v => setFeatureEnabled(mod.id, feat.id, v)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="border-t border-border px-4 py-4 flex items-center justify-between gap-3 shrink-0 bg-card">
        <button onClick={onClose} className="px-4 py-2 border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-muted-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || !dirty} className={`flex items-center gap-2 px-5 py-2 rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] transition-all ${dirty ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ─── Property card ────────────────────────────────────────────────────────────

interface PropertyCardProps {
  tenant: TenantRecord;
  onConfigure: (t: TenantRecord) => void;
  onExpand: (tenantId: string) => void;
  isExpanded: boolean;
  onSuspend: (tenantId: string, suspend: boolean) => void;
  onDelete: (tenantId: string, name: string) => void;
  onSuspendUser: (userId: string, ban: boolean, email: string) => void;
  onDeleteUser: (userId: string, email: string) => void;
}

function PropertyCard({ tenant, onConfigure, onExpand, isExpanded, onSuspend, onDelete, onSuspendUser, onDeleteUser }: PropertyCardProps) {
  const profile = tenant.profile;
  const name = profile?.name || 'Unnamed Property';
  const city = profile?.city || '';
  const country = profile?.country || '';
  const phone = profile?.phone || '';
  const email = profile?.email || '';
  const logoUrl = profile?.logo || profile?.logoUrl || '';
  const isSuspended = profile?.suspended === true;
  const { modules, features } = countEnabled(tenant.modules);
  const totalModules = MODULE_DEFINITIONS.length;
  const hasConfig = !!tenant.modules && Object.keys(tenant.modules).length > 0;
  const staffList = tenant.staff || [];

  const initials = name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className={`bg-card border rounded-[var(--radius-xl)] shadow-[var(--elevation-sm)] hover:shadow-[var(--elevation-md)] transition-shadow ${isSuspended ? 'border-error-border opacity-80' : 'border-border'}`}>
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Logo / Avatar */}
          <div className="w-14 h-14 rounded-[var(--radius-lg)] overflow-hidden bg-primary flex items-center justify-center text-primary-foreground font-[var(--font-weight-bold)] text-[length:var(--text-base)] shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            ) : (
              initials
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-[var(--font-weight-semibold)] text-[length:var(--text-base)] text-card-foreground leading-tight">
                    {name}
                  </h4>
                  {isSuspended && (
                    <span className="px-2 py-0.5 bg-error-bg text-error-foreground border border-error-border rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] uppercase tracking-wider">
                      Suspended
                    </span>
                  )}
                </div>
                {(city || country) && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[length:var(--text-xs)] text-muted-foreground">{[city, country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {(phone || email) && (
                  <div className="flex items-center gap-3 mt-1">
                    {phone && <span className="flex items-center gap-1 text-[length:var(--text-xs)] text-muted-foreground"><Phone className="w-3 h-3" />{phone}</span>}
                    {email && <span className="flex items-center gap-1 text-[length:var(--text-xs)] text-muted-foreground"><Mail className="w-3 h-3" />{email}</span>}
                  </div>
                )}
              </div>

              {/* Module summary badge */}
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-md)] border text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] shrink-0 ${
                hasConfig ? 'bg-info-bg border-info-border text-info-foreground' : 'bg-muted border-border text-muted-foreground'
              }`}>
                <SlidersHorizontal className="w-3 h-3" />
                {hasConfig ? `${modules}/${totalModules} modules` : 'Default (all)'}
              </div>
            </div>

            {/* Users + Staff count */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1.5 text-[length:var(--text-xs)] text-muted-foreground">
                <Users className="w-3.5 h-3.5" />
                <span className="font-[var(--font-weight-medium)]">{tenant.userEmails.length} owner{tenant.userEmails.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[length:var(--text-xs)] text-muted-foreground">
                <Shield className="w-3.5 h-3.5" />
                <span className="font-[var(--font-weight-medium)]">{staffList.length} staff</span>
              </div>
            </div>

            {/* Module pills */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {MODULE_DEFINITIONS.map(mod => {
                const Icon = ICON_MAP[mod.iconKey] ?? Package;
                const enabled = isFeatureEnabled(tenant.modules ?? {}, mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-medium)] border ${
                      enabled ? 'bg-success-bg border-success-border text-success-foreground' : 'bg-error-bg border-error-border text-error-foreground'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    {mod.name}
                  </div>
                );
              })}
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
              <span className="text-[length:var(--text-2xs)] font-mono text-muted-foreground truncate max-w-[200px]">
                {tenant.tenantId}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onExpand(tenant.tenantId)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap"
                >
                  <Users className="w-3.5 h-3.5" />
                  {isExpanded ? 'Hide' : 'Users & Staff'}
                  {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <button
                  onClick={() => onSuspend(tenant.tenantId, !isSuspended)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-medium)] transition-colors whitespace-nowrap ${
                    isSuspended
                      ? 'border-success-border text-success-foreground hover:bg-success-bg'
                      : 'border-warning-border text-warning-foreground hover:bg-warning-bg'
                  }`}
                >
                  {isSuspended ? <UserCheck className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  {isSuspended ? 'Reactivate' : 'Suspend'}
                </button>
                <button
                  onClick={() => onConfigure(tenant)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-semibold)] hover:opacity-90 transition-opacity whitespace-nowrap"
                >
                  Configure
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded: Users & Staff */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20 p-5 space-y-4">
          {/* Owners / Mapped Users */}
          <div>
            <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider mb-2">
              Registered Users ({tenant.userEmails.length})
            </p>
            {tenant.userEmails.length > 0 ? (
              <div className="space-y-1.5">
                {tenant.userEmails.map((userEmail, idx) => (
                  <div key={userEmail} className="flex items-center justify-between p-2.5 bg-card border border-border rounded-[var(--radius-md)]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground truncate">{userEmail}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          const uid = tenant.userIds[idx];
                          if (uid) onSuspendUser(uid, true, userEmail);
                        }}
                        className="p-1.5 text-warning-foreground hover:bg-warning-bg rounded-[var(--radius-sm)] transition-colors"
                        title="Suspend user"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          const uid = tenant.userIds[idx];
                          if (uid) onDeleteUser(uid, userEmail);
                        }}
                        className="p-1.5 text-destructive hover:bg-destructive/10 rounded-[var(--radius-sm)] transition-colors"
                        title="Delete user"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[length:var(--text-xs)] text-muted-foreground italic">No users mapped</p>
            )}
          </div>

          {/* Staff members */}
          <div>
            <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider mb-2">
              Staff Members ({staffList.length})
            </p>
            {staffList.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {staffList.map((s: any) => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 bg-card border border-border rounded-[var(--radius-md)]">
                    <div className="w-8 h-8 rounded-[var(--radius-full)] bg-primary/10 flex items-center justify-center text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-primary shrink-0">
                      {(s.name || '??').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground truncate">{s.name}</span>
                        {s.blocked && (
                          <span className="px-1 py-0.5 bg-error-bg text-error-foreground border border-error-border rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)]">Blocked</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[length:var(--text-xs)] text-muted-foreground">{s.role || s.department || '—'}</span>
                        {s.email && <span className="text-[length:var(--text-xs)] text-muted-foreground truncate">· {s.email}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[length:var(--text-xs)] text-muted-foreground italic">No staff added by this property yet</p>
            )}
          </div>

          {/* Delete property */}
          <div className="pt-2 border-t border-border">
            <button
              onClick={() => onDelete(tenant.tenantId, name)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-destructive border border-destructive/30 rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-medium)] hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Property Permanently
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── KV Audit Panel ───────────────────────────────────────────────────────────

function KVAuditPanel({ onClose }: { onClose: () => void }) {
  const [audit, setAudit] = useState<KVAuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/super-admin/kv-audit');
      setAudit(res.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handlePurge = async () => {
    setPurging(true);
    try {
      const res = await apiFetch('/super-admin/purge-orphans', { method: 'POST' });
      notifySuccess(`Purged ${res.purged} orphaned keys`);
      load();
    } catch (err: any) {
      notifyError(err, 'Failed to purge orphans');
    } finally {
      setPurging(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] bg-card border-l border-border shadow-[var(--elevation-xl)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
        <div>
          <h3 className="font-[var(--font-weight-semibold)] text-[length:var(--text-lg)] text-card-foreground">KV Store Audit</h3>
          <p className="text-[length:var(--text-sm)] text-muted-foreground mt-0.5">Health check of the key-value database</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-[var(--radius-md)] text-muted-foreground hover:bg-muted transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            <p className="text-[length:var(--text-sm)] text-muted-foreground">Auditing KV store…</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-error-bg border border-error-border rounded-[var(--radius-lg)] flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div>
              <p className="font-[var(--font-weight-semibold)] text-error-foreground text-[length:var(--text-sm)]">Audit failed</p>
              <p className="text-[length:var(--text-xs)] text-error-foreground/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {audit && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Keys', value: audit.totalKeys, icon: Database, color: 'text-card-foreground' },
                { label: 'Tenants', value: audit.tenantCount, icon: Building2, color: 'text-info-foreground' },
                { label: 'System Keys', value: audit.systemKeys, icon: Shield, color: 'text-muted-foreground' },
                { label: 'Orphaned', value: audit.orphanedCount, icon: AlertTriangle, color: audit.orphanedCount > 0 ? 'text-warning-foreground' : 'text-success-foreground' },
              ].map(s => (
                <div key={s.label} className="bg-muted/50 border border-border rounded-[var(--radius-lg)] p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <s.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider">{s.label}</span>
                  </div>
                  <p className={`text-[length:var(--text-xl)] font-[var(--font-weight-bold)] ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Key categories */}
            <div>
              <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider mb-3">Key Categories</p>
              <div className="bg-card border border-border rounded-[var(--radius-lg)] divide-y divide-border overflow-hidden">
                {Object.entries(audit.categories).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                  <div key={cat} className="flex items-center justify-between px-4 py-2.5">
                    <code className="text-[length:var(--text-xs)] font-mono text-card-foreground">{cat}</code>
                    <span className="text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-card-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-tenant breakdown */}
            <div>
              <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider mb-3">Per-Tenant Key Count</p>
              <div className="bg-card border border-border rounded-[var(--radius-lg)] divide-y divide-border overflow-hidden">
                {Object.entries(audit.tenantKeys).sort((a, b) => b[1] - a[1]).map(([tid, count]) => (
                  <div key={tid} className="flex items-center justify-between px-4 py-2.5">
                    <code className="text-[length:var(--text-xs)] font-mono text-muted-foreground truncate max-w-[300px]">{tid}</code>
                    <span className="text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-card-foreground">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Warnings */}
            {audit.tenantsWithoutProfile.length > 0 && (
              <div className="p-4 bg-warning-bg border border-warning-border rounded-[var(--radius-lg)]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-[var(--font-weight-semibold)] text-warning-foreground text-[length:var(--text-sm)]">Tenants without profile</p>
                    <div className="mt-1 space-y-0.5">
                      {audit.tenantsWithoutProfile.map(tid => (
                        <code key={tid} className="block text-[length:var(--text-xs)] font-mono text-warning-foreground/80">{tid}</code>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Orphaned keys */}
            {audit.orphanedKeys.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] text-muted-foreground uppercase tracking-wider">Orphaned Keys ({audit.orphanedCount})</p>
                  <button
                    onClick={handlePurge}
                    disabled={purging}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-destructive border border-destructive/30 rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-medium)] hover:bg-destructive/10 transition-colors disabled:opacity-50"
                  >
                    {purging ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Purge All
                  </button>
                </div>
                <div className="bg-card border border-border rounded-[var(--radius-lg)] p-3 max-h-40 overflow-y-auto">
                  {audit.orphanedKeys.map(k => (
                    <code key={k} className="block text-[length:var(--text-xs)] font-mono text-muted-foreground py-0.5">{k}</code>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <p className="text-[length:var(--text-xs)] text-muted-foreground text-right">
              Audited at {new Date(audit.timestamp).toLocaleString()}
            </p>
          </>
        )}
      </div>

      <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-card shrink-0">
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Re-audit
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] hover:opacity-90 transition-opacity">
          Close
        </button>
      </div>
    </div>
  );
}

// ─── Map User Panel ──────────────────────────────────────────────────────────

function MapUserPanel({ tenants, onClose, onMapped }: { tenants: TenantRecord[]; onClose: () => void; onMapped: () => void }) {
  const [email, setEmail] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [customTenantId, setCustomTenantId] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [role, setRole] = useState('admin');
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleMap = async () => {
    const effectiveTenantId = useCustom ? customTenantId.trim() : tenantId.trim();
    if (!email.trim() || !effectiveTenantId) return;
    setSaving(true);
    setResult(null);
    try {
      const res = await apiFetch('/super-admin/map-user', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), tenantId: effectiveTenantId, role }),
      });
      setResult({ success: true, message: `Mapped ${res.email} → ${res.tenantId} (role: ${res.role})` });
      onMapped();
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'Failed to map user' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[480px] bg-card border-l border-border shadow-[var(--elevation-xl)] flex flex-col">
      <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
        <div>
          <h3 className="font-[var(--font-weight-semibold)] text-[length:var(--text-lg)] text-card-foreground">Map User → Tenant</h3>
          <p className="text-[length:var(--text-sm)] text-muted-foreground mt-0.5">Assign a registered user to a property tenant</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-[var(--radius-md)] text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground">
            User Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>
          <p className="text-[length:var(--text-xs)] text-muted-foreground">Must be a registered Supabase Auth user</p>
        </div>

        {/* Tenant ID — dropdown + manual entry */}
        <div className="space-y-1.5">
          <label className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground">
            Tenant ID
          </label>
          {tenants.length > 0 && !useCustom ? (
            <select
              value={tenantId}
              onChange={e => {
                if (e.target.value === '__custom__') {
                  setUseCustom(true);
                  setTenantId('');
                } else {
                  setTenantId(e.target.value);
                }
              }}
              className="w-full px-3 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            >
              <option value="">Select a property…</option>
              {tenants.map(t => (
                <option key={t.tenantId} value={t.tenantId}>
                  {t.profile?.name || 'Unnamed'} — {t.tenantId.substring(0, 12)}…
                </option>
              ))}
              <option value="__custom__">Enter manually…</option>
            </select>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={customTenantId}
                onChange={e => setCustomTenantId(e.target.value)}
                placeholder="e.g. daOace2d-9a0b-4680-9755-2eebc137c901"
                className="w-full px-3 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors font-mono"
                autoFocus
              />
              {tenants.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setUseCustom(false); setCustomTenantId(''); }}
                  className="text-[length:var(--text-xs)] text-muted-foreground hover:text-card-foreground transition-colors underline"
                >
                  Back to dropdown
                </button>
              )}
            </div>
          )}
          <p className="text-[length:var(--text-xs)] text-muted-foreground">The property's unique tenant identifier</p>
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-card-foreground">
            Role
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full px-3 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          >
            <option value="super-admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Result */}
        {result && (
          <div className={`p-4 border rounded-[var(--radius-lg)] flex items-start gap-3 ${
            result.success
              ? 'bg-success-bg border-success-border'
              : 'bg-error-bg border-error-border'
          }`}>
            {result.success
              ? <CheckCircle className="w-5 h-5 text-success shrink-0 mt-0.5" />
              : <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            }
            <p className={`text-[length:var(--text-sm)] font-[var(--font-weight-medium)] ${
              result.success ? 'text-success-foreground' : 'text-error-foreground'
            }`}>
              {result.message}
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-border px-6 py-4 flex items-center justify-between shrink-0 bg-card">
        <button onClick={onClose} className="px-4 py-2 border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-muted-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button
          onClick={handleMap}
          disabled={saving || !email.trim() || !(useCustom ? customTenantId.trim() : tenantId.trim())}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
          {saving ? 'Mapping…' : 'Map User'}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AdminPropertiesPage() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [expandedTenant, setExpandedTenant] = useState<string | null>(null);
  const [showAudit, setShowAudit] = useState(false);
  const [showMapUser, setShowMapUser] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string; description?: string; confirmLabel?: string;
    variant?: 'destructive' | 'warning' | 'default'; onConfirm: () => void;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const tenantsRes = await apiFetch('/super-admin/tenants');
      const tenantList = tenantsRes.data as TenantRecord[];

      // Load staff for each tenant in parallel
      const withStaff = await Promise.all(
        tenantList.map(async (t) => {
          try {
            const staffRes = await apiFetch(`/super-admin/tenant-staff/${t.tenantId}`);
            return { ...t, staff: staffRes.data || [] };
          } catch {
            return { ...t, staff: [] };
          }
        })
      );

      setTenants(withStaff);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleModuleSaved = (tenantId: string, config: TenantModuleConfig) => {
    setTenants(prev => prev.map(t =>
      t.tenantId === tenantId ? { ...t, modules: config } : t
    ));
  };

  const handleSuspendProperty = async (tenantId: string, suspend: boolean) => {
    setActionLoading(true);
    try {
      await apiFetch('/super-admin/suspend-property', {
        method: 'POST',
        body: JSON.stringify({ tenantId, suspended: suspend }),
      });
      notifySuccess(`Property ${suspend ? 'suspended' : 'reactivated'}`);
      setTenants(prev => prev.map(t =>
        t.tenantId === tenantId
          ? { ...t, profile: { ...t.profile, suspended: suspend, suspendedAt: suspend ? new Date().toISOString() : null } }
          : t
      ));
    } catch (err: any) {
      notifyError(err, `Failed to ${suspend ? 'suspend' : 'reactivate'} property`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProperty = async (tenantId: string) => {
    setActionLoading(true);
    try {
      await apiFetch('/super-admin/delete-property', {
        method: 'DELETE',
        body: JSON.stringify({ tenantId }),
      });
      notifySuccess('Property deleted permanently');
      setTenants(prev => prev.filter(t => t.tenantId !== tenantId));
    } catch (err: any) {
      notifyError(err, 'Failed to delete property');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string, ban: boolean, email: string) => {
    setActionLoading(true);
    try {
      await apiFetch('/super-admin/suspend-user', {
        method: 'POST',
        body: JSON.stringify({ targetUserId: userId, ban }),
      });
      notifySuccess(`${email} ${ban ? 'suspended' : 'unsuspended'}`);
    } catch (err: any) {
      notifyError(err, `Failed to ${ban ? 'suspend' : 'unsuspend'} user`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    setActionLoading(true);
    try {
      await apiFetch('/super-admin/delete-user', {
        method: 'DELETE',
        body: JSON.stringify({ targetUserId: userId }),
      });
      notifySuccess(`${email} deleted`);
      load();
    } catch (err: any) {
      notifyError(err, 'Failed to delete user');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = tenants.filter(t => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (t.profile?.name || '').toLowerCase().includes(q) ||
      (t.profile?.city || '').toLowerCase().includes(q) ||
      t.userEmails.some(e => e.toLowerCase().includes(q)) ||
      t.tenantId.toLowerCase().includes(q) ||
      (t.staff || []).some((s: any) => (s.name || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q))
    );
  });

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        <AdminPageHeader
          title="Properties"
          description="Manage all StayWeb properties — view profiles, staff, configure modules, suspend or delete."
          icon={Building2}
          badge={loading ? undefined : `${tenants.length} properties`}
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMapUser(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                <Users className="w-4 h-4" />
                Map User
              </button>
              <button
                onClick={() => setShowAudit(true)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap"
              >
                <Database className="w-4 h-4" />
                KV Audit
              </button>
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          }
        />

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search properties by name, city, email, or staff…"
            className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-[var(--radius-md)] text-[length:var(--text-sm)] text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-card-foreground">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground text-[length:var(--text-sm)]">Loading properties…</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-14 h-14 rounded-full bg-error-bg border border-error-border flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-error" />
            </div>
            <div className="text-center">
              <p className="font-[var(--font-weight-semibold)] text-card-foreground">Failed to load properties</p>
              <p className="text-muted-foreground text-[length:var(--text-sm)] mt-1">{error}</p>
            </div>
            <button onClick={load} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-[var(--radius-md)] text-[length:var(--text-sm)] font-[var(--font-weight-medium)] hover:opacity-90">
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-[var(--font-weight-semibold)] text-card-foreground">
                {tenants.length === 0 ? 'No properties registered yet' : 'No matching properties'}
              </p>
              <p className="text-muted-foreground text-[length:var(--text-sm)] mt-1">
                {tenants.length === 0
                  ? 'Properties will appear here once clients register via the onboarding flow.'
                  : 'Try a different search term.'}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-4">
            {filtered.map(t => (
              <PropertyCard
                key={t.tenantId}
                tenant={t}
                onConfigure={setSelectedTenant}
                onExpand={(id) => setExpandedTenant(prev => prev === id ? null : id)}
                isExpanded={expandedTenant === t.tenantId}
                onSuspend={(id, suspend) => {
                  setConfirmDialog({
                    title: `${suspend ? 'Suspend' : 'Reactivate'} "${t.profile?.name || 'Unnamed'}"?`,
                    description: suspend
                      ? 'This property will be flagged as suspended. Users will still exist but the property will be marked inactive.'
                      : 'This will remove the suspension flag and reactivate the property.',
                    confirmLabel: suspend ? 'Suspend' : 'Reactivate',
                    variant: suspend ? 'warning' : 'default',
                    onConfirm: () => { handleSuspendProperty(id, suspend); setConfirmDialog(null); },
                  });
                }}
                onDelete={(id, name) => {
                  setConfirmDialog({
                    title: `Permanently delete "${name}"?`,
                    description: 'This will delete ALL data for this property including bookings, guests, staff, invoices, and user mappings. This cannot be undone.',
                    confirmLabel: 'Delete Forever',
                    variant: 'destructive',
                    onConfirm: () => { handleDeleteProperty(id); setConfirmDialog(null); },
                  });
                }}
                onSuspendUser={(uid, ban, email) => {
                  setConfirmDialog({
                    title: `Suspend "${email}"?`,
                    description: 'This user will be banned from logging in.',
                    confirmLabel: 'Suspend',
                    variant: 'warning',
                    onConfirm: () => { handleSuspendUser(uid, ban, email); setConfirmDialog(null); },
                  });
                }}
                onDeleteUser={(uid, email) => {
                  setConfirmDialog({
                    title: `Delete "${email}"?`,
                    description: 'This will permanently remove the user from Supabase Auth and delete their tenant mapping.',
                    confirmLabel: 'Delete User',
                    variant: 'destructive',
                    onConfirm: () => { handleDeleteUser(uid, email); setConfirmDialog(null); },
                  });
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Module config panel */}
      {selectedTenant && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setSelectedTenant(null)} />
          <ModulePanel
            tenant={selectedTenant}
            onClose={() => setSelectedTenant(null)}
            onSaved={(id, cfg) => {
              handleModuleSaved(id, cfg);
              setSelectedTenant(prev => prev?.tenantId === id ? { ...prev, modules: cfg } : prev);
            }}
          />
        </>
      )}

      {/* KV Audit panel */}
      {showAudit && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setShowAudit(false)} />
          <KVAuditPanel onClose={() => setShowAudit(false)} />
        </>
      )}

      {/* Map User panel */}
      {showMapUser && (
        <>
          <div className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm" onClick={() => setShowMapUser(false)} />
          <MapUserPanel
            tenants={tenants}
            onClose={() => setShowMapUser(false)}
            onMapped={load}
          />
        </>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog !== null}
        title={confirmDialog?.title || ''}
        description={confirmDialog?.description}
        confirmLabel={confirmDialog?.confirmLabel}
        variant={confirmDialog?.variant || 'destructive'}
        onConfirm={() => confirmDialog?.onConfirm()}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}