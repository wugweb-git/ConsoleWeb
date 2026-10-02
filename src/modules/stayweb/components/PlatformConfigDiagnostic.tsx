import { useState, useMemo } from 'react';
import {
  CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronRight,
  Database, ArrowRight, RefreshCw, ClipboardCheck, Layers, Settings
} from 'lucide-react';
import { usePlatformConfig } from '../utils/platformConfig';
import { usePropertyData } from '../contexts/PropertyDataContext';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DiagnosticResult {
  section: string;
  lsKey: string;
  platformCount: number;
  propertyCount: number;
  matchedCount: number;
  orphanedItems: string[];     // property items referencing values NOT in platform config
  unmappedPlatform: string[];  // platform items NOT referenced by any property item
  status: 'ok' | 'warning' | 'error';
  details: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readLSRaw(key: string): any[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

const STATUS_ICON = {
  ok: <CheckCircle className="w-5 h-5 text-success shrink-0" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning shrink-0" />,
  error: <XCircle className="w-5 h-5 text-error shrink-0" />,
};

const STATUS_BG = {
  ok: 'bg-success-bg border-success-border',
  warning: 'bg-warning-bg border-warning-border',
  error: 'bg-error-bg border-error-border',
};

// ─── Component ────────────────────────────────────────────────────────────────

export function PlatformConfigDiagnostic({ onBack, onNavigate }: { onBack?: () => void; onNavigate?: (page: string) => void }) {
  const platform = usePlatformConfig();
  const property = usePropertyData();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showRawLS, setShowRawLS] = useState(false);

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  // ─── Run diagnostics ─────────────────────────────────────────────────
  const diagnostics = useMemo<DiagnosticResult[]>(() => {
    const results: DiagnosticResult[] = [];

    // 1. POS Categories
    (() => {
      const platNames = new Set(platform.posCategories.map(c => c.name.toLowerCase().trim()));
      const propCatNames = new Set(property.posCategories.map((c: any) => (c.name || '').toLowerCase().trim()));
      const itemCats = new Set(property.posItems.map((i: any) => (i.category || '').toLowerCase().trim()));
      const allUsedCats = new Set([...propCatNames, ...itemCats]);
      const orphaned = [...allUsedCats].filter(c => c && !platNames.has(c));
      const unmapped = [...platNames].filter(c => !allUsedCats.has(c));
      results.push({
        section: 'POS Categories',
        lsKey: 'admin_cfg_pos_cats',
        platformCount: platform.posCategories.length,
        propertyCount: property.posCategories.length,
        matchedCount: [...allUsedCats].filter(c => platNames.has(c)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.posCategories.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} property categories not in platform config`
          : platform.posCategories.length === 0
          ? 'No platform categories configured'
          : 'All categories mapped',
      });
    })();

    // 2. POS Dietary Tags
    (() => {
      const platNames = new Set(platform.posDietary.map(d => d.name.toLowerCase().trim()));
      const propDiets = new Set(property.posDietaryInfo.map((d: any) => (d.name || '').toLowerCase().trim()));
      const itemDiets = new Set(property.posItems.flatMap((i: any) =>
        typeof i.dietaryFlag === 'string' ? [i.dietaryFlag.toLowerCase().trim()] : []
      ));
      const allUsed = new Set([...propDiets, ...itemDiets]);
      const orphaned = [...allUsed].filter(d => d && !platNames.has(d));
      const unmapped = [...platNames].filter(d => !allUsed.has(d));
      results.push({
        section: 'POS Dietary Tags',
        lsKey: 'admin_cfg_pos_dietary',
        platformCount: platform.posDietary.length,
        propertyCount: property.posDietaryInfo.length,
        matchedCount: [...allUsed].filter(d => platNames.has(d)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.posDietary.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} dietary tags not in platform config`
          : platform.posDietary.length === 0 ? 'No dietary tags configured' : 'All dietary tags mapped',
      });
    })();

    // 3. POS Units
    (() => {
      const platNames = new Set(platform.posUnits.map(u => u.name.toLowerCase().trim()));
      const propUnits = new Set(property.posUnits.map((u: any) => (u.name || '').toLowerCase().trim()));
      const itemUnits = new Set(property.posItems.flatMap((i: any) =>
        typeof i.unit === 'string' ? [i.unit.toLowerCase().trim()] : []
      ));
      const allUsed = new Set([...propUnits, ...itemUnits]);
      const orphaned = [...allUsed].filter(u => u && !platNames.has(u));
      const unmapped = [...platNames].filter(u => !allUsed.has(u));
      results.push({
        section: 'POS Units',
        lsKey: 'admin_cfg_pos_units',
        platformCount: platform.posUnits.length,
        propertyCount: property.posUnits.length,
        matchedCount: [...allUsed].filter(u => platNames.has(u)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.posUnits.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} units not in platform config`
          : platform.posUnits.length === 0 ? 'No units configured' : 'All units mapped',
      });
    })();

    // 4. Room Types
    (() => {
      const platNames = new Set(platform.roomTypes.map(r => r.name.toLowerCase().trim()));
      const propTypes = new Set(property.roomTypes.map((r: any) => (r.name || '').toLowerCase().trim()));
      const orphaned = [...propTypes].filter(t => t && !platNames.has(t));
      const unmapped = [...platNames].filter(t => !propTypes.has(t));
      results.push({
        section: 'Room Types',
        lsKey: 'admin_cfg_room_types',
        platformCount: platform.roomTypes.length,
        propertyCount: property.roomTypes.length,
        matchedCount: [...propTypes].filter(t => platNames.has(t)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.roomTypes.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} property room types not in platform config`
          : platform.roomTypes.length === 0 ? 'No room types configured' : 'All room types mapped',
      });
    })();

    // 5. Amenities
    (() => {
      const platNames = new Set(platform.amenities.map(a => a.name.toLowerCase().trim()));
      const propNames = new Set(property.amenities.map((a: any) => (a.name || '').toLowerCase().trim()));
      const orphaned = [...propNames].filter(a => a && !platNames.has(a));
      const unmapped = [...platNames].filter(a => !propNames.has(a));
      results.push({
        section: 'Amenities',
        lsKey: 'admin_cfg_amenities',
        platformCount: platform.amenities.length,
        propertyCount: property.amenities.length,
        matchedCount: [...propNames].filter(a => platNames.has(a)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.amenities.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} property amenities not in platform config`
          : platform.amenities.length === 0 ? 'No amenities configured' : 'All amenities mapped',
      });
    })();

    // 6. Manual Charges
    (() => {
      const platNames = new Set(platform.manualCharges.map(c => c.name.toLowerCase().trim()));
      const propCharges = new Set(property.manualCharges.map((c: any) => (c.name || c.label || '').toLowerCase().trim()));
      const orphaned = [...propCharges].filter(c => c && !platNames.has(c));
      const unmapped = [...platNames].filter(c => !propCharges.has(c));
      results.push({
        section: 'Manual Charges',
        lsKey: 'admin_cfg_manual_charges',
        platformCount: platform.manualCharges.length,
        propertyCount: property.manualCharges.length,
        matchedCount: [...propCharges].filter(c => platNames.has(c)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.manualCharges.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} charges not in platform config`
          : platform.manualCharges.length === 0 ? 'No charges configured' : 'All charges mapped',
      });
    })();

    // 7. ID Document Types
    (() => {
      results.push({
        section: 'ID Document Types',
        lsKey: 'admin_cfg_id_types',
        platformCount: platform.idDocTypes.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.idDocTypes.length === 0 ? 'error' : 'ok',
        details: platform.idDocTypes.length === 0 ? 'No ID types configured' : `${platform.idDocTypes.length} types available`,
      });
    })();

    // 8. Gender Options
    (() => {
      results.push({
        section: 'Gender Options',
        lsKey: 'admin_cfg_genders',
        platformCount: platform.genders.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.genders.length === 0 ? 'error' : 'ok',
        details: platform.genders.length === 0 ? 'No genders configured' : `${platform.genders.length} options available`,
      });
    })();

    // 9. HK Task Types
    (() => {
      results.push({
        section: 'HK Task Types',
        lsKey: 'admin_cfg_hk_task_types',
        platformCount: platform.hkTaskTypes.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.hkTaskTypes.length === 0 ? 'error' : 'ok',
        details: platform.hkTaskTypes.length === 0 ? 'No HK task types configured' : `${platform.hkTaskTypes.length} types available`,
      });
    })();

    // 10. HK Priorities
    (() => {
      results.push({
        section: 'HK Priorities',
        lsKey: 'admin_cfg_hk_priorities',
        platformCount: platform.hkPriorities.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.hkPriorities.length === 0 ? 'error' : 'ok',
        details: platform.hkPriorities.length === 0 ? 'No HK priorities configured' : `${platform.hkPriorities.length} priorities available`,
      });
    })();

    // 11. HK Room Items
    (() => {
      results.push({
        section: 'HK Room Items',
        lsKey: 'admin_cfg_hk_room_items',
        platformCount: platform.hkRoomItems.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.hkRoomItems.length === 0 ? 'error' : 'ok',
        details: platform.hkRoomItems.length === 0 ? 'No HK room items configured' : `${platform.hkRoomItems.length} items available`,
      });
    })();

    // 12. Staff Departments
    (() => {
      results.push({
        section: 'Staff Departments',
        lsKey: 'admin_cfg_staff_depts',
        platformCount: platform.staffDepartments.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.staffDepartments.length === 0 ? 'error' : 'ok',
        details: platform.staffDepartments.length === 0 ? 'No departments configured' : `${platform.staffDepartments.length} departments available`,
      });
    })();

    // 13. Staff Shift Types
    (() => {
      results.push({
        section: 'Staff Shift Types',
        lsKey: 'admin_cfg_shift_types',
        platformCount: platform.staffShiftTypes.length,
        propertyCount: 0,
        matchedCount: 0,
        orphanedItems: [],
        unmappedPlatform: [],
        status: platform.staffShiftTypes.length === 0 ? 'error' : 'ok',
        details: platform.staffShiftTypes.length === 0 ? 'No shift types configured' : `${platform.staffShiftTypes.length} shift types available`,
      });
    })();

    // 14. Staff Roles
    (() => {
      const platNames = new Set(platform.staffRoles.map(r => r.name.toLowerCase().trim()));
      const propRoles = new Set(property.staffRoles.map((r: any) => (r.name || r.role || '').toLowerCase().trim()));
      const orphaned = [...propRoles].filter(r => r && !platNames.has(r));
      const unmapped = [...platNames].filter(r => !propRoles.has(r));
      results.push({
        section: 'Staff Roles',
        lsKey: 'admin_cfg_staff_roles',
        platformCount: platform.staffRoles.length,
        propertyCount: property.staffRoles.length,
        matchedCount: [...propRoles].filter(r => platNames.has(r)).length,
        orphanedItems: orphaned,
        unmappedPlatform: unmapped,
        status: orphaned.length > 0 ? 'warning' : platform.staffRoles.length === 0 ? 'error' : 'ok',
        details: orphaned.length > 0
          ? `${orphaned.length} property roles not in platform config`
          : platform.staffRoles.length === 0 ? 'No roles configured' : 'All roles mapped',
      });
    })();

    return results;
  }, [platform, property]);

  // ─── Summary counts ──────────────────────────────────────────────────
  const okCount = diagnostics.filter(d => d.status === 'ok').length;
  const warnCount = diagnostics.filter(d => d.status === 'warning').length;
  const errCount = diagnostics.filter(d => d.status === 'error').length;
  const totalPlatform = diagnostics.reduce((s, d) => s + d.platformCount, 0);
  const totalOrphaned = diagnostics.reduce((s, d) => s + d.orphanedItems.length, 0);

  // ─── Raw localStorage snapshot ────────────────────────────────────────
  const LS_KEYS = [
    'admin_cfg_staff_roles', 'admin_cfg_pos_cats', 'admin_cfg_pos_dietary',
    'admin_cfg_pos_units', 'admin_cfg_room_types', 'admin_cfg_amenities',
    'admin_cfg_manual_charges', 'admin_cfg_id_types', 'admin_cfg_genders',
    'admin_cfg_hk_task_types', 'admin_cfg_hk_priorities', 'admin_cfg_staff_depts',
    'admin_cfg_shift_types', 'admin_cfg_hk_room_items',
  ];

  const rawData = useMemo(() => {
    return LS_KEYS.map(key => ({
      key,
      items: readLSRaw(key),
      rawSize: (localStorage.getItem(key) || '').length,
    }));
  }, [diagnostics]); // re-compute when diagnostics re-compute

  const needsReimport = totalOrphaned > 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-foreground">Platform Config Diagnostic</h3>
              <p className="text-[length:var(--text-sm)] text-muted-foreground">
                Verifies all 14 sections flow from Admin Config to property-level consumers
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-[length:var(--text-sm)] text-muted-foreground mb-1">Platform Items</p>
            <p className="text-[length:var(--text-2xl)] font-[var(--font-weight-bold)] text-foreground">{totalPlatform}</p>
            <p className="text-[length:var(--text-xs)] text-muted-foreground">across 14 sections</p>
          </div>
          <div className={`border rounded-lg p-4 ${okCount === 14 ? 'bg-success-bg border-success-border' : 'bg-card border-border'}`}>
            <p className="text-[length:var(--text-sm)] text-muted-foreground mb-1">Passing</p>
            <p className="text-[length:var(--text-2xl)] font-[var(--font-weight-bold)] text-success">{okCount}</p>
            <p className="text-[length:var(--text-xs)] text-muted-foreground">of 14 sections</p>
          </div>
          <div className={`border rounded-lg p-4 ${warnCount > 0 ? 'bg-warning-bg border-warning-border' : 'bg-card border-border'}`}>
            <p className="text-[length:var(--text-sm)] text-muted-foreground mb-1">Warnings</p>
            <p className="text-[length:var(--text-2xl)] font-[var(--font-weight-bold)] text-warning">{warnCount}</p>
            <p className="text-[length:var(--text-xs)] text-muted-foreground">orphaned refs</p>
          </div>
          <div className={`border rounded-lg p-4 ${errCount > 0 ? 'bg-error-bg border-error-border' : 'bg-card border-border'}`}>
            <p className="text-[length:var(--text-sm)] text-muted-foreground mb-1">Empty</p>
            <p className="text-[length:var(--text-2xl)] font-[var(--font-weight-bold)] text-error">{errCount}</p>
            <p className="text-[length:var(--text-xs)] text-muted-foreground">no config data</p>
          </div>
        </div>

        {/* Re-import verdict */}
        <div className={`border rounded-lg p-4 mb-6 ${needsReimport ? STATUS_BG.warning : STATUS_BG.ok}`}>
          <div className="flex items-start gap-3">
            {needsReimport ? STATUS_ICON.warning : STATUS_ICON.ok}
            <div>
              <p className="font-[var(--font-weight-semibold)] text-foreground">
                {needsReimport
                  ? `Re-import recommended: ${totalOrphaned} orphaned reference(s) found`
                  : 'No re-import needed — all property items map to current platform config'}
              </p>
              <p className="text-[length:var(--text-sm)] text-muted-foreground mt-1">
                {needsReimport
                  ? 'Some property-level items reference categories/types/tags that are no longer in platform config. These still work but won\'t appear in platform-derived dropdowns. Re-import or manually edit these items to fix.'
                  : 'Platform config is fully acknowledged and all property items use values that exist in the current platform catalogue. Dropdowns and filters are in sync.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section-by-section results */}
        <div className="space-y-2 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-foreground">Section-by-Section Results</h4>
            <button
              onClick={() => {
                const allExpanded = diagnostics.every(d => expanded[d.lsKey]);
                const next: Record<string, boolean> = {};
                diagnostics.forEach(d => { next[d.lsKey] = !allExpanded; });
                setExpanded(next);
              }}
              className="text-[length:var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {diagnostics.every(d => expanded[d.lsKey]) ? 'Collapse all' : 'Expand all'}
            </button>
          </div>

          {diagnostics.map(diag => {
            const isOpen = expanded[diag.lsKey];
            return (
              <div key={diag.lsKey} className="border border-border rounded-lg bg-card overflow-hidden">
                <button
                  onClick={() => toggle(diag.lsKey)}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors"
                >
                  {STATUS_ICON[diag.status]}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-[var(--font-weight-medium)] text-foreground whitespace-nowrap">{diag.section}</span>
                      <span className="text-[length:var(--text-xs)] text-muted-foreground font-mono">{diag.lsKey}</span>
                    </div>
                    <p className="text-[length:var(--text-sm)] text-muted-foreground">{diag.details}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground">
                        {diag.platformCount}
                      </span>
                      <span className="text-[length:var(--text-xs)] text-muted-foreground ml-1">platform</span>
                    </div>
                    {diag.propertyCount > 0 && (
                      <>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="text-right">
                          <span className="text-[length:var(--text-sm)] font-[var(--font-weight-semibold)] text-foreground">
                            {diag.propertyCount}
                          </span>
                          <span className="text-[length:var(--text-xs)] text-muted-foreground ml-1">property</span>
                        </div>
                      </>
                    )}
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Platform items */}
                      <div>
                        <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-foreground mb-2 flex items-center gap-1.5">
                          <Database className="w-3.5 h-3.5" /> Platform Config ({diag.platformCount})
                        </p>
                        {diag.platformCount === 0 ? (
                          <p className="text-[length:var(--text-sm)] text-muted-foreground italic">
                            No items in localStorage
                          </p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {readLSRaw(diag.lsKey).map((item: any, idx: number) => (
                              <span
                                key={item.id || idx}
                                className="inline-flex items-center px-2.5 py-1 rounded-md text-[length:var(--text-xs)] bg-card border border-border text-foreground"
                              >
                                {item.name || item.label || item.code || JSON.stringify(item).slice(0, 30)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Orphaned / Unmapped */}
                      <div>
                        {diag.orphanedItems.length > 0 && (
                          <div className="mb-3">
                            <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-warning-foreground mb-2 flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" /> Orphaned in Property ({diag.orphanedItems.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {diag.orphanedItems.map((name, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[length:var(--text-xs)] bg-warning-bg border border-warning-border text-warning-foreground"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                            <p className="text-[length:var(--text-xs)] text-muted-foreground mt-1.5">
                              These exist at property level but not in platform config. Items using these will still display but the values won't appear in platform-derived dropdowns.
                            </p>
                          </div>
                        )}

                        {diag.unmappedPlatform.length > 0 && (
                          <div>
                            <p className="text-[length:var(--text-sm)] font-[var(--font-weight-medium)] text-info-foreground mb-2 flex items-center gap-1.5">
                              <Layers className="w-3.5 h-3.5" /> Available but Unused ({diag.unmappedPlatform.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {diag.unmappedPlatform.map((name, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[length:var(--text-xs)] bg-info-bg border border-info-border text-info-foreground"
                                >
                                  {name}
                                </span>
                              ))}
                            </div>
                            <p className="text-[length:var(--text-xs)] text-muted-foreground mt-1.5">
                              Platform config provides these but no property items use them yet. They'll appear in dropdowns for new items.
                            </p>
                          </div>
                        )}

                        {diag.orphanedItems.length === 0 && diag.unmappedPlatform.length === 0 && diag.propertyCount === 0 && (
                          <p className="text-[length:var(--text-sm)] text-muted-foreground italic">
                            Catalogue-only section (no property-level mapping needed)
                          </p>
                        )}

                        {diag.orphanedItems.length === 0 && diag.unmappedPlatform.length === 0 && diag.propertyCount > 0 && (
                          <p className="text-[length:var(--text-sm)] text-success-foreground flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Full match — all property items map to platform config
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pipeline Visualization */}
        <div className="border border-border rounded-lg bg-card p-5 mb-6">
          <h4 className="text-foreground mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-muted-foreground" />
            Sync Pipeline Status
          </h4>
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 text-[length:var(--text-sm)]">
            {[
              { label: 'AdminConfigPage', sub: 'useLocalList + persist()', icon: '1' },
              { label: 'localStorage', sub: `14 admin_cfg_* keys`, icon: '2' },
              { label: 'schedulePlatformConfigSync()', sub: 'debounce + collect', icon: '3' },
              { label: 'Server PUT', sub: 'merge + verify read-back', icon: '4' },
              { label: 'usePlatformConfig()', sub: '13 consumer components', icon: '5' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-muted/50 border border-border rounded-lg p-3 text-center">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-[length:var(--text-xs)] font-[var(--font-weight-bold)] flex items-center justify-center mx-auto mb-1.5">
                    {step.icon}
                  </div>
                  <p className="font-[var(--font-weight-medium)] text-foreground whitespace-nowrap">{step.label}</p>
                  <p className="text-[length:var(--text-xs)] text-muted-foreground">{step.sub}</p>
                </div>
                {idx < 4 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 hidden md:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-[length:var(--text-sm)]">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Event listeners: <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[length:var(--text-xs)]">platform-config-changed</code> + <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-[length:var(--text-xs)]">storage</code> (cross-tab)
            </span>
          </div>
        </div>

        {/* Raw localStorage Toggle */}
        <div className="border border-border rounded-lg bg-card overflow-hidden mb-8">
          <button
            onClick={() => setShowRawLS(!showRawLS)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <Database className="w-5 h-5 text-muted-foreground" />
            <span className="flex-1 font-[var(--font-weight-medium)] text-foreground">Raw localStorage Snapshot</span>
            {showRawLS ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </button>
          {showRawLS && (
            <div className="border-t border-border p-4 space-y-3 max-h-96 overflow-y-auto">
              {rawData.map(({ key, items, rawSize }) => (
                <div key={key} className="flex items-start gap-3">
                  <code className="text-[length:var(--text-xs)] text-muted-foreground font-mono min-w-[200px] shrink-0 pt-0.5">{key}</code>
                  <div className="flex-1">
                    {items.length === 0 ? (
                      <span className="text-[length:var(--text-xs)] text-error italic">EMPTY</span>
                    ) : (
                      <span className="text-[length:var(--text-xs)] text-foreground">
                        {items.length} items ({rawSize} bytes)
                        <span className="text-muted-foreground ml-2">
                          [{items.map((i: any) => i.name || i.code || i.id).join(', ')}]
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}