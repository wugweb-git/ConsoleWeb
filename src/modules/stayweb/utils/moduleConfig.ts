/**
 * StayWeb Module System
 * ─────────────────────
 * Defines the canonical module/feature catalogue for the platform.
 * The Super Admin uses this to configure which modules are active per property.
 * The property app reads its config and gates navigation + pages accordingly.
 *
 * Default behaviour: if a property has NO module config saved, everything is
 * treated as ENABLED (full access) so existing properties are never broken.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { projectId, publicAnonKey } from './supabase/info';
import { supabase, getInitialSession } from './supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ModuleFeature {
  id: string;
  name: string;
  description: string;
  /** Pages/routes this feature gates (used in sidebar filtering) */
  pages: string[];
  /** If true, disabling this also disables related settings tabs */
  settingsTabs?: string[];
}

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  /** Lucide icon name (used as string key for rendering in UI) */
  iconKey: string;
  badge?: string;
  /** If false, the entire module and all its features are disabled */
  features: ModuleFeature[];
}

/** Runtime config stored per-tenant in KV: sys:modules:{tenantId} */
export interface TenantModuleConfig {
  [moduleId: string]: {
    enabled: boolean;
    features: { [featureId: string]: boolean };
  };
}

// ─── Module Catalogue ─────────────────────────────────────────────────────────

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    id: 'stay',
    name: 'Stay Management',
    description: 'Core accommodation — bookings, rooms, housekeeping, folios, and OTA distribution.',
    iconKey: 'BedDouble',
    badge: 'Core',
    features: [
      {
        id: 'bookings',
        name: 'Bookings',
        description: 'Create, edit, cancel, and track guest reservations.',
        pages: ['bookings', 'booking-calendar'],
      },
      {
        id: 'rooms',
        name: 'Room Inventory',
        description: 'Manage physical room/bed inventory, statuses, and assignments.',
        pages: ['rooms', 'room-availability', 'dorm-layout'],
        settingsTabs: ['rooms'],
      },
      {
        id: 'housekeeping',
        name: 'Housekeeping',
        description: 'Room cleaning schedule, status tracking, and task management.',
        pages: ['housekeeping'],
      },
      {
        id: 'folio',
        name: 'Folios & Invoices',
        description: 'Guest billing, folio management, A4 invoice and thermal receipt generation.',
        pages: ['invoice', 'folio'],
      },
      {
        id: 'meal-plans',
        name: 'Meal Plans',
        description: 'EP/CP/MAP/AP plans with seasonal enable/disable and per-guest assignment.',
        pages: [],
        settingsTabs: ['pricing'],
      },
      {
        id: 'flexible-pricing',
        name: 'Flexible Pricing',
        description: 'Dynamic pricing rules, seasonal rates, and weekend/event surcharges.',
        pages: [],
        settingsTabs: ['flexible-pricing'],
      },
      {
        id: 'checkout',
        name: 'Checkout & Settlement',
        description: 'Guest checkout flow with final folio review, balance settlement, and receipt print.',
        pages: [],
      },
      {
        id: 'ota',
        name: 'OTA Channels',
        description: 'Channel manager integration, OTA booking requests, and availability sync.',
        pages: ['ota-requests', 'ota-channels'],
        settingsTabs: ['ota-channels'],
      },
    ],
  },
  {
    id: 'pos',
    name: 'Point of Sale',
    description: 'Restaurant, bar, and retail billing with menu management, KOT, and digital guest menus.',
    iconKey: 'ShoppingCart',
    features: [
      {
        id: 'pos-billing',
        name: 'POS Billing',
        description: 'Live billing counter — open tabs, add items, process payments.',
        pages: ['pos'],
      },
      {
        id: 'pos-menu',
        name: 'Menu Management',
        description: 'Manage POS items, categories, dietary tags, and pricing.',
        pages: ['pos-menu', 'item-management', 'restaurant-menu'],
        settingsTabs: ['pos-menu'],
      },
      {
        id: 'guest-menu',
        name: 'Digital Guest Menu',
        description: 'QR-code accessible menu for guests to browse at their table or room.',
        pages: ['guest-menu'],
      },
      {
        id: 'pos-history',
        name: 'POS History',
        description: 'Historical POS bills, order records, and daily settlement reports.',
        pages: ['pos-history'],
      },
      {
        id: 'pos-reports',
        name: 'POS Analytics',
        description: 'Daily sales summary, category-wise breakdown, hourly trends, and payment analytics.',
        pages: ['pos-reports'],
      },
      {
        id: 'kitchen-display',
        name: 'Kitchen Display (KDS)',
        description: 'Real-time kitchen order tickets with Kanban board, item check-off, and elapsed time tracking.',
        pages: ['kitchen-display'],
      },
      {
        id: 'kot-printing',
        name: 'KOT Receipts',
        description: 'Kitchen order ticket printing on thermal printers with station routing and reprint support.',
        pages: [],
      },
      {
        id: 'pos-inventory',
        name: 'POS Inventory',
        description: 'Per-item stock tracking, low-stock alerts, restock flow, and stock movement log.',
        pages: ['pos-inventory'],
        settingsTabs: ['pos-inventory'],
      },
      {
        id: 'pos-day-closing',
        name: 'Day Closing',
        description: 'Cash drawer management, shift open/close, settlement reports, and daily reconciliation.',
        pages: ['pos-day-closing'],
        settingsTabs: ['pos-day-closing'],
      },
    ],
  },
  {
    id: 'guests',
    name: 'Guest Experience',
    description: 'Guest profiles, self check-in flows, QR management, and communication.',
    iconKey: 'Users',
    features: [
      {
        id: 'guest-profiles',
        name: 'Guest Profiles',
        description: 'Detailed guest history, preferences, loyalty tracking, and CRM.',
        pages: ['guests', 'guest-profile'],
      },
      {
        id: 'self-checkin',
        name: 'Self Check-in',
        description: 'Guest-facing QR-based check-in page with ID upload and form.',
        pages: ['guest-checkin'],
      },
      {
        id: 'qr-management',
        name: 'QR Management',
        description: 'Generate and manage QR codes for rooms, menus, and check-in.',
        pages: ['qr-management'],
      },
      {
        id: 'guest-communication',
        name: 'Guest Communication',
        description: 'Automated email notifications for booking confirmation, pre-arrival, checkout receipt via Brevo.',
        pages: [],
        settingsTabs: ['email-notifications'],
      },
    ],
  },
  {
    id: 'finance',
    name: 'Finance & Compliance',
    description: 'Payments, tax configuration, invoice settings, print templates, and property policies.',
    iconKey: 'IndianRupee',
    features: [
      {
        id: 'payments',
        name: 'Payments',
        description: 'Payment gateway integration, refund processing, and collection tracking.',
        pages: [],
        settingsTabs: ['payments'],
      },
      {
        id: 'tax-config',
        name: 'Tax Configuration',
        description: 'GST rates, registration numbers, bar/food tax split, and tax calculation rules.',
        pages: [],
        settingsTabs: ['tax'],
      },
      {
        id: 'invoice-config',
        name: 'Invoice & Print Templates',
        description: 'A4 invoice layout, thermal receipt template, KOT receipt format, and PDF settings.',
        pages: [],
        settingsTabs: ['invoices'],
      },
      {
        id: 'policies',
        name: 'Property Policies',
        description: 'Cancellation, check-in/check-out times, ID requirements, and house rules.',
        pages: [],
        settingsTabs: ['policies'],
      },
    ],
  },
  {
    id: 'charges',
    name: 'Manual Charges',
    description: 'Ad-hoc billing for extras like laundry, transport, tours, or damage fees.',
    iconKey: 'ReceiptText',
    features: [
      {
        id: 'manual-charge',
        name: 'Manual Charge Entry',
        description: 'Post one-off charges directly to guest folios from any screen with go-to-folio navigation.',
        pages: ['manual-charge'],
        settingsTabs: [],
      },
    ],
  },
  {
    id: 'reports',
    name: 'Reports & Analytics',
    description: 'Revenue, occupancy, channel analytics, and export capabilities.',
    iconKey: 'BarChart3',
    features: [
      {
        id: 'reports',
        name: 'Reports Dashboard',
        description: 'Standard operational reports — revenue, occupancy, check-ins/outs.',
        pages: ['reports', 'analytics'],
      },
      {
        id: 'booking-channels',
        name: 'Channel Analytics',
        description: 'Bookings and revenue broken down by OTA channel and direct.',
        pages: ['bookings-by-channel'],
      },
      {
        id: 'night-audit',
        name: 'Night Audit',
        description: 'End-of-day reconciliation report with room revenue, POS totals, and exceptions.',
        pages: ['reports'],
      },
    ],
  },
  {
    id: 'property',
    name: 'Property Setup',
    description: 'Property profile, gallery, amenities, and general configuration.',
    iconKey: 'Home',
    features: [
      {
        id: 'property-profile',
        name: 'Property Profile',
        description: 'Property name, address, contact details, branding, and OTA metadata.',
        pages: [],
        settingsTabs: ['property-profile'],
      },
      {
        id: 'gallery',
        name: 'Property Gallery',
        description: 'Upload and manage property images with WebP auto-optimization.',
        pages: ['gallery'],
        settingsTabs: ['gallery'],
      },
      {
        id: 'amenities',
        name: 'Amenities & Facilities',
        description: 'Room and public amenity catalogue with icon auto-mapping and OTA sync.',
        pages: [],
        settingsTabs: [],
      },
    ],
  },
  {
    id: 'staff',
    name: 'Staff Management',
    description: 'Staff directory, shift scheduling, departments, attendance, and access control.',
    iconKey: 'Users',
    features: [
      {
        id: 'staff-directory',
        name: 'Staff Directory',
        description: 'Full staff roster with roles, departments, contact details, and status management.',
        pages: ['staff-management'],
        settingsTabs: ['staff'],
      },
      {
        id: 'staff-shifts',
        name: 'Shift Scheduling',
        description: 'Schedule morning, afternoon, and night shifts with check-in/check-out tracking.',
        pages: ['staff-management'],
      },
      {
        id: 'staff-departments',
        name: 'Department Mapping',
        description: 'Department structure with role hierarchies and module access overview.',
        pages: ['staff-management'],
        settingsTabs: ['staff-management'],
      },
      {
        id: 'staff-roles',
        name: 'Roles & Permissions',
        description: 'Define staff roles with granular permission grants across all modules and features.',
        pages: [],
        settingsTabs: ['staff'],
      },
    ],
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'Email notifications, transactional messaging, and guest communication via Brevo.',
    iconKey: 'Mail',
    features: [
      {
        id: 'email-notifications',
        name: 'Email Notifications',
        description: 'Booking confirmation, pre-arrival info, checkout receipt, and custom trigger emails.',
        pages: [],
        settingsTabs: ['email-notifications'],
      },
      {
        id: 'invoice-email',
        name: 'Invoice Email',
        description: 'Send branded HTML invoices to guests directly from the folio page.',
        pages: [],
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Check if a feature is enabled, defaulting to true when config is absent */
export function isFeatureEnabled(
  config: TenantModuleConfig,
  moduleId: string,
  featureId?: string,
): boolean {
  const mod = config[moduleId];
  // No config → fully enabled (backward-compatible default)
  if (!mod) return true;
  if (!mod.enabled) return false;
  if (!featureId) return true;
  const feat = mod.features?.[featureId];
  // Feature not individually configured → enabled
  return feat === undefined ? true : feat;
}

/** Build the set of pages enabled for a given config */
export function buildEnabledPages(config: TenantModuleConfig): Set<string> {
  const pages = new Set<string>();

  // Always-on system pages (never gated)
  const alwaysOn = [
    'dashboard', 'settings', 'schema', 'demo', 'support',
    'prototype-demo', 'sitemap', 'component-specs', 'ui-kit',
    'navigation-guide', 'state-variants', 'asset-library', 'crud-test',
    'admin-dashboard', 'admin-crud', 'admin-backend', 'admin-communication',
    'admin-security', 'admin-database', 'admin-api-logs', 'admin-system-logs',
    'admin-performance', 'email-notifications', 'invoice-pdf',
  ];
  alwaysOn.forEach(p => pages.add(p));

  for (const mod of MODULE_DEFINITIONS) {
    for (const feat of mod.features) {
      if (isFeatureEnabled(config, mod.id, feat.id)) {
        feat.pages.forEach(p => pages.add(p));
      }
    }
  }

  return pages;
}

/** Build disabled settings tabs from config */
export function buildDisabledSettingsTabs(config: TenantModuleConfig): Set<string> {
  const disabled = new Set<string>();
  for (const mod of MODULE_DEFINITIONS) {
    for (const feat of mod.features) {
      if (!isFeatureEnabled(config, mod.id, feat.id)) {
        (feat.settingsTabs || []).forEach(t => disabled.add(t));
      }
    }
  }
  return disabled;
}

/** Build a default config where ALL modules/features are enabled */
export function buildDefaultConfig(): TenantModuleConfig {
  const config: TenantModuleConfig = {};
  for (const mod of MODULE_DEFINITIONS) {
    config[mod.id] = {
      enabled: true,
      features: Object.fromEntries(mod.features.map(f => [f.id, true])),
    };
  }
  return config;
}

// ─── Client-side hook: reads current property's module config from the API ────

const CACHE_KEY = 'sw_module_config_cache';
const CACHE_TS_KEY = 'sw_module_config_ts';
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes
const SUPER_ADMIN_EMAIL = 'admin@wugweb.com';

export function useMyModuleConfig(): {
  config: TenantModuleConfig;
  enabledPages: Set<string>;
  disabledSettingsTabs: Set<string>;
  loading: boolean;
  isEnabled: (moduleId: string, featureId?: string) => boolean;
  refresh: () => void;
} {
  const [config, setConfig] = useState<TenantModuleConfig>(() => {
    // Try to restore from session cache for instant render (if not stale)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      const ts = Number(sessionStorage.getItem(CACHE_TS_KEY) || '0');
      if (cached && (Date.now() - ts) < CACHE_MAX_AGE_MS) {
        return JSON.parse(cached);
      }
    } catch { /* ignore */ }
    return {};
  });
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  const fetchConfig = useCallback(async () => {
    try {
      // Super admin has no tenant — always give full access
      const { data: { session } } = await getInitialSession();
      const email = session?.user?.email?.toLowerCase();
      if (!email || email === SUPER_ADMIN_EMAIL) {
        const full = buildDefaultConfig();
        setConfig(full);
        setLoading(false);
        return;
      }

      const token = session?.access_token;
      if (!token) { setLoading(false); return; }

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ead79e26/my-modules`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.ok) {
        const json = await res.json();
        // Empty config → default all-enabled
        const loaded: TenantModuleConfig = (json.data && Object.keys(json.data).length > 0)
          ? json.data
          : {};
        setConfig(loaded);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(loaded));
          sessionStorage.setItem(CACHE_TS_KEY, String(Date.now()));
        } catch {}
      }
    } catch {
      // On any error default to all-enabled (fail open for existing properties)
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchConfig();
  }, [fetchConfig]);

  // Re-fetch when user returns to the tab (picks up super admin changes)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        // Check if cache is stale
        const ts = Number(sessionStorage.getItem(CACHE_TS_KEY) || '0');
        if ((Date.now() - ts) >= CACHE_MAX_AGE_MS) {
          fetchConfig();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [fetchConfig]);

  const enabledPages = buildEnabledPages(config);
  const disabledSettingsTabs = buildDisabledSettingsTabs(config);

  const isEnabled = (moduleId: string, featureId?: string) =>
    isFeatureEnabled(config, moduleId, featureId);

  const refresh = useCallback(() => {
    try {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TS_KEY);
    } catch {}
    fetchConfig();
  }, [fetchConfig]);

  return { config, enabledPages, disabledSettingsTabs, loading, isEnabled, refresh };
}