/**
 * usePlatformConfig
 * Reads the Super Admin's Platform Config catalogue from localStorage
 * (written by AdminConfigPage) and exposes it as typed data to any
 * property-admin component that needs to merge catalogue items into
 * its own add/edit flows.
 */
import { useState, useEffect } from 'react';
import { ICON_REGISTRY, suggestIconForName, getIconByKey } from './iconMapping';
import { HelpCircle } from 'lucide-react';

export interface PlatformAmenity {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  type?: 'room' | 'public';
}

export interface PlatformPOSCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon?: string;
  isAlcohol?: boolean;
}

export interface PlatformPOSDietary {
  id: string;
  name: string;
  label: string;
  code: string;
  icon?: string;
}

export interface PlatformPOSUnit {
  id: string;
  name: string;
  abbreviation: string;
  icon?: string;
}

export interface PlatformRoomType {
  id: string;
  name: string;
  capacity: string;
  description: string;
  icon?: string;
}

export interface PlatformManualCharge {
  id: string;
  name: string;
  icon: string;
  category: string;
}

/** Identity document type managed by Super Admin (ID Doc Types section) */
export interface PlatformIdDocType {
  id: string;
  name: string;       // Display label: "Aadhaar Card"
  code: string;       // Machine code:  "AADHAAR"
  description: string;
  icon?: string;
}

/** Gender option managed by Super Admin (Gender Options section) */
export interface PlatformGenderOption {
  id: string;
  name: string;  // Display label: "Non-Binary"
  code: string;  // Value stored on guest record: "non-binary"
  icon?: string;
}

/** Housekeeping task type managed by Super Admin */
export interface PlatformHKTaskType {
  id: string;
  name: string;
  code: string;
  estimatedMinutes: string;
  checklist: string;  // comma-separated checklist items
  icon: string;       // Lucide icon key, e.g. 'Brush', 'Star', 'Repeat'
  colorScheme: string; // Tailwind colour classes, e.g. 'bg-info-bg text-info-foreground border-info-border'
}

/** Housekeeping priority managed by Super Admin */
export interface PlatformHKPriority {
  id: string;
  name: string;
  code: string;
  color: string;  // Tailwind classes
  icon?: string;
}

/** Staff department managed by Super Admin */
export interface PlatformStaffDepartment {
  id: string;
  name: string;
  description: string;
  roles: string;  // comma-separated role names
  icon?: string;
}

/** Staff shift type managed by Super Admin */
export interface PlatformStaffShiftType {
  id: string;
  name: string;
  code: string;
  startTime: string;
  endTime: string;
  color: string;  // Tailwind classes
  icon?: string;
}

/** Staff role managed by Super Admin (Staff Roles section) */
export interface PlatformStaffRole {
  id: string;
  name: string;
  permissions: string;  // comma-separated permission keys
  description: string;
  icon?: string;
}

/** Default room item type managed by Super Admin (HK Config → Room Items) */
export interface PlatformHKRoomItem {
  id: string;
  name: string;
  category: string;   // Linen, Towels, Toiletries, Supplies
  parPerBed: string;   // stored as string in localStorage, parsed to number
  unit: string;
  icon?: string;
}

// ─── Generic localStorage reader ──────────────────────────────────────────────

function readLS<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

// ─── Icon auto-heal: ensure every item has a valid icon ───────────────────────
// If the stored icon key doesn't resolve in ICON_REGISTRY, auto-suggest one
// based on the item's name so the UI never shows a blank/fallback icon.

