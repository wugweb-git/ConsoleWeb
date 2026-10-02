/**
 * @module AdminConfigPage
 * @description Super Admin Configuration panel. Manages global platform configs (amenities, POS units, roles) pushed down to all tenants via KV store.
 * @label [Feature: SuperAdmin, Admin, Global State]
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Upload, Download, Trash2, Edit2, X, Check,
  IndianRupee, BedDouble, Sparkles, Tag, Users,
  ReceiptText, Coffee, Package, IdCard, UserCheck,
  Brush, Clock, Building, Briefcase, AlertTriangle, Shield, ArrowRight
} from 'lucide-react';
import { DataTable, DataTableColumn } from './ui/DataTable';
import { AdminPageHeader } from './ui/AdminPageHeader';
import { CSVImportModal } from './ui/CSVImportModal';
import type { CSVColumnSpec, CSVTemplateRow } from './ui/CSVImportModal';
import { IconPickerField } from './ui/IconPickerField';
import { getIconByKey, suggestIconForName } from '../utils/iconMapping';
import { notifySuccess, notifyError } from '../utils/notify';
import { PERMISSION_TO_MODULE_FEATURES, usePlatformConfig } from '../utils/platformConfig';
import { MODULE_DEFINITIONS } from '../utils/moduleConfig';
import {
  adminStaffRoleCSVColumns, adminStaffRoleCSVTemplateRows,
  adminPOSCategoryCSVColumns, adminPOSCategoryCSVTemplateRows,
  adminPOSDietaryCSVColumns, adminPOSDietaryCSVTemplateRows,
  adminPOSUnitCSVColumns, adminPOSUnitCSVTemplateRows,
  adminRoomTypeCSVColumns, adminRoomTypeCSVTemplateRows,
  adminAmenityCSVColumns, adminAmenityCSVTemplateRows,
  adminManualChargeCSVColumns, adminManualChargeCSVTemplateRows,
  adminIdDocTypeCSVColumns, adminIdDocTypeCSVTemplateRows,
  adminGenderCSVColumns, adminGenderCSVTemplateRows,
  adminHKTaskTypeCSVColumns, adminHKTaskTypeCSVTemplateRows,
  adminHKPriorityCSVColumns, adminHKPriorityCSVTemplateRows,
  adminHKRoomItemCSVColumns, adminHKRoomItemCSVTemplateRows,
  adminStaffDeptCSVColumns, adminStaffDeptCSVTemplateRows,
  adminShiftTypeCSVColumns, adminShiftTypeCSVTemplateRows,
} from '../utils/csvConfigs';
import { apiClient } from '../src/api/client';

// ─── Utility ──────────────────────────────────────────────────────────────────
function uid(): string { return crypto.randomUUID(); }

/** Merge new CSV rows into existing items, skipping duplicates by name (case-insensitive).
 *  Returns { merged, imported, skipped } */
function deduplicateMerge<T extends Record<string, any>>(
  existing: T[],
  incoming: T[],
  keyFn: (item: T) => string = (item) => ((item.name || item.code || '') as string).trim().toLowerCase()
): { merged: T[]; imported: number; skipped: number } {
  const seen = new Set(existing.map(keyFn));
  const newItems: T[] = [];
  let skipped = 0;
  for (const item of incoming) {
    const key = keyFn(item);
    if (key && seen.has(key)) {
      skipped++;
    } else {
      seen.add(key);
      newItems.push(item);
    }
  }
  return { merged: [...existing, ...newItems], imported: newItems.length, skipped };
}

// ─── Platform Config Backend Sync ─────────────────────────────────────────────
// All admin_cfg_* localStorage keys that should be synced to the backend
const PLATFORM_CONFIG_LS_KEYS = [
  'admin_cfg_staff_roles', 'admin_cfg_pos_cats', 'admin_cfg_pos_dietary',
  'admin_cfg_pos_units', 'admin_cfg_room_types', 'admin_cfg_amenities',
  'admin_cfg_manual_charges', 'admin_cfg_id_types', 'admin_cfg_genders',
  'admin_cfg_hk_task_types', 'admin_cfg_hk_priorities', 'admin_cfg_staff_depts',
  'admin_cfg_shift_types', 'admin_cfg_hk_room_items',
];

/** Collect all platform config from localStorage into a single object */
function collectPlatformConfig(): Record<string, any[]> {
  const config: Record<string, any[]> = {};
  for (const key of PLATFORM_CONFIG_LS_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) config[key] = JSON.parse(raw);
    } catch { /* skip corrupted keys */ }
  }
  return config;
}

/** 
 * ─── Platform Config Sync Engine ─────────────────────────────────────────────
 * 
 * ARCHITECTURE: localStorage (source of truth while app is open) → backend (persistent store)
 * 
 * KNOWN PAST BUGS (all fixed below):
 * 1. setKey() on the server silently swallowed DB errors → data never persisted
 * 2. _syncInFlight guard silently DROPPED syncs if one was already running
 * 3. beforeunload handler was a no-op — pending debounced syncs were lost on navigate
 * 4. No verification after write — PUT returned 200 even when DB write failed
 * 5. No "dirty" flag — if sync failed and user reloaded, data was lost forever
 */
let _syncTimer: ReturnType<typeof setTimeout> | null = null;
let _syncInFlight = false;
let _syncDirtyWhileInFlight = false; // BUG FIX #2: track changes during in-flight sync
let _lastSyncFailed = false;
const PENDING_SYNC_LS_KEY = 'admin_cfg__pending_sync'; // BUG FIX #3: survive page close

/** Mark that a sync is needed (persists across page reloads) */
function markSyncPending() {
  try { localStorage.setItem(PENDING_SYNC_LS_KEY, Date.now().toString()); } catch { /* noop */ }
}

/** Clear the pending sync flag */
function clearSyncPending() {
  try { localStorage.removeItem(PENDING_SYNC_LS_KEY); } catch { /* noop */ }
}

/** Check if there's an unsynced change from a previous session */
function hasPendingSync(): boolean {
  try { return !!localStorage.getItem(PENDING_SYNC_LS_KEY); } catch { return false; }
}

async function doPlatformConfigSync(): Promise<boolean> {
  // BUG FIX #2: Instead of silently returning false, mark dirty so we re-sync after current completes
  if (_syncInFlight) {
    _syncDirtyWhileInFlight = true;
    console.log('[PlatformConfig] Sync already in flight — will re-sync when current completes');
    return false;
  }
  _syncInFlight = true;
  _syncDirtyWhileInFlight = false;

  // Collect LATEST localStorage state (not a stale snapshot)
  const config = collectPlatformConfig();
  const MAX_RETRIES = 2;
  const RETRY_DELAYS = [2000, 4000];
  let lastErr: any;

  // Log what we're syncing for debugging data loss issues
  const sectionSummary = Object.entries(config)
    .map(([k, v]) => `${k.replace('admin_cfg_', '')}(${Array.isArray(v) ? v.length : '?'})`)
    .join(', ');
  console.log(`[PlatformConfig] Sync starting: ${Object.keys(config).length} sections — ${sectionSummary}`);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      await apiClient.fetch('/platform-config', {
        method: 'PUT',
        body: JSON.stringify(config),
      });
      console.log(`[PlatformConfig] Synced to backend (attempt ${attempt + 1}/${MAX_RETRIES + 1})`);
      _lastSyncFailed = false;
      _syncInFlight = false;
      clearSyncPending(); // BUG FIX #3: clear dirty flag on success
      window.dispatchEvent(new CustomEvent('platform-config-sync-result', { detail: { success: true } }));

      // BUG FIX #2: If data changed while we were syncing, re-sync with latest data
      if (_syncDirtyWhileInFlight) {
        console.log('[PlatformConfig] Changes occurred during sync — re-syncing with latest data');
        _syncDirtyWhileInFlight = false;
        setTimeout(() => doPlatformConfigSync(), 300);
      }
      return true;
    } catch (err: any) {
      lastErr = err;
      const isTransient = !err.status || err.status === 0 || err.status >= 500;
      if (!isTransient || attempt >= MAX_RETRIES) break;
      console.warn(`[PlatformConfig] Sync attempt ${attempt + 1} failed (${err.message || err.status}), retrying in ${RETRY_DELAYS[attempt]}ms...`);
      await new Promise(r => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }

  console.error('[PlatformConfig] Backend sync FAILED after all retries:', lastErr?.message || lastErr);
  _lastSyncFailed = true;
  _syncInFlight = false;
  markSyncPending(); // BUG FIX #3: persist dirty flag so next page load retries
  window.dispatchEvent(new CustomEvent('platform-config-sync-result', { detail: { success: false, error: lastErr } }));

  // BUG FIX #2: Even on failure, if data changed during sync, schedule another attempt
  if (_syncDirtyWhileInFlight) {
    _syncDirtyWhileInFlight = false;
    setTimeout(() => doPlatformConfigSync(), 5000); // longer delay after failure
  }
  return false;
}

/** Debounced sync: batches rapid changes (individual add/edit/delete) */
function schedulePlatformConfigSync() {
  markSyncPending(); // BUG FIX #3: mark dirty IMMEDIATELY so beforeunload knows
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(() => { _syncTimer = null; doPlatformConfigSync(); }, 1500);
}