function healIcons<T extends { name: string; icon?: string }>(items: T[]): T[] {
  return items.map(item => {
    if (!item.icon) return { ...item, icon: suggestIconForName(item.name) };
    // Exact match in registry (PascalCase) — keep as-is
    if (ICON_REGISTRY[item.icon]) return item;
    // Case-insensitive / kebab-case lookup — resolve to valid key if possible
    const resolved = getIconByKey(item.icon);
    if (resolved !== HelpCircle) return item; // getIconByKey found it, keep original key (renders fine)
    // No match at all — auto-suggest from name
    return { ...item, icon: suggestIconForName(item.name) };
  });
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePlatformConfig() {
  // A version counter that forces re-reads when AdminConfigPage persists changes
  const [, setVersion] = useState(0);

  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('platform-config-changed', handler);
    window.addEventListener('platform-config-hydrated', handler); // backend → localStorage hydration
    window.addEventListener('storage', handler); // cross-tab sync
    return () => {
      window.removeEventListener('platform-config-changed', handler);
      window.removeEventListener('platform-config-hydrated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // Read fresh values on every render triggered by version change
  // healIcons ensures every item has a valid icon key resolved from its name
  const amenities        = healIcons(readLS<PlatformAmenity>        ('admin_cfg_amenities'));
  const posCategories    = healIcons(readLS<PlatformPOSCategory>    ('admin_cfg_pos_cats'));
  const posDietary       = healIcons(readLS<PlatformPOSDietary>     ('admin_cfg_pos_dietary'));
  const posUnits         = healIcons(readLS<PlatformPOSUnit>        ('admin_cfg_pos_units'));
  const roomTypes        = healIcons(readLS<PlatformRoomType>       ('admin_cfg_room_types'));
  const manualCharges    = healIcons(readLS<PlatformManualCharge>   ('admin_cfg_manual_charges'));
  const idDocTypes       = healIcons(readLS<PlatformIdDocType>      ('admin_cfg_id_types'));
  const genders          = healIcons(readLS<PlatformGenderOption>   ('admin_cfg_genders'));
  const hkTaskTypes      = healIcons(readLS<PlatformHKTaskType>     ('admin_cfg_hk_task_types'));
  const hkPriorities     = healIcons(readLS<PlatformHKPriority>    ('admin_cfg_hk_priorities'));
  const staffDepartments = healIcons(readLS<PlatformStaffDepartment>('admin_cfg_staff_depts'));
  const staffShiftTypes  = healIcons(readLS<PlatformStaffShiftType> ('admin_cfg_shift_types'));
  const staffRoles       = healIcons(readLS<PlatformStaffRole>      ('admin_cfg_staff_roles'));
  const hkRoomItems      = healIcons(readLS<PlatformHKRoomItem>     ('admin_cfg_hk_room_items'));

  return { amenities, posCategories, posDietary, posUnits, roomTypes, manualCharges, idDocTypes, genders, hkTaskTypes, hkPriorities, staffDepartments, staffShiftTypes, staffRoles, hkRoomItems };
}

/** Merge two string arrays, deduplicating case-insensitively */
export function mergeUnique(a: string[], b: string[]): string[] {
  const seen = new Set(a.map(x => x.toLowerCase()));
  const extras = b.filter(x => !seen.has(x.toLowerCase()));
  return [...a, ...extras];
}

/**
 * Maps AdminConfig staff role permission keys to moduleConfig feature IDs.
 * Use this to bridge between Super Admin role permissions (e.g. 'bookings', 'pos')
 * and the MODULE_DEFINITIONS feature catalogue in moduleConfig.ts.
 */
export const PERMISSION_TO_MODULE_FEATURES: Record<string, string[]> = {
  all:           ['*'], // Full access
  bookings:      ['bookings', 'rooms', 'folio', 'flexible-pricing'],
  guests:        ['guest-profiles', 'self-checkin', 'qr-management'],
  checkin:       ['self-checkin', 'bookings'],
  housekeeping:  ['housekeeping'],
  pos:           ['pos-billing', 'pos-menu', 'pos-history', 'pos-reports', 'pos-inventory', 'pos-day-closing'],
  guest_menu:    ['guest-menu'],
  kds:           ['kitchen-display'],
  reports:       ['reports', 'booking-channels'],
  settings:      [], // Settings is always-on per moduleConfig
  inventory:     ['pos-inventory'],
  ota:           ['ota'],
  charges:       ['manual-charge'],
  staff:         ['staff-directory', 'staff-shifts', 'staff-departments'],
  finance:       ['payments', 'tax-config', 'invoice-config', 'policies'],
  payments:      ['payments'],
  tax:           ['tax-config'],
  invoices:      ['invoice-config', 'folio'],
  policies:      ['policies'],
};

/**
 * Given a role's comma-separated permissions string from AdminConfig,
 * returns the set of moduleConfig feature IDs they can access.
 */
export function getFeatureIdsForPermissions(permissions: string): Set<string> {
  const perms = permissions.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);
  const features = new Set<string>();
  for (const perm of perms) {
    const mapped = PERMISSION_TO_MODULE_FEATURES[perm];
    if (mapped) mapped.forEach(f => features.add(f));
  }
  return features;
}

/**
 * Get roles for a specific department from platform config.
 * Returns role names that belong to the given department.
 */
export function getRolesForDepartment(departmentName: string): string[] {
  try {
    const depts = JSON.parse(localStorage.getItem('admin_cfg_staff_depts') || '[]') as PlatformStaffDepartment[];
    const match = depts.find(d => d.name.toLowerCase() === departmentName.toLowerCase());
    if (match) return match.roles.split(',').map(r => r.trim()).filter(Boolean);
  } catch { /* ignore */ }
  return [];
}

/**
 * Check whether a category name is marked as alcohol in Platform Config.
 * Looks up the category by name (case-insensitive) and checks its `isAlcohol` flag.
 * Pass the `posCategories` array from `usePlatformConfig()`.
 */
export function isAlcoholCategory(categoryName: string, posCategories: PlatformPOSCategory[]): boolean {
  const norm = (categoryName || '').toLowerCase().trim();
  if (!norm) return false;
  const match = posCategories.find(c => c.name.toLowerCase().trim() === norm);
  return match?.isAlcohol === true;
}