/** Immediate sync: used after CSV imports — bypasses debounce, returns success/failure */
async function immediatePlatformConfigSync(): Promise<boolean> {
  if (_syncTimer) { clearTimeout(_syncTimer); _syncTimer = null; }
  markSyncPending();
  return doPlatformConfigSync();
}

// ─── BUG FIX #3: Flush pending sync on page unload ───
// sendBeacon can't send custom auth headers, so we can't actually sync here.
// Instead, we ensure the "pending sync" flag is set in localStorage.
// On next app load, loadFromBackend() detects this flag and triggers an immediate sync.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (_syncTimer || _syncInFlight || _syncDirtyWhileInFlight) {
      markSyncPending();
      if (_syncTimer) clearTimeout(_syncTimer);
      console.warn('[PlatformConfig] beforeunload — unsaved changes flagged for recovery on next load');
    }
  });
}

/** Download any rows as a CSV file */
function downloadCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) { notifyError('Nothing to export'); return; }
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  notifySuccess(`Exported ${rows.length} rows`);
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface StaffRole   { id: string; name: string; permissions: string; description: string; }
interface POSCategory { id: string; name: string; description: string; color: string; icon?: string; isAlcohol?: string; }
interface POSDietary  { id: string; name: string; label: string; code: string; }
interface POSUnit     { id: string; name: string; abbreviation: string; }
interface RoomType    { id: string; name: string; capacity: string; description: string; }
interface Amenity     { id: string; name: string; category: string; icon: string; description: string; type?: string; }
interface ManualCharge{ id: string; name: string; icon: string; category: string; }
interface IdDocType   { id: string; name: string; code: string; description: string; }
interface GenderOption{ id: string; name: string; code: string; }

// Housekeeping & Staff config types
interface HKTaskType     { id: string; name: string; code: string; estimatedMinutes: string; checklist: string; icon: string; colorScheme: string; }
interface HKPriority     { id: string; name: string; code: string; color: string; }
interface HKRoomItem     { id: string; name: string; category: string; parPerBed: string; unit: string; }
interface StaffDepartment{ id: string; name: string; description: string; roles: string; }
interface StaffShiftType { id: string; name: string; code: string; startTime: string; endTime: string; color: string; }

// ─── Local state hook (localStorage-backed + backend-synced) ──────────────────
function useLocalList<T extends { id: string }>(key: string, seed: T[]) {
  const readLS = (): T[] => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : seed;
    } catch { return seed; }
  };
  const [items, setItems] = useState<T[]>(readLS);

  // Re-read from localStorage when backend hydration fires 'platform-config-hydrated'
  // This ensures sections pick up data loaded from the server after initial mount
  useEffect(() => {
    const handleHydration = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      // Only re-read if this key was part of the hydration, or if it's a global hydration
      if (!detail?.key || detail.key === key) {
        const fresh = readLS();
        setItems(fresh);
      }
    };
    window.addEventListener('platform-config-hydrated', handleHydration);
    return () => window.removeEventListener('platform-config-hydrated', handleHydration);
  }, [key]);

  const persist = (next: T[]) => {
    localStorage.setItem(key, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('platform-config-changed', { detail: { key } }));
    // Auto-sync all platform config to backend (debounced)
    schedulePlatformConfigSync();
  };
  const save    = (next: T[]) => { setItems(next); persist(next); };
  return {
    items,
    add:    (item: T)    => setItems(prev => { const next = [...prev, item]; persist(next); return next; }),
    update: (item: T)    => setItems(prev => { const next = prev.map(i => i.id === item.id ? item : i); persist(next); return next; }),
    remove: (id: string) => setItems(prev => { const next = prev.filter(i => i.id !== id); persist(next); return next; }),
    setItems: save,
  };
}

// ─── Consistent CSV Action Bar ────────────────────────────────────────────────
// Import CSV -> Export CSV -> Add  (Import opens CSVImportModal with format instructions)
interface CSVBarProps {
  addLabel:         string;
  importTitle:      string;
  columns:          CSVColumnSpec[];
  templateRows:     CSVTemplateRow[];
  templateFilename: string;
  extraNotes?:      string;
  parseRow:         (cells: string[], index: number) => any | null;
  onImportComplete: (rows: any[]) => Promise<{ imported: number; skipped?: number; failed?: number }>;
  onAdd:            () => void;
  onExport:         () => void;
}
function CSVActionBar({ addLabel, importTitle, columns, templateRows, templateFilename, extraNotes, parseRow, onImportComplete, onAdd, onExport }: CSVBarProps) {
  const [showImportModal, setShowImportModal] = useState(false);

  // Wrap onImportComplete to trigger immediate backend sync after CSV import
  const handleImportWithSync = async (rows: any[]) => {
    const result = await onImportComplete(rows);
    // After the import handler has updated localStorage via persist(),
    // fire an immediate sync (bypass debounce) so data reaches the backend NOW
    if (result.imported && result.imported > 0) {
      const synced = await immediatePlatformConfigSync();
      if (!synced) {
        notifyError('Data saved locally but failed to sync to server. Changes may be lost if you clear browser data.');
      }
    }
    return result;
  };

  const btnBase = 'flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[length:var(--text-sm)] font-[var(--font-weight-medium)] whitespace-nowrap';

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {/* 1 - Import (opens CSVImportModal) */}
        <button onClick={() => setShowImportModal(true)} className={btnBase}>
          <Upload className="w-4 h-4" />
          <span>Import CSV</span>
        </button>

        {/* 2 - Export */}
        <button onClick={onExport} className={btnBase}>
          <Download className="w-4 h-4" />
          <span>Export CSV</span>
        </button>

        {/* 3 - Add */}
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>{addLabel}</span>
        </button>
      </div>

      {showImportModal && (
        <CSVImportModal
          title={importTitle}
          columns={columns}
          templateRows={templateRows}
          templateFilename={templateFilename}
          extraNotes={extraNotes}
          onClose={() => setShowImportModal(false)}
          parseRow={parseRow}
          onImport={handleImportWithSync}
        />
      )}
    </>
  );
}

// ─── Field definition + Quick-add modal ──────────────────────────────────────
interface FieldDef { key: string; label: string; placeholder?: string; type?: string; options?: string[]; }

interface QuickModalProps {
  title:   string;
  fields:  FieldDef[];
  initial?: Record<string, string>;
  onSave:  (data: Record<string, string>) => void;
  onClose: () => void;
}
function QuickModal({ title, fields, initial = {}, onSave, onClose }: QuickModalProps) {
  const [form, setForm] = useState<Record<string, string>>(
    Object.fromEntries(fields.map(f => [f.key, initial[f.key] ?? '']))
  );
  // Derive the item name for icon auto-suggest
  const itemName = form['name'] || '';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border rounded-[var(--radius-xl)] shadow-xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h4 className="font-[var(--font-weight-semibold)] text-card-foreground">{title}</h4>
          <button onClick={onClose} className="p-1.5 rounded-[var(--radius-md)] hover:bg-muted transition-colors text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              {f.type === 'icon' ? (
                <IconPickerField
                  label={f.label}
                  value={form[f.key]}
                  onChange={v => setForm(p => ({ ...p, [f.key]: v }))}
                  itemName={itemName}
                />
              ) : f.options ? (
                <>
                  <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-foreground mb-1.5">{f.label}</label>
                  <select
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-[var(--radius-md)] bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring text-[length:var(--text-sm)]"
                  >
                    <option value="">{f.placeholder || `Select ${f.label}`}</option>
                    {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </>
              ) : f.type === 'toggle' ? (
                <>
                  <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-foreground mb-1.5">{f.label}</label>
                  <button
                    type="button"
                    onClick={() => setForm(p => ({ ...p, [f.key]: p[f.key] === 'true' ? 'false' : 'true' }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      form[f.key] === 'true' ? 'bg-primary' : 'bg-muted border border-border'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                      form[f.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </>
              ) : (
                <>
                  <label className="block text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-foreground mb-1.5">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder || f.label}
                    className="w-full px-3 py-2 border border-border rounded-[var(--radius-md)] bg-input-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-[length:var(--text-sm)]"
                  />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-4 py-2 rounded-[var(--radius-md)] border border-border text-muted-foreground hover:bg-muted transition-colors text-[length:var(--text-sm)] font-[var(--font-weight-medium)]">
            Cancel
          </button>
          <button
            onClick={() => { onSave(form); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-[length:var(--text-sm)] font-[var(--font-weight-semibold)]"
          >
            <Check className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared row actions ──────────────────────────────────────────────────────
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <button onClick={onEdit}   className="p-1.5 rounded-[var(--radius-md)] text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Edit2  className="w-4 h-4" /></button>
      <button onClick={onDelete} className="p-1.5 rounded-[var(--radius-md)] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

// ─────────────────────────────────────────────���─────────────��──────────────────
// SECTION 1 - Staff Roles
// ──────────────────────────────────────────────────────────────────────────────
function StaffRolesSection() {
  const list  = useLocalList<StaffRole>('admin_cfg_staff_roles', []);
  const [modal, setModal] = useState<{ editing?: StaffRole } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name',        label: 'Role Name',                          placeholder: 'e.g. Receptionist' },
    { key: 'permissions', label: 'Permissions (comma-separated)',       placeholder: 'bookings,guests,reports' },
    { key: 'description', label: 'Description',                        placeholder: 'Brief description' },
  ];

  const cols: DataTableColumn<StaffRole>[] = [
    { key: 'name', header: 'Role', render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Users className="w-4 h-4 text-primary" />
          </div>
          <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
        </div>
    )},
    { key: 'permissions', header: 'Permissions', render: r => (
        <div className="flex flex-wrap gap-1">
          {r.permissions.split(',').filter(Boolean).map(p => (
            <span key={p} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] tracking-wider">{p.trim()}</span>
          ))}
        </div>
    )},
    { key: 'description', header: 'Description', render: r => <span className="text-muted-foreground text-[length:var(--text-sm)]">{r.description}</span> },
    { key: 'actions', header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Role deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Staff Roles"
        description="Define platform-wide roles and their permission scopes."
        icon={Users}
        actions={
          <CSVActionBar
            addLabel="Add Role"
            importTitle="Import Staff Roles"
            columns={adminStaffRoleCSVColumns}
            templateRows={adminStaffRoleCSVTemplateRows}
            templateFilename="staff-roles-template.csv"
            parseRow={(cells) => ({
              id: uid(),
              name: cells[0] || '',
              permissions: cells[1] || '',
              description: cells[2] || '',
            })}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} roles${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} roles already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('staff-roles.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={10}
          emptyIcon={<Users className="w-8 h-8 text-muted-foreground" />}
          emptyTitle="No roles defined"
          emptyDescription="Use Import CSV to upload roles from a template, or add them one by one." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Role' : 'Add Staff Role'} fields={fields} initial={modal.editing}
          onSave={data => { modal.editing ? list.update({ ...modal.editing, ...data }) : list.add({ id: uid(), ...data } as StaffRole); notifySuccess(modal.editing ? 'Role updated' : 'Role added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 2 - POS Config (3 sub-tabs)
// ──────────────────────────────────────────────────────────────────────────────
type POSSub = 'categories' | 'dietary' | 'units';

function POSConfigSection() {
  const [sub, setSub] = useState<POSSub>('categories');
  const cats  = useLocalList<POSCategory>('admin_cfg_pos_cats',    []);
  const diets = useLocalList<POSDietary> ('admin_cfg_pos_dietary',  []);
  const units = useLocalList<POSUnit>    ('admin_cfg_pos_units',    []);
  const [modal, setModal] = useState<{ editing?: any; type?: string } | null>(null);

  const subTabs: { key: POSSub; label: string }[] = [
    { key: 'categories', label: 'Categories' },
    { key: 'dietary',    label: 'Dietary Tags' },
    { key: 'units',      label: 'Units' },
  ];

  // CSV config per sub-tab
  const csvConfig = sub === 'categories'
    ? { columns: adminPOSCategoryCSVColumns, templateRows: adminPOSCategoryCSVTemplateRows, templateFilename: 'pos-categories-template.csv', importTitle: 'Import POS Categories' }
    : sub === 'dietary'
    ? { columns: adminPOSDietaryCSVColumns, templateRows: adminPOSDietaryCSVTemplateRows, templateFilename: 'pos-dietary-template.csv', importTitle: 'Import Dietary Tags' }
    : { columns: adminPOSUnitCSVColumns, templateRows: adminPOSUnitCSVTemplateRows, templateFilename: 'pos-units-template.csv', importTitle: 'Import POS Units' };

  const catCols: DataTableColumn<POSCategory>[] = [
    { key: 'name', header: 'Category', render: r => {
        const CatIcon = r.icon ? getIconByKey(r.icon) : null;
        return (
          <div className="flex items-center gap-3">
            {CatIcon ? (
              <div className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0" style={{ background: r.color + '20' }}>
                <CatIcon className="w-4 h-4" style={{ color: r.color }} />
              </div>
            ) : (
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: r.color }} />
            )}
            <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
          </div>
        );
    }},
    { key: 'description', header: 'Description', render: r => <span className="text-muted-foreground text-[length:var(--text-sm)]">{r.description}</span> },
    { key: 'color',       header: 'Colour',      render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.color}</code> },
    { key: 'isAlcohol',   header: 'Alcohol',     render: r => r.isAlcohol === 'true' ? <span className="px-2 py-0.5 bg-purple-bg text-purple-foreground text-[length:var(--text-2xs)] rounded-full font-[var(--font-weight-bold)] border border-purple-border">Alcohol</span> : <span className="text-muted-foreground text-[length:var(--text-xs)]">&mdash;</span> },
    { key: 'actions', header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r, type: 'cat' })} onDelete={() => { cats.remove(r.id); notifySuccess('Category deleted'); }} />
    )},
  ];
  const dietCols: DataTableColumn<POSDietary>[] = [
    { key: 'name',  header: 'Dietary Type', render: r => <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span> },
    { key: 'label', header: 'Label',        render: r => <span className="px-2 py-0.5 bg-success-bg text-success-foreground text-[length:var(--text-2xs)] rounded-full font-[var(--font-weight-bold)] border border-success-border">{r.label}</span> },
    { key: 'code',  header: 'Code',         render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.code}</code> },
    { key: 'actions', header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r, type: 'diet' })} onDelete={() => { diets.remove(r.id); notifySuccess('Dietary tag deleted'); }} />
    )},
  ];
  const unitCols: DataTableColumn<POSUnit>[] = [
    { key: 'name',         header: 'Unit',         render: r => <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span> },
    { key: 'abbreviation', header: 'Abbreviation', render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.abbreviation}</code> },
    { key: 'actions', header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r, type: 'unit' })} onDelete={() => { units.remove(r.id); notifySuccess('Unit deleted'); }} />
    )},
  ];

  const catFields:  FieldDef[] = [{ key: 'name', label: 'Category Name', placeholder: 'e.g. Beverages' }, { key: 'description', label: 'Description', placeholder: 'Short description' }, { key: 'icon', label: 'Icon', type: 'icon' }, { key: 'color', label: 'Colour (hex)', placeholder: '#F59E0B', type: 'color' }, { key: 'isAlcohol', label: 'Alcohol Category', type: 'toggle' }];
  const dietFields: FieldDef[] = [{ key: 'name', label: 'Dietary Type',  placeholder: 'e.g. Vegetarian' }, { key: 'label', label: 'Short Label', placeholder: 'Veg' }, { key: 'code', label: 'Code', placeholder: 'VEG' }];
  const unitFields: FieldDef[] = [{ key: 'name', label: 'Unit Name', placeholder: 'e.g. Bottle' }, { key: 'abbreviation', label: 'Abbreviation', placeholder: 'btl' }];

  const parseRow = (cells: string[]) => {
    if (sub === 'categories') {
      const name = (cells[0] || '').trim();
      return { id: uid(), name, description: cells[1] || '', color: cells[2] || '#888888', icon: (cells[3] || '').trim() || suggestIconForName(name, 'UtensilsCrossed'), isAlcohol: (cells[4] || '').toLowerCase() === 'true' ? 'true' : 'false' };
    }
    if (sub === 'dietary') return { id: uid(), name: cells[0] || '', label: cells[1] || '', code: cells[2] || '' };
    return { id: uid(), name: cells[0] || '', abbreviation: cells[1] || '' };
  };

  const handleImportComplete = async (rows: any[]) => {
    let result: { merged: any[]; imported: number; skipped: number };
    if (sub === 'categories') {
      result = deduplicateMerge(cats.items, rows);
      cats.setItems(result.merged);
    } else if (sub === 'dietary') {
      result = deduplicateMerge(diets.items, rows);
      diets.setItems(result.merged);
    } else {
      result = deduplicateMerge(units.items, rows);
      units.setItems(result.merged);
    }
    if (result.imported > 0) notifySuccess(`Imported ${result.imported} rows${result.skipped > 0 ? `, ${result.skipped} skipped (duplicates)` : ''}`);
    else if (result.skipped > 0) notifySuccess(`All ${result.skipped} items already exist — no duplicates created`);
    return { imported: result.imported, skipped: result.skipped };
  };

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="POS Configuration"
        description="Manage categories, dietary tags, and units used across the POS system."
        icon={Coffee}
        actions={
          <CSVActionBar
            addLabel={`Add ${sub === 'categories' ? 'Category' : sub === 'dietary' ? 'Dietary Tag' : 'Unit'}`}
            importTitle={csvConfig.importTitle}
            columns={csvConfig.columns}
            templateRows={csvConfig.templateRows}
            templateFilename={csvConfig.templateFilename}
            parseRow={parseRow}
            onImportComplete={handleImportComplete}
            onAdd={() => setModal({ type: sub === 'categories' ? 'cat' : sub === 'dietary' ? 'diet' : 'unit' })}
            onExport={() => {
              if (sub === 'categories') downloadCSV('pos-categories.csv', cats.items.map(({ id, ...r }) => r));
              else if (sub === 'dietary') downloadCSV('pos-dietary.csv', diets.items.map(({ id, ...r }) => r));
              else downloadCSV('pos-units.csv', units.items.map(({ id, ...r }) => r));
            }}
          />
        }
      />

      {/* Sub-tabs */}
      <div className="flex items-center gap-0 px-6 border-b border-border shrink-0">
        {subTabs.map(t => (
          <button key={t.key} onClick={() => setSub(t.key)}
            className={`px-4 py-2.5 text-[length:var(--text-sm)] font-[var(--font-weight-medium)] border-b-2 -mb-px transition-colors ${
              sub === t.key ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >{t.label}</button>
        ))}
      </div>

      <div className="flex-1 overflow-auto p-6">
        {sub === 'categories' && <DataTable columns={catCols}  data={cats.items}  getRowId={r => r.id} pageSize={10} emptyIcon={<Tag className="w-8 h-8 text-muted-foreground" />}      emptyTitle="No categories"   emptyDescription="Use Import CSV to upload categories, or add one manually." />}
        {sub === 'dietary'    && <DataTable columns={dietCols} data={diets.items} getRowId={r => r.id} pageSize={10} emptyIcon={<Sparkles className="w-8 h-8 text-muted-foreground" />}  emptyTitle="No dietary tags"  emptyDescription="Use Import CSV to upload dietary tags, or add one manually." />}
        {sub === 'units'      && <DataTable columns={unitCols} data={units.items} getRowId={r => r.id} pageSize={10} emptyIcon={<Package className="w-8 h-8 text-muted-foreground" />}   emptyTitle="No units"         emptyDescription="Use Import CSV to upload units, or add one manually." />}
      </div>

      {modal?.type === 'cat'  && <QuickModal title={modal.editing ? 'Edit Category'    : 'Add Category'}     fields={catFields}  initial={modal.editing} onSave={d => { modal.editing ? cats.update({...modal.editing,...d})  : cats.add({id:uid(),...d}  as POSCategory); notifySuccess('Saved'); }} onClose={() => setModal(null)} />}
      {modal?.type === 'diet' && <QuickModal title={modal.editing ? 'Edit Dietary Tag' : 'Add Dietary Tag'}  fields={dietFields} initial={modal.editing} onSave={d => { modal.editing ? diets.update({...modal.editing,...d}) : diets.add({id:uid(),...d} as POSDietary);  notifySuccess('Saved'); }} onClose={() => setModal(null)} />}
      {modal?.type === 'unit' && <QuickModal title={modal.editing ? 'Edit Unit'        : 'Add Unit'}         fields={unitFields} initial={modal.editing} onSave={d => { modal.editing ? units.update({...modal.editing,...d}) : units.add({id:uid(),...d} as POSUnit);     notifySuccess('Saved'); }} onClose={() => setModal(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 3 - Room Types
// ─────────────────────────────────────────────���────────────────────────────────
function RoomTypesSection() {
  const list  = useLocalList<RoomType>('admin_cfg_room_types', []);
  const [modal, setModal] = useState<{ editing?: RoomType } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name',        label: 'Room Type Name',        placeholder: 'e.g. Mixed Dorm' },
    { key: 'capacity',    label: 'Max Capacity (beds)',   placeholder: '8',   type: 'number' },
    { key: 'description', label: 'Description',           placeholder: 'Brief description' },
  ];

  const cols: DataTableColumn<RoomType>[] = [
    { key: 'name', header: 'Room Type', render: r => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
            <BedDouble className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</p>
            <p className="text-muted-foreground text-[length:var(--text-xs)]">{r.description}</p>
          </div>
        </div>
    )},
    { key: 'capacity', header: 'Capacity', align: 'center', render: r => <span className="font-[var(--font-weight-medium)] text-[length:var(--text-sm)]">{r.capacity} beds</span> },
    { key: 'actions',  header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Room type deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Room Types"
        description="Define room and bed type classifications available across properties."
        icon={BedDouble}
        actions={
          <CSVActionBar
            addLabel="Add Room Type"
            importTitle="Import Room Types"
            columns={adminRoomTypeCSVColumns}
            templateRows={adminRoomTypeCSVTemplateRows}
            templateFilename="room-types-template.csv"
            parseRow={(cells) => ({
              id: uid(),
              name: cells[0] || '',
              capacity: cells[1] || '2',
              description: cells[2] || '',
            })}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} room types${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} room types already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('room-types.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={10}
          emptyIcon={<BedDouble className="w-8 h-8 text-muted-foreground" />}
          emptyTitle="No room types defined"
          emptyDescription="Use Import CSV to upload room types, or add a type manually." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Room Type' : 'Add Room Type'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as RoomType); notifySuccess(modal.editing ? 'Room type updated' : 'Room type added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 4 - Amenities
// ──────────────────────────────────────────────────────────────────────────────
function AmenitiesSection() {
  const list  = useLocalList<Amenity>('admin_cfg_amenities', []);
  const [modal, setModal] = useState<{ editing?: Amenity } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name',        label: 'Amenity Name',             placeholder: 'e.g. Free WiFi' },
    { key: 'category',   label: 'Category',                  placeholder: 'e.g. Connectivity, Recreation' },
    { key: 'type',        label: 'Type',                      placeholder: 'Select type', options: ['room', 'public'] },
    { key: 'icon',        label: 'Icon',                      type: 'icon' },
    { key: 'description', label: 'Description',              placeholder: 'Brief description' },
  ];

  const catBadge: Record<string, string> = {
    'Connectivity': 'bg-info-bg text-info-foreground border-info-border',
    'Comfort':      'bg-muted text-muted-foreground border-border',
    'Recreation':   'bg-success-bg text-success-foreground border-success-border',
    'Transport':    'bg-warning-bg text-warning-foreground border-warning-border',
    'Food & Drink': 'bg-pink-bg text-pink-foreground border-pink-border',
    'Services':     'bg-purple-bg text-purple-foreground border-purple-border',
  };

  const cols: DataTableColumn<Amenity>[] = [
    { key: 'name', header: 'Amenity', render: r => {
        const AmenIcon = getIconByKey(r.icon, Sparkles);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-muted flex items-center justify-center flex-shrink-0">
              <AmenIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
              <code className="text-[length:var(--text-2xs)] text-muted-foreground">{r.icon}</code>
            </div>
          </div>
        );
    }},
    { key: 'category', header: 'Category / Type', render: r => {
        const cls = catBadge[r.category] || 'bg-muted text-muted-foreground border-border';
        const isPublic = r.type === 'public' || r.category?.toLowerCase() === 'public';
        const isRoom = r.type === 'room';
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] tracking-wider border ${cls}`}>{r.category}</span>
            {(isPublic || isRoom) && (
              <span className={`px-2 py-0.5 rounded-full text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] tracking-wider border ${
                isPublic
                  ? 'bg-purple-bg text-purple-foreground border-purple-border'
                  : 'bg-info-bg text-info-foreground border-info-border'
              }`}>{isPublic ? 'public' : 'room'}</span>
            )}
          </div>
        );
    }},
    { key: 'description', header: 'Description', hideOnMobile: true, render: r => <span className="text-muted-foreground text-[length:var(--text-sm)]">{r.description}</span> },
    { key: 'actions',     header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Amenity deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Amenities"
        description="Global amenity catalogue - assign these to room types and property profiles."
        icon={Sparkles}
        actions={
          <CSVActionBar
            addLabel="Add Amenity"
            importTitle="Import Amenities"
            columns={adminAmenityCSVColumns}
            templateRows={adminAmenityCSVTemplateRows}
            templateFilename="amenities-template.csv"
            parseRow={(cells) => {
              const name = (cells[0] || '').trim();
              return {
                id: uid(),
                name,
                category: cells[1] || 'General',
                icon: (cells[2] || '').trim() || suggestIconForName(name, 'Star'),
                description: cells[3] || '',
              };
            }}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} amenities${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} amenities already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('amenities.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={10}
          emptyIcon={<Sparkles className="w-8 h-8 text-muted-foreground" />}
          emptyTitle="No amenities defined"
          emptyDescription="Use Import CSV to upload amenities, or add one manually." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Amenity' : 'Add Amenity'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as Amenity); notifySuccess(modal.editing ? 'Amenity updated' : 'Amenity added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 5 - Manual Charges
// ──────────────────────────────────────────────────────────────────────────────
function ManualChargesSection() {
  const list  = useLocalList<ManualCharge>('admin_cfg_manual_charges', []);
  const [modal, setModal] = useState<{ editing?: ManualCharge } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name',          label: 'Charge Name',              placeholder: 'e.g. Late Checkout Fee' },
    { key: 'icon',          label: 'Icon',                      type: 'icon' },
    { key: 'category',      label: 'Category',                 placeholder: 'e.g. Accommodation, Services' },
  ];

  const cols: DataTableColumn<ManualCharge>[] = [
    { key: 'name', header: 'Charge', render: r => {
        const ChargeIcon = getIconByKey(r.icon, ReceiptText);
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[var(--radius-md)] bg-warning-bg border border-warning-border flex items-center justify-center flex-shrink-0">
              <ChargeIcon className="w-4 h-4 text-warning-foreground" />
            </div>
            <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
          </div>
        );
    }},
    { key: 'icon',          header: 'Icon',     render: r => {
        const IconComp = getIconByKey(r.icon);
        return (
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
              <IconComp className="w-3.5 h-3.5 text-primary" />
            </span>
            <code className="text-[length:var(--text-xs)] bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground">{r.icon}</code>
          </div>
        );
    }},
    { key: 'category',      header: 'Category', render: r => <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] tracking-wider">{r.category}</span> },
    { key: 'actions',       header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Charge deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Manual Charges"
        description="Configure charge types with icons and categories for quick billing."
        icon={IndianRupee}
        actions={
          <CSVActionBar
            addLabel="Add Charge"
            importTitle="Import Manual Charges"
            columns={adminManualChargeCSVColumns}
            templateRows={adminManualChargeCSVTemplateRows}
            templateFilename="manual-charges-template.csv"
            parseRow={(cells) => {
              const name = (cells[0] || '').trim();
              return {
                id: uid(),
                name,
                icon: (cells[1] || '').trim() || suggestIconForName(name, 'IndianRupee'),
                category: cells[2] || 'General',
              };
            }}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} charges${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} charges already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('manual-charges.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={10}
          emptyIcon={<IndianRupee className="w-8 h-8 text-muted-foreground" />}
          emptyTitle="No charges defined"
          emptyDescription="Use Import CSV to upload charges, or add one manually." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Charge' : 'Add Manual Charge'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as ManualCharge); notifySuccess(modal.editing ? 'Charge updated' : 'Charge added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 6 - ID Document Types
// ──────────────────────────────────────────────────────────────────────────────
function IdDocTypesSection() {
  const list  = useLocalList<IdDocType>('admin_cfg_id_types', []);
  const [modal, setModal] = useState<{ editing?: IdDocType } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name',        label: 'Document Name',   placeholder: 'e.g. Aadhaar Card' },
    { key: 'code',        label: 'Code', placeholder: 'e.g. AADHAAR' },
    { key: 'description', label: 'Description',      placeholder: 'Brief description of this ID type' },
  ];

  const cols: DataTableColumn<IdDocType>[] = [
    { key: 'name', header: 'Document Type', render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-info-bg border border-info-border flex items-center justify-center flex-shrink-0">
            <IdCard className="w-4 h-4 text-info-foreground" />
          </div>
          <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
        </div>
    )},
    { key: 'code', header: 'Code', render: r => (
        <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.code}</code>
    )},
    { key: 'description', header: 'Description', hideOnMobile: true, render: r => (
        <span className="text-muted-foreground text-[length:var(--text-sm)]">{r.description}</span>
    )},
    { key: 'actions', header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('ID type deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="ID Document Types"
        description="Configure which identity documents guests can present at check-in. These populate the ID Type dropdown across all guest flows."
        icon={IdCard}
        actions={
          <CSVActionBar
            addLabel="Add ID Type"
            importTitle="Import ID Document Types"
            columns={adminIdDocTypeCSVColumns}
            templateRows={adminIdDocTypeCSVTemplateRows}
            templateFilename="id-doc-types-template.csv"
            parseRow={(cells) => ({
              id: uid(),
              name: cells[0] || '',
              code: (cells[1] || ''),
              description: cells[2] || '',
            })}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} ID types${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} ID types already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('id-doc-types.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={15}
          emptyIcon={<IdCard className="w-8 h-8 text-muted-foreground" />}
          emptyTitle="No ID document types defined"
          emptyDescription="Use Import CSV to upload ID types, or add one manually." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit ID Type' : 'Add ID Document Type'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as IdDocType); notifySuccess(modal.editing ? 'ID type updated' : 'ID type added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 7 - Gender Options
// ──────────────────────────────────────────────────────────────────────────────
function GenderOptionsSection() {
  const list  = useLocalList<GenderOption>('admin_cfg_genders', []);
  const [modal, setModal] = useState<{ editing?: GenderOption } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name', label: 'Display Name', placeholder: 'e.g. Non-Binary' },
    { key: 'code', label: 'Code (lowercase)', placeholder: 'e.g. non-binary' },
  ];

  const cols: DataTableColumn<GenderOption>[] = [
    { key: 'name', header: 'Gender Option', render: r => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-purple-bg border border-purple-border flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-purple-foreground" />
          </div>
          <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
        </div>
    )},
    { key: 'code', header: 'Code', render: r => (
        <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.code}</code>
    )},
    { key: 'actions', header: '', align: 'right', render: r => (
        <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Gender option deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Gender Options"
        description="Configures the gender dropdown in guest profiles, add-guest forms, and check-in flows. Add or remove options to match your property's inclusivity policy."
        icon={UserCheck}
        actions={
          <CSVActionBar
            addLabel="Add Gender Option"
            importTitle="Import Gender Options"
            columns={adminGenderCSVColumns}
            templateRows={adminGenderCSVTemplateRows}
            templateFilename="gender-options-template.csv"
            parseRow={(cells) => ({
              id: uid(),
              name: cells[0] || '',
              code: (cells[1] || '').toLowerCase(),
            })}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} gender options${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} gender options already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('gender-options.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={15}
          emptyIcon={<UserCheck className="w-8 h-8 text-muted-foreground" />}
          emptyTitle="No gender options defined"
          emptyDescription="Use Import CSV to upload gender options, or add one manually." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Gender Option' : 'Add Gender Option'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as GenderOption); notifySuccess(modal.editing ? 'Gender option updated' : 'Gender option added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// ROOT - Tab shell (controlled by parent via activeTab prop)
// ──────────────────────────────────────────────────────────────────────────────
export type ConfigTab = 'staff-roles' | 'pos-config' | 'room-types' | 'amenities' | 'manual-charges' | 'id-types' | 'genders' | 'hk-config' | 'staff-depts' | 'shift-types' | 'permissions-map';

interface AdminConfigPageProps {
  activeTab?: ConfigTab;
  onTabChange?: (tab: ConfigTab) => void;
}

// Note: sidebar navigation groups moved to SuperAdminSidebar.tsx

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 8 - Housekeeping Config (Task Types + Priorities + Room Items)
// ──────────────────────────────────────────────────────────────────────────────
type HKSub = 'task-types' | 'priorities' | 'room-items';
function HKConfigSection() {
  const [sub, setSub] = useState<HKSub>('task-types');
  const taskTypes  = useLocalList<HKTaskType>('admin_cfg_hk_task_types', []);
  const priorities = useLocalList<HKPriority>('admin_cfg_hk_priorities', []);
  const roomItems  = useLocalList<HKRoomItem>('admin_cfg_hk_room_items', []);
  const [modal, setModal] = useState<{ editing?: any; type?: string } | null>(null);

  // CSV config per sub-tab
  const csvConfig = sub === 'task-types'
    ? { columns: adminHKTaskTypeCSVColumns, templateRows: adminHKTaskTypeCSVTemplateRows, templateFilename: 'hk-task-types-template.csv', importTitle: 'Import HK Task Types' }
    : sub === 'priorities'
    ? { columns: adminHKPriorityCSVColumns, templateRows: adminHKPriorityCSVTemplateRows, templateFilename: 'hk-priorities-template.csv', importTitle: 'Import HK Priorities' }
    : { columns: adminHKRoomItemCSVColumns, templateRows: adminHKRoomItemCSVTemplateRows, templateFilename: 'hk-room-items-template.csv', importTitle: 'Import HK Room Items' };

  const taskCols: DataTableColumn<HKTaskType>[] = [
    { key: 'name', header: 'Task Type', render: r => {
      const TaskIcon = getIconByKey(r.icon, Brush);
      return (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0 border ${r.colorScheme || 'bg-purple-bg border-purple-border'}`}>
            <TaskIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
            <p className="text-muted-foreground text-[length:var(--text-xs)]">{r.estimatedMinutes} min</p>
          </div>
        </div>
      );
    }},
    { key: 'code', header: 'Code', render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.code}</code> },
    { key: 'icon', header: 'Icon', render: r => {
      const IconComp = getIconByKey(r.icon);
      return (
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
            <IconComp className="w-3.5 h-3.5 text-primary" />
          </span>
          <code className="text-[length:var(--text-xs)] bg-muted px-1.5 py-0.5 rounded-sm text-muted-foreground">{r.icon}</code>
        </div>
      );
    }},
    { key: 'checklist', header: 'Checklist Items', render: r => (
      <div className="flex flex-wrap gap-1 max-w-md">
        {r.checklist.split(',').filter(Boolean).slice(0, 4).map((c, i) => (
          <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[length:var(--text-2xs)] font-[var(--font-weight-medium)]">{c.trim()}</span>
        ))}
        {r.checklist.split(',').length > 4 && <span className="px-2 py-0.5 text-muted-foreground text-[length:var(--text-2xs)]">+{r.checklist.split(',').length - 4} more</span>}
      </div>
    )},
    { key: 'actions', header: '', align: 'right', render: r => (
      <RowActions onEdit={() => setModal({ editing: r, type: 'task' })} onDelete={() => { taskTypes.remove(r.id); notifySuccess('Task type deleted'); }} />
    )},
  ];

  const priCols: DataTableColumn<HKPriority>[] = [
    { key: 'name', header: 'Priority', render: r => (
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-[var(--radius-full)] text-[length:var(--text-xs)] font-[var(--font-weight-bold)] border ${r.color}`}>
          {r.name}
        </span>
      </div>
    )},
    { key: 'code', header: 'Code', render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.code}</code> },
    { key: 'color', header: 'Colour Classes', render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono break-all">{r.color}</code> },
    { key: 'actions', header: '', align: 'right', render: r => (
      <RowActions onEdit={() => setModal({ editing: r, type: 'pri' })} onDelete={() => { priorities.remove(r.id); notifySuccess('Priority deleted'); }} />
    )},
  ];

  const taskFields: FieldDef[] = [
    { key: 'name', label: 'Task Type Name', placeholder: 'e.g. Checkout Clean' },
    { key: 'code', label: 'Code (kebab-case)', placeholder: 'e.g. checkout-clean' },
    { key: 'estimatedMinutes', label: 'Estimated Minutes', placeholder: '45', type: 'number' },
    { key: 'checklist', label: 'Checklist (comma-separated)', placeholder: 'Strip beds,Wipe surfaces,Vacuum floor' },
    { key: 'icon', label: 'Icon', type: 'icon' },
    { key: 'colorScheme', label: 'Colour Classes', placeholder: 'bg-info-bg text-info-foreground border-info-border' },
  ];
  const priFields: FieldDef[] = [
    { key: 'name', label: 'Priority Name', placeholder: 'e.g. Urgent' },
    { key: 'code', label: 'Code', placeholder: 'e.g. urgent' },
    { key: 'color', label: 'Tailwind Colour Classes', placeholder: 'bg-error-bg text-error-foreground border-error-border' },
  ];

  const roomItemCols: DataTableColumn<HKRoomItem>[] = [
    { key: 'name', header: 'Item Name', render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-info-bg border border-info-border flex items-center justify-center flex-shrink-0">
          <Package className="w-4 h-4 text-info-foreground" />
        </div>
        <div>
          <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
          <p className="text-muted-foreground text-[length:var(--text-xs)]">{r.category}</p>
        </div>
      </div>
    )},
    { key: 'parPerBed', header: 'PAR / Bed', render: r => <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)]">{r.parPerBed} {r.unit}</span> },
    { key: 'category', header: 'Category', render: r => <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-[var(--radius-full)] text-[length:var(--text-xs)] font-[var(--font-weight-medium)]">{r.category}</span> },
    { key: 'actions', header: '', align: 'right', render: r => (
      <RowActions onEdit={() => setModal({ editing: r, type: 'room-item' })} onDelete={() => { roomItems.remove(r.id); notifySuccess('Room item deleted'); }} />
    )},
  ];
  const roomItemFields: FieldDef[] = [
    { key: 'name', label: 'Item Name', placeholder: 'e.g. Bath Towel' },
    { key: 'category', label: 'Category', placeholder: 'Linen / Towels / Toiletries / Supplies' },
    { key: 'parPerBed', label: 'PAR per Bed (0 = per-room)', placeholder: '1', type: 'number' },
    { key: 'unit', label: 'Unit', placeholder: 'pcs' },
  ];

  const parseRow = (cells: string[]) => {
    if (sub === 'task-types') {
      const name = (cells[0] || '').trim();
      return { id: uid(), name, code: cells[1] || '', estimatedMinutes: cells[2] || '30', checklist: cells[3] || '', icon: (cells[4] || '').trim() || suggestIconForName(name, 'Brush'), colorScheme: cells[5] || 'bg-muted text-muted-foreground border-border' };
    }
    if (sub === 'priorities') return { id: uid(), name: cells[0] || '', code: cells[1] || '', color: cells[2] || 'bg-muted text-muted-foreground border-border' };
    return { id: uid(), name: cells[0] || '', category: cells[1] || 'Supplies', parPerBed: cells[2] || '1', unit: cells[3] || 'pcs' };
  };

  const handleImportComplete = async (rows: any[]) => {
    let result: { merged: any[]; imported: number; skipped: number };
    if (sub === 'task-types') {
      result = deduplicateMerge(taskTypes.items, rows);
      taskTypes.setItems(result.merged);
    } else if (sub === 'priorities') {
      result = deduplicateMerge(priorities.items, rows);
      priorities.setItems(result.merged);
    } else {
      result = deduplicateMerge(roomItems.items, rows);
      roomItems.setItems(result.merged);
    }
    if (result.imported > 0) notifySuccess(`Imported ${result.imported} rows${result.skipped > 0 ? `, ${result.skipped} skipped (duplicates)` : ''}`);
    else if (result.skipped > 0) notifySuccess(`All ${result.skipped} items already exist — no duplicates created`);
    return { imported: result.imported, skipped: result.skipped };
  };

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Housekeeping Config"
        description="Configure task types, priority levels, and default room items for linen & amenity tracking."
        icon={Brush}
        actions={
          <CSVActionBar
            addLabel={sub === 'task-types' ? 'Add Task Type' : sub === 'priorities' ? 'Add Priority' : 'Add Room Item'}
            importTitle={csvConfig.importTitle}
            columns={csvConfig.columns}
            templateRows={csvConfig.templateRows}
            templateFilename={csvConfig.templateFilename}
            parseRow={parseRow}
            onImportComplete={handleImportComplete}
            onAdd={() => setModal({ type: sub === 'task-types' ? 'task' : sub === 'priorities' ? 'pri' : 'room-item' })}
            onExport={() => {
              if (sub === 'task-types') downloadCSV('hk-task-types.csv', taskTypes.items.map(({ id, ...r }) => r));
              else if (sub === 'priorities') downloadCSV('hk-priorities.csv', priorities.items.map(({ id, ...r }) => r));
              else downloadCSV('hk-room-items.csv', roomItems.items.map(({ id, ...r }) => r));
            }}
          />
        }
      />
      <div className="flex items-center gap-0 px-6 border-b border-border shrink-0">
        {([['task-types', 'Task Types'], ['priorities', 'Priorities'], ['room-items', 'Room Items']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setSub(k)}
            className={`px-4 py-2.5 text-[length:var(--text-sm)] font-[var(--font-weight-medium)] border-b-2 -mb-px transition-colors ${
              sub === k ? 'border-accent text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >{l}</button>
        ))}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {sub === 'task-types' && <DataTable columns={taskCols} data={taskTypes.items} getRowId={r => r.id} pageSize={10} emptyIcon={<Brush className="w-8 h-8 text-muted-foreground" />} emptyTitle="No task types" emptyDescription="Add housekeeping task types with pre-built checklists." />}
        {sub === 'priorities' && <DataTable columns={priCols} data={priorities.items} getRowId={r => r.id} pageSize={10} emptyIcon={<AlertTriangle className="w-8 h-8 text-muted-foreground" />} emptyTitle="No priorities" emptyDescription="Add priority levels for housekeeping tasks." />}
        {sub === 'room-items' && <DataTable columns={roomItemCols} data={roomItems.items} getRowId={r => r.id} pageSize={10} emptyIcon={<Package className="w-8 h-8 text-muted-foreground" />} emptyTitle="No default room items" emptyDescription="Add default linen & amenity items that will be used when initialising room inventory." />}
      </div>
      {modal?.type === 'task' && <QuickModal title={modal.editing ? 'Edit Task Type' : 'Add Task Type'} fields={taskFields} initial={modal.editing} onSave={d => { modal.editing ? taskTypes.update({...modal.editing,...d}) : taskTypes.add({id:uid(),...d} as HKTaskType); notifySuccess('Saved'); }} onClose={() => setModal(null)} />}
      {modal?.type === 'pri'  && <QuickModal title={modal.editing ? 'Edit Priority' : 'Add Priority'} fields={priFields} initial={modal.editing} onSave={d => { modal.editing ? priorities.update({...modal.editing,...d}) : priorities.add({id:uid(),...d} as HKPriority); notifySuccess('Saved'); }} onClose={() => setModal(null)} />}
      {modal?.type === 'room-item' && <QuickModal title={modal.editing ? 'Edit Room Item' : 'Add Room Item'} fields={roomItemFields} initial={modal.editing} onSave={d => { modal.editing ? roomItems.update({...modal.editing,...d}) : roomItems.add({id:uid(),...d} as HKRoomItem); notifySuccess('Saved'); }} onClose={() => setModal(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 9 - Staff Departments
// ──────────────────────────────────────────────────────────────────────────────
function StaffDepartmentsSection() {
  const list = useLocalList<StaffDepartment>('admin_cfg_staff_depts', []);
  const [modal, setModal] = useState<{ editing?: StaffDepartment } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name', label: 'Department Name', placeholder: 'e.g. Front Desk' },
    { key: 'description', label: 'Description', placeholder: 'Brief description' },
    { key: 'roles', label: 'Roles (comma-separated)', placeholder: 'Receptionist,Night Auditor,Front Office Manager' },
  ];

  const cols: DataTableColumn<StaffDepartment>[] = [
    { key: 'name', header: 'Department', render: r => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[var(--radius-md)] bg-info-bg border border-info-border flex items-center justify-center flex-shrink-0">
          <Building className="w-4 h-4 text-info-foreground" />
        </div>
        <div>
          <span className="font-[var(--font-weight-semibold)] text-card-foreground text-[length:var(--text-sm)]">{r.name}</span>
          <p className="text-muted-foreground text-[length:var(--text-xs)]">{r.description}</p>
        </div>
      </div>
    )},
    { key: 'roles', header: 'Roles', render: r => (
      <div className="flex flex-wrap gap-1">
        {r.roles.split(',').filter(Boolean).map((role, i) => (
          <span key={i} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-[length:var(--text-2xs)] font-[var(--font-weight-medium)]">{role.trim()}</span>
        ))}
      </div>
    )},
    { key: 'actions', header: '', align: 'right', render: r => (
      <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Department deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader title="Staff Departments" description="Define departments and their associated roles. These populate dropdowns in Staff Management." icon={Building}
        actions={
          <CSVActionBar
            addLabel="Add Department"
            importTitle="Import Staff Departments"
            columns={adminStaffDeptCSVColumns}
            templateRows={adminStaffDeptCSVTemplateRows}
            templateFilename="staff-departments-template.csv"
            parseRow={(cells) => ({
              id: uid(),
              name: cells[0] || '',
              description: cells[1] || '',
              roles: cells[2] || '',
            })}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} departments${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} departments already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('staff-departments.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={10}
          emptyIcon={<Building className="w-8 h-8 text-muted-foreground" />} emptyTitle="No departments" emptyDescription="Add departments with associated roles." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Department' : 'Add Department'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as StaffDepartment); notifySuccess(modal.editing ? 'Department updated' : 'Department added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 10 - Shift Types
// ──────────────────────────────────────────────────────────────────────────────
function ShiftTypesSection() {
  const list = useLocalList<StaffShiftType>('admin_cfg_shift_types', []);
  const [modal, setModal] = useState<{ editing?: StaffShiftType } | null>(null);

  const fields: FieldDef[] = [
    { key: 'name', label: 'Shift Name', placeholder: 'e.g. Morning' },
    { key: 'code', label: 'Code', placeholder: 'e.g. morning' },
    { key: 'startTime', label: 'Start Time', placeholder: '06:00' },
    { key: 'endTime', label: 'End Time', placeholder: '14:00' },
    { key: 'color', label: 'Tailwind Colour Classes', placeholder: 'bg-warning-bg text-warning-foreground border-warning-border' },
  ];

  const cols: DataTableColumn<StaffShiftType>[] = [
    { key: 'name', header: 'Shift', render: r => (
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-[var(--radius-full)] text-[length:var(--text-xs)] font-[var(--font-weight-bold)] border ${r.color}`}>{r.name}</span>
      </div>
    )},
    { key: 'code', header: 'Code', render: r => <code className="text-[length:var(--text-xs)] bg-muted px-2 py-0.5 rounded font-mono">{r.code}</code> },
    { key: 'hours', header: 'Hours', render: r => <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)]">{r.startTime} &ndash; {r.endTime}</span> },
    { key: 'actions', header: '', align: 'right', render: r => (
      <RowActions onEdit={() => setModal({ editing: r })} onDelete={() => { list.remove(r.id); notifySuccess('Shift type deleted'); }} />
    )},
  ];

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader title="Shift Types" description="Configure shift schedules with start/end times. These populate the shift selector in Staff Management." icon={Clock}
        actions={
          <CSVActionBar
            addLabel="Add Shift Type"
            importTitle="Import Shift Types"
            columns={adminShiftTypeCSVColumns}
            templateRows={adminShiftTypeCSVTemplateRows}
            templateFilename="staff-shift-types-template.csv"
            parseRow={(cells) => ({
              id: uid(),
              name: cells[0] || '',
              code: cells[1] || '',
              startTime: cells[2] || '09:00',
              endTime: cells[3] || '17:00',
              color: cells[4] || 'bg-muted text-muted-foreground border-border',
            })}
            onImportComplete={async (rows) => {
              const { merged, imported, skipped } = deduplicateMerge(list.items, rows);
              list.setItems(merged);
              if (imported > 0) notifySuccess(`Imported ${imported} shift types${skipped > 0 ? `, ${skipped} skipped (duplicates)` : ''}`);
              else if (skipped > 0) notifySuccess(`All ${skipped} shift types already exist — no duplicates created`);
              return { imported, skipped };
            }}
            onAdd={() => setModal({})}
            onExport={() => downloadCSV('shift-types.csv', list.items.map(({ id, ...r }) => r))}
          />
        }
      />
      <div className="flex-1 overflow-auto p-6">
        <DataTable columns={cols} data={list.items} getRowId={r => r.id} pageSize={10}
          emptyIcon={<Clock className="w-8 h-8 text-muted-foreground" />} emptyTitle="No shift types" emptyDescription="Add shift types with start/end times." />
      </div>
      {modal && (
        <QuickModal title={modal.editing ? 'Edit Shift Type' : 'Add Shift Type'} fields={fields} initial={modal.editing}
          onSave={d => { modal.editing ? list.update({...modal.editing,...d}) : list.add({id:uid(),...d} as StaffShiftType); notifySuccess(modal.editing ? 'Shift type updated' : 'Shift type added'); }}
          onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// SECTION 11 - Permissions -> Module Features Map (read-only reference)
// ──────────────────────────────────────────────────────────────────────────────

/** Color classes for each permission key */
const PERM_BADGE: Record<string, string> = {
  all:          'bg-success-bg text-success-foreground border-success-border',
  bookings:     'bg-info-bg text-info-foreground border-info-border',
  guests:       'bg-info-bg text-info-foreground border-info-border',
  checkin:      'bg-info-bg text-info-foreground border-info-border',
  housekeeping: 'bg-purple-bg text-purple-foreground border-purple-border',
  pos:          'bg-muted text-card-foreground border-border',
  guest_menu:   'bg-muted text-card-foreground border-border',
  kds:          'bg-muted text-card-foreground border-border',
  reports:      'bg-warning-bg text-warning-foreground border-warning-border',
  settings:     'bg-muted text-muted-foreground border-border',
  inventory:    'bg-muted text-card-foreground border-border',
  ota:          'bg-info-bg text-info-foreground border-info-border',
  charges:      'bg-warning-bg text-warning-foreground border-warning-border',
  staff:        'bg-purple-bg text-purple-foreground border-purple-border',
};

/** Build a lookup: featureId -> { moduleName, featureName } */
function buildFeatureLookup(): Record<string, { moduleName: string; featureName: string; moduleIcon: string }> {
  const map: Record<string, { moduleName: string; featureName: string; moduleIcon: string }> = {};
  MODULE_DEFINITIONS.forEach(mod => {
    mod.features.forEach(feat => {
      map[feat.id] = { moduleName: mod.name, featureName: feat.name, moduleIcon: mod.iconKey };
    });
  });
  return map;
}

function PermissionsMapSection() {
  const featureLookup = buildFeatureLookup();
  const { staffRoles: platformRoles } = usePlatformConfig();

  // Reactive staff roles from platform config (re-renders when AdminConfig saves)
  const adminRoles = platformRoles as Array<{ id: string; name: string; permissions: string; description: string }>;

  const permEntries = Object.entries(PERMISSION_TO_MODULE_FEATURES);

  return (
    <div className="flex flex-col h-full">
      <AdminPageHeader
        title="Permissions -> Module Map"
        description="Read-only reference showing which permission keys grant access to which module features. Configured via Staff Roles permissions."
        icon={Shield}
      />

      <div className="flex-1 overflow-auto p-6 space-y-8">
        {/* Summary: which roles use which permissions */}
        {adminRoles.length > 0 && (
          <div>
            <h4 className="text-card-foreground mb-3">Role → Permission Summary</h4>
            <p className="text-muted-foreground text-[length:var(--text-sm)] mb-4">
              Each role's permissions (from Staff Roles tab) map to module features below.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {adminRoles.map(role => {
                const perms = role.permissions.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
                const isFullAccess = perms.includes('all');
                return (
                  <div key={role.id} className="bg-card border border-border rounded-[var(--radius-lg)] p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-[var(--radius-md)] bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Users className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-[var(--font-weight-semibold)] text-[length:var(--text-sm)] text-card-foreground">{role.name}</span>
                    </div>
                    {role.description && (
                      <p className="text-muted-foreground text-[length:var(--text-xs)] mb-2.5">{role.description}</p>
                    )}
                    <div className="flex flex-wrap gap-1">
                      {isFullAccess ? (
                        <span className="px-2 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] tracking-wider border bg-success-bg text-success-foreground border-success-border">
                          Full Access
                        </span>
                      ) : (
                        perms.map(p => {
                          const cls = PERM_BADGE[p] || 'bg-muted text-muted-foreground border-border';
                          return (
                            <span key={p} className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-bold)] uppercase tracking-wider border ${cls}`}>
                              {p}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Permission -> Feature detail table */}
        <div>
          <h4 className="text-card-foreground mb-3">Permission Key → Module Features</h4>
          <p className="text-muted-foreground text-[length:var(--text-sm)] mb-4">
            Each permission key (used in the Staff Roles permissions field) grants access to the module features listed below.
          </p>

          <div className="bg-card border border-border rounded-[var(--radius-xl)] overflow-hidden divide-y divide-border">
            {permEntries.map(([permKey, featureIds]) => {
              const cls = PERM_BADGE[permKey] || 'bg-muted text-muted-foreground border-border';
              const isWildcard = featureIds.includes('*');

              // Which roles use this permission
              const rolesUsingThis = adminRoles.filter(r =>
                r.permissions.split(',').map(p => p.trim().toLowerCase()).includes(permKey)
              );

              return (
                <div key={permKey} className="flex flex-col sm:flex-row sm:items-start gap-3 p-4">
                  {/* Left: permission key */}
                  <div className="flex items-center gap-3 sm:w-48 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-[var(--radius-sm)] text-[length:var(--text-xs)] font-[var(--font-weight-bold)] uppercase tracking-wider border ${cls}`}>
                      {permKey}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground hidden sm:block flex-shrink-0" />
                  </div>

                  {/* Right: features */}
                  <div className="flex-1 space-y-2">
                    {isWildcard ? (
                      <span className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-success-foreground">
                        All modules & features (full access)
                      </span>
                    ) : featureIds.length === 0 ? (
                      <span className="text-[length:var(--text-sm)] text-muted-foreground italic">
                        Always-on (no specific features gated)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {featureIds.map(fId => {
                          const info = featureLookup[fId];
                          return (
                            <span
                              key={fId}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-[var(--radius-md)] text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-card-foreground border border-border"
                              title={info ? `${info.moduleName} -> ${info.featureName}` : fId}
                            >
                              {info ? (
                                <>
                                  <span className="text-muted-foreground">{info.moduleName}</span>
                                  <span className="text-muted-foreground">/</span>
                                  <span>{info.featureName}</span>
                                </>
                              ) : fId}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Roles using this permission */}
                    {rolesUsingThis.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[length:var(--text-2xs)] text-muted-foreground uppercase tracking-wider font-[var(--font-weight-medium)]">Used by:</span>
                        {rolesUsingThis.map(r => (
                          <span key={r.id} className="px-1.5 py-0.5 rounded-[var(--radius-sm)] text-[length:var(--text-2xs)] font-[var(--font-weight-medium)] bg-primary/5 text-primary border border-primary/10">
                            {r.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Info callout */}
        <div className="flex items-start gap-3 p-4 bg-info-bg border border-info-border rounded-[var(--radius-lg)]">
          <Shield className="w-5 h-5 text-info-foreground flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-info-foreground mb-1">How this works</p>
            <p className="text-[length:var(--text-xs)] text-info-foreground/80 leading-relaxed">
              Each Staff Role has a comma-separated <code className="px-1 py-0.5 bg-info/10 rounded text-[length:var(--text-2xs)] font-mono">permissions</code> field (e.g. "bookings,guests,checkin").
              Each permission key maps to one or more Module Features from the module catalogue. When a property's module config is active,
              only features matching the user's role permissions are accessible. The "all" permission grants unrestricted access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminConfigPage({ activeTab = 'staff-roles', onTabChange }: AdminConfigPageProps) {
  const [localTab, setLocalTab] = useState<ConfigTab>(activeTab);
  const tab = onTabChange ? activeTab : localTab;
  const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'syncing' | 'synced' | 'error'>('idle');
  const hasLoadedRef = useRef(false);

  React.useEffect(() => { setLocalTab(activeTab); }, [activeTab]);

  // ─── Load platform config from backend on first mount ───
  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadFromBackend = async () => {
      setSyncStatus('loading');
      try {
        const result = await apiClient.fetch('/platform-config');
        // Diagnostic: log what backend returned so data loss can be traced
        const backendSections = result && typeof result === 'object'
          ? PLATFORM_CONFIG_LS_KEYS.filter(k => Array.isArray(result[k]) && result[k].length > 0).map(k => `${k.replace('admin_cfg_', '')}(${result[k].length})`).join(', ')
          : '(empty)';
        console.log(`[PlatformConfig] Backend returned: ${backendSections}`);
        if (result && typeof result === 'object') {
          let hydrated = 0;
          for (const key of PLATFORM_CONFIG_LS_KEYS) {
            if (Array.isArray(result[key]) && result[key].length > 0) {
              localStorage.setItem(key, JSON.stringify(result[key]));
              hydrated++;
            }
          }
          if (hydrated > 0) {
            console.log(`[PlatformConfig] Loaded ${hydrated} sections from backend`);
            // Fire hydrated event (NOT platform-config-changed) to update useLocalList
            // without triggering a re-sync back to the server
            window.dispatchEvent(new CustomEvent('platform-config-hydrated'));
          }

          // BUG FIX #5: Check for pending sync flag from previous session
          // This catches the case where a user made changes, the debounced sync hadn't
          // fired yet, and they closed the browser/navigated away.
          const pendingSyncDetected = hasPendingSync();

          // Recovery: push local → backend if there's a pending sync flag OR if
          // local has more data than backend (previous sync must have failed)
          const localConfig = collectPlatformConfig();
          const localKeyCount = Object.keys(localConfig).filter(k => (localConfig[k]?.length || 0) > 0).length;
          const backendKeyCount = PLATFORM_CONFIG_LS_KEYS.filter(k => Array.isArray(result[k]) && result[k].length > 0).length;

          if (pendingSyncDetected && localKeyCount > 0) {
            console.log(`[PlatformConfig] Pending sync flag from previous session — pushing ${localKeyCount} local sections to backend`);
            setSyncStatus('syncing');
            await doPlatformConfigSync();
            return; // sync-result event will set final status
          }

          if (localKeyCount > backendKeyCount) {
            console.log(`[PlatformConfig] Local has ${localKeyCount} sections vs backend ${backendKeyCount} — syncing local → backend`);
            setSyncStatus('syncing');
            await doPlatformConfigSync();
            return; // sync-result event will set final status
          }

          // Everything is in sync — clear any stale pending flag
          clearSyncPending();
        }
        setSyncStatus('synced');
      } catch (err) {
        console.warn('[PlatformConfig] Backend load failed, using localStorage:', err);
        setSyncStatus('error');
        // If load failed but we have local data, attempt recovery sync after delay
        const localConfig = collectPlatformConfig();
        const hasLocalData = Object.values(localConfig).some(v => v?.length > 0);
        if (hasLocalData) {
          console.log('[PlatformConfig] Backend load failed but local data exists — attempting recovery sync in 3s');
          setTimeout(() => doPlatformConfigSync(), 3000);
        }
      }
    };
    loadFromBackend();
  }, []);

  // ─── Listen for sync events to show status ───
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const handleChange = () => {
      setSyncStatus('syncing');
      // Fallback: if no sync-result event arrives within 15s, show error
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => setSyncStatus('error'), 15000);
    };
    const handleSyncResult = (e: Event) => {
      if (timer) clearTimeout(timer);
      const detail = (e as CustomEvent).detail;
      setSyncStatus(detail?.success ? 'synced' : 'error');
      // Auto-clear synced status after 5s, but keep error visible much longer (30s)
      // so the user actually sees it and can tap Retry
      if (detail?.success) {
        timer = setTimeout(() => setSyncStatus('idle'), 5000);
      } else {
        timer = setTimeout(() => setSyncStatus('idle'), 30000);
      }
    };
    window.addEventListener('platform-config-changed', handleChange);
    window.addEventListener('platform-config-sync-result', handleSyncResult);
    return () => {
      window.removeEventListener('platform-config-changed', handleChange);
      window.removeEventListener('platform-config-sync-result', handleSyncResult);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className="h-full bg-background overflow-hidden flex flex-col">
      {/* Sync status indicator */}
      {syncStatus !== 'idle' && (
        <div className="flex items-center justify-end px-4 py-1.5 border-b border-border bg-card">
          <div className="flex items-center gap-2 text-[length:var(--text-xs)]">
            {syncStatus === 'loading' && (
              <><span className="w-1.5 h-1.5 rounded-full bg-info animate-pulse" /><span className="text-muted-foreground">Loading config from server...</span></>
            )}
            {syncStatus === 'syncing' && (
              <><span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" /><span className="text-muted-foreground">Saving to server...</span></>
            )}
            {syncStatus === 'synced' && (
              <><span className="w-1.5 h-1.5 rounded-full bg-success" /><span className="text-muted-foreground">Synced to server</span></>
            )}
            {syncStatus === 'error' && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span className="text-error-foreground">Sync failed — data is only saved locally</span>
                <button
                  onClick={() => { setSyncStatus('syncing'); doPlatformConfigSync(); }}
                  className="ml-1 px-2 py-0.5 text-[length:var(--text-xs)] font-[var(--font-weight-medium)] text-error-foreground bg-error-bg border border-error-border rounded-[var(--radius-sm)] hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                  Retry Sync
                </button>
              </>
            )}
          </div>
        </div>
      )}
      {/* Content only - sidebar navigation is handled by the main SuperAdmin sidebar */}
      <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
        {tab === 'staff-roles'    && <StaffRolesSection />}
        {tab === 'staff-depts'    && <StaffDepartmentsSection />}
        {tab === 'shift-types'    && <ShiftTypesSection />}
        {tab === 'hk-config'      && <HKConfigSection />}
        {tab === 'pos-config'     && <POSConfigSection />}
        {tab === 'room-types'     && <RoomTypesSection />}
        {tab === 'amenities'      && <AmenitiesSection />}
        {tab === 'manual-charges' && <ManualChargesSection />}
        {tab === 'id-types'       && <IdDocTypesSection />}
        {tab === 'genders'        && <GenderOptionsSection />}
        {tab === 'permissions-map' && <PermissionsMapSection />}
      </div>
    </div>
  );
}
