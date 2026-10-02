import { useState } from 'react';
import { Palette, Box, Database, Zap, Code, CheckCircle, Type, Layers, Grid3X3, Sun, Plus, Check } from 'lucide-react';
import { Badge } from './Badge';

/* ─── Component Registry ─────────────────────────────────────────────────── */
interface ComponentRegistryEntry {
  name: string;
  category: 'UI Elements' | 'Display' | 'Data Display' | 'Actions' | 'Navigation' | 'Feedback' | 'Layout' | 'Modals';
  file: string;
  variants: string[];
  props: string[];
  usage: string;
  designTokens: string[];
}

const COMPONENT_REGISTRY: ComponentRegistryEntry[] = [
  {
    name: 'Badge',
    category: 'UI Elements',
    file: '/components/Badge.tsx',
    variants: ['success', 'warning', 'error', 'neutral', 'primary', 'info'],
    props: ['variant', 'children', 'className', 'pulse', 'interactive'],
    usage: '<Badge variant="success">Active</Badge>',
    designTokens: ['bg-success-bg', 'bg-warning-bg', 'bg-error-bg', 'bg-info-bg'],
  },
  {
    name: 'DataTable',
    category: 'Data Display',
    file: '/components/ui/DataTable.tsx',
    variants: ['default', 'compact'],
    props: ['columns', 'data', 'keyField', 'searchFields', 'onRowClick', 'emptyMessage'],
    usage: '<DataTable columns={cols} data={rows} keyField="id" />',
    designTokens: ['bg-card', 'hover:bg-muted', 'border-border'],
  },
  {
    name: 'ActionBar',
    category: 'Actions',
    file: '/components/ui/ActionBar.tsx',
    variants: ['with-import', 'with-export', 'with-add'],
    props: ['addLabel', 'onAdd', 'onImport', 'onExport', 'children'],
    usage: '<ActionBar addLabel="Add Room" onAdd={fn} onImport={fn} onExport={fn} />',
    designTokens: ['bg-primary', 'text-primary-foreground', 'border-border'],
  },
  {
    name: 'CSVImportModal',
    category: 'Modals',
    file: '/components/ui/CSVImportModal.tsx',
    variants: ['default'],
    props: ['isOpen', 'onClose', 'onImport', 'templateColumns', 'templateRows', 'entityName'],
    usage: '<CSVImportModal isOpen={open} onClose={fn} entityName="Guests" />',
    designTokens: ['bg-card', 'border-border', 'bg-primary'],
  },
  {
    name: 'AlertBanner',
    category: 'Feedback',
    file: '/components/ui/AlertBanner.tsx',
    variants: ['success', 'error', 'warning', 'info'],
    props: ['variant', 'title', 'description', 'icon', 'action'],
    usage: '<AlertBanner variant="error" title="Failed" description="..." />',
    designTokens: ['bg-error-bg', 'bg-warning-bg', 'bg-success-bg', 'bg-info-bg'],
  },
  {
    name: 'AdminPageHeader',
    category: 'Layout',
    file: '/components/ui/AdminPageHeader.tsx',
    variants: ['default', 'with-badge', 'with-actions'],
    props: ['title', 'description', 'icon', 'badge', 'actions'],
    usage: '<AdminPageHeader title="Dashboard" description="..." icon={Activity} />',
    designTokens: ['bg-background', 'border-border', 'text-card-foreground'],
  },
  {
    name: 'StatCard',
    category: 'Display',
    file: '/components/ui/StatCard.tsx',
    variants: ['default', 'with-icon'],
    props: ['label', 'value', 'icon', 'valueColor', 'className'],
    usage: '<StatCard label="Revenue" value="₹45,000" icon={IndianRupee} />',
    designTokens: ['bg-card', 'border-border', 'bg-accent/10'],
  },
  {
    name: 'ConfirmDialog',
    category: 'Feedback',
    file: '/components/ConfirmDialog.tsx',
    variants: ['default', 'destructive', 'warning'],
    props: ['open', 'title', 'description', 'confirmLabel', 'variant', 'onConfirm', 'onCancel'],
    usage: '<ConfirmDialog open={true} title="Delete?" variant="destructive" />',
    designTokens: ['bg-card', 'bg-destructive', 'text-destructive-foreground'],
  },
  {
    name: 'InteractiveSidebar',
    category: 'Navigation',
    file: '/components/InteractiveSidebar.tsx',
    variants: ['desktop', 'mobile'],
    props: ['isOpen', 'onClose', 'currentPage', 'onNavigate'],
    usage: '<InteractiveSidebar isOpen={true} currentPage="dashboard" />',
    designTokens: ['bg-sidebar', 'bg-sidebar-primary', 'text-sidebar-foreground'],
  },
  {
    name: 'StayWebLogo',
    category: 'UI Elements',
    file: '/components/ui/StayWebLogo.tsx',
    variants: ['default'],
    props: ['className'],
    usage: '<StayWebLogo className="w-8 h-8" />',
    designTokens: ['--accent'],
  },
  {
    name: 'DietaryIcon',
    category: 'UI Elements',
    file: '/components/ui/DietaryIcon.tsx',
    variants: ['veg', 'nonveg', 'egg', 'vegan', 'halal', 'kosher', 'jain', 'gluten-free'],
    props: ['type', 'className'],
    usage: '<DietaryIcon type="veg" className="w-4 h-4" />',
    designTokens: ['--dietary-veg', '--dietary-nonveg', '--dietary-egg'],
  },
];

/* ─── API Endpoints Reference ─────────────────────────────────────────── */
interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  description: string;
  payload: string;
}

const API_ENDPOINTS: APIEndpoint[] = [
  { method: 'POST', endpoint: '/api/bookings', description: 'Create new booking', payload: '{ guest_id, room_id?, bed_id?, checkin_date, checkout_date, meal_plan_id?, nightly_rate }' },
  { method: 'GET', endpoint: '/api/bookings?status=checked_in', description: 'List bookings with filters', payload: 'Query params: status, checkin_date, room_type' },
  { method: 'POST', endpoint: '/api/folios/:id/items', description: 'Add charge to folio', payload: '{ item_type, description, quantity, unit_amount }' },
  { method: 'POST', endpoint: '/api/pos/orders', description: 'Create POS order', payload: '{ outlet, folio_id?, items: [{ pos_item_id, quantity }] }' },
  { method: 'GET', endpoint: '/api/rooms/available', description: 'Check room/bed availability', payload: 'Query params: date, room_type, gender' },
  { method: 'POST', endpoint: '/admin/map-tenant', description: 'Map user to tenant', payload: '{ email, tenant_id }' },
  { method: 'GET', endpoint: '/admin/all-tenants', description: 'List all KV entries (SuperAdmin)', payload: 'No body — returns array of { key, value }' },
  { method: 'GET', endpoint: '/admin/kv-audit', description: 'Audit KV store health', payload: 'No body — returns audit report' },
  { method: 'POST', endpoint: '/admin/purge-orphans', description: 'Delete orphaned KV rows', payload: 'No body — returns { purged: number }' },
];

/* ─── Tab Type ────────────────────────────────────────────────────────── */
type DesignTab = 'tokens' | 'components' | 'api' | 'implementation';

const TABS: Array<{ id: DesignTab; label: string; icon: typeof Palette }> = [
  { id: 'tokens', label: 'Design Tokens', icon: Palette },
  { id: 'components', label: 'Component Registry', icon: Box },
  { id: 'api', label: 'API Reference', icon: Database },
  { id: 'implementation', label: 'Implementation', icon: Code },
];

/* ─── Main Component ──────────────────────────────────────────────────── */
interface DesignSystemPageProps {
  onBack: () => void;
}

export function DesignSystemPage({ onBack }: DesignSystemPageProps) {
  const [activeTab, setActiveTab] = useState<DesignTab>('tokens');

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Bar */}
      <div className="px-6 pt-5 pb-0 shrink-0">
        <h3 className="text-card-foreground mb-1">Design System</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Live token previews, component registry, and API reference — all sourced from <code className="px-1.5 py-0.5 bg-muted rounded-[var(--radius-sm)] text-xs">/styles/globals.css</code>
        </p>
        <div className="flex gap-1 border-b border-border">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-[var(--font-weight-medium)] border-b-2 transition-colors -mb-px ${
                  activeTab === tab.id
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {activeTab === 'tokens' && <TokensTab />}
          {activeTab === 'components' && <ComponentsTab />}
          {activeTab === 'api' && <APITab />}
          {activeTab === 'implementation' && <ImplementationTab />}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  TOKENS TAB                                                            */
/* ═══════════════════════════════════════════════════════════════════════ */
function TokensTab() {
  return (
    <>
      {/* Color Palette */}
      <section>
        <SectionHeader icon={Palette} title="Color Palette" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Primary', bg: 'bg-primary', fg: 'text-primary-foreground', token: '--primary' },
            { name: 'Accent', bg: 'bg-accent', fg: 'text-accent-foreground', token: '--accent' },
            { name: 'Card', bg: 'bg-card border border-border', fg: 'text-card-foreground', token: '--card' },
            { name: 'Muted', bg: 'bg-muted', fg: 'text-muted-foreground', token: '--muted' },
            { name: 'Destructive', bg: 'bg-destructive', fg: 'text-destructive-foreground', token: '--destructive' },
            { name: 'Success', bg: 'bg-success', fg: 'text-primary-foreground', token: '--success' },
            { name: 'Warning', bg: 'bg-warning', fg: 'text-primary-foreground', token: '--warning' },
            { name: 'Info', bg: 'bg-info', fg: 'text-primary-foreground', token: '--info' },
          ].map(c => (
            <div key={c.name} className="space-y-2">
              <div className={`h-20 ${c.bg} rounded-[var(--radius-md)] flex items-center justify-center`}>
                <span className={c.fg}>{c.name}</span>
              </div>
              <p className="text-xs text-muted-foreground"><code>{c.token}</code></p>
            </div>
          ))}
        </div>

        {/* Semantic Status Colors */}
        <h4 className="text-card-foreground mt-6 mb-3">Semantic Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Success', bg: 'bg-success-bg', text: 'text-success-foreground', border: 'border-success-border' },
            { name: 'Warning', bg: 'bg-warning-bg', text: 'text-warning-foreground', border: 'border-warning-border' },
            { name: 'Error', bg: 'bg-error-bg', text: 'text-error-foreground', border: 'border-error-border' },
            { name: 'Info', bg: 'bg-info-bg', text: 'text-info-foreground', border: 'border-info-border' },
          ].map(s => (
            <div key={s.name} className={`${s.bg} ${s.text} border ${s.border} rounded-[var(--radius-md)] p-4 text-sm font-[var(--font-weight-medium)]`}>
              {s.name} Banner
            </div>
          ))}
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionHeader icon={Type} title="Typography" />
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
          {[
            { el: 'h1', desc: 'Page Titles', scale: 'var(--text-3xl)' },
            { el: 'h2', desc: 'Section Headers', scale: 'var(--text-2xl)' },
            { el: 'h3', desc: 'Card Titles', scale: 'var(--text-xl)' },
            { el: 'h4', desc: 'Subsections', scale: 'var(--text-lg)' },
            { el: 'p', desc: 'Body Text', scale: 'var(--text-base)' },
            { el: 'label', desc: 'Labels & Captions', scale: 'var(--text-sm)' },
          ].map(t => (
            <div key={t.el} className="flex items-baseline justify-between border-b border-border pb-3 last:border-0 last:pb-0">
              <div>
                {t.el === 'h1' && <h1 className="text-foreground">{t.el} - {t.desc}</h1>}
                {t.el === 'h2' && <h2 className="text-foreground">{t.el} - {t.desc}</h2>}
                {t.el === 'h3' && <h3 className="text-foreground">{t.el} - {t.desc}</h3>}
                {t.el === 'h4' && <h4 className="text-foreground">{t.el} - {t.desc}</h4>}
                {t.el === 'p' && <p className="text-foreground">{t.el} - {t.desc}</p>}
                {t.el === 'label' && <label className="text-foreground">{t.el} - {t.desc}</label>}
              </div>
              <code className="text-xs text-muted-foreground">{t.scale}</code>
            </div>
          ))}
          <p className="text-xs text-muted-foreground mt-2">
            Font: <strong>Inter Tight</strong> (all UI) | <strong>Courier New</strong> (thermal receipts only)
          </p>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <SectionHeader icon={Layers} title="Buttons" />
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
          <div>
            <p className="text-sm text-muted-foreground mb-3">Primary</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors">Primary</button>
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] hover:bg-primary/90 transition-colors flex items-center gap-2"><Plus className="w-4 h-4" />With Icon</button>
              <button className="px-5 py-2.5 bg-primary text-primary-foreground rounded-[var(--radius-md)] opacity-50 cursor-not-allowed" disabled>Disabled</button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">Accent</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-accent text-accent-foreground rounded-[var(--radius-md)] hover:bg-accent/90 transition-colors">Accent</button>
              <button className="px-5 py-2.5 bg-accent text-accent-foreground rounded-[var(--radius-md)] hover:bg-accent/90 transition-colors flex items-center gap-2"><Check className="w-4 h-4" />With Icon</button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">Outline / Ghost</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 border-2 border-primary text-primary rounded-[var(--radius-md)] hover:bg-primary/10 transition-colors">Outline</button>
              <button className="px-5 py-2.5 border border-border text-card-foreground rounded-[var(--radius-md)] hover:bg-muted transition-colors">Default</button>
              <button className="px-5 py-2.5 text-primary hover:bg-primary/10 rounded-[var(--radius-md)] transition-colors">Ghost</button>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-3">Destructive</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-5 py-2.5 bg-destructive text-destructive-foreground rounded-[var(--radius-md)] hover:bg-destructive/90 transition-colors">Delete</button>
              <button className="px-5 py-2.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-[var(--radius-md)] hover:bg-destructive hover:text-destructive-foreground transition-colors">Soft Delete</button>
            </div>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <SectionHeader icon={Layers} title="Badges" />
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
          <div className="flex flex-wrap gap-3">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="success" pulse>Pulse</Badge>
            <Badge variant="primary" interactive>Interactive</Badge>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section>
        <SectionHeader icon={Grid3X3} title="Cards" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h4 className="text-card-foreground mb-2">Basic Card</h4>
            <p className="text-sm text-muted-foreground">Standard card with border</p>
          </div>
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <h4 className="text-card-foreground mb-2">Hover Card</h4>
            <p className="text-sm text-muted-foreground">Card with hover shadow</p>
          </div>
          <div className="bg-card border border-border rounded-[var(--radius-lg)] overflow-hidden">
            <div className="bg-primary p-4"><h4 className="text-primary-foreground">Primary Header</h4></div>
            <div className="p-6"><p className="text-sm text-muted-foreground">Header variant</p></div>
          </div>
        </div>
      </section>

      {/* Form Elements */}
      <section>
        <SectionHeader icon={Layers} title="Form Elements" />
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6 space-y-5">
          <div>
            <label className="block text-card-foreground mb-1.5">Text Input</label>
            <input type="text" placeholder="Enter text..." className="w-full px-3 py-2.5 border border-border rounded-[var(--radius-md)] focus:border-ring focus:ring-2 focus:ring-ring/50 outline-none transition-all bg-input-background" />
          </div>
          <div>
            <label className="block text-card-foreground mb-1.5">Select</label>
            <select className="w-full px-3 py-2.5 border border-border rounded-[var(--radius-md)] focus:border-ring focus:ring-2 focus:ring-ring/50 outline-none transition-all bg-input-background">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
          <div>
            <label className="block text-card-foreground mb-1.5">Textarea</label>
            <textarea rows={3} placeholder="Enter longer text..." className="w-full px-3 py-2.5 border border-border rounded-[var(--radius-md)] focus:border-ring focus:ring-2 focus:ring-ring/50 outline-none transition-all bg-input-background resize-none" />
          </div>
        </div>
      </section>

      {/* Spacing & Radius */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <SectionHeader icon={Grid3X3} title="Border Radius" />
            <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'SM', cls: 'rounded-sm', token: '--radius-sm' },
                  { name: 'MD', cls: 'rounded-md', token: '--radius-md' },
                  { name: 'LG', cls: 'rounded-lg', token: '--radius-lg' },
                  { name: 'XL', cls: 'rounded-xl', token: '--radius-xl' },
                  { name: '2XL', cls: 'rounded-2xl', token: '--radius-2xl' },
                  { name: 'Full', cls: 'rounded-full', token: '--radius-full' },
                ].map(r => (
                  <div key={r.name} className="text-center">
                    <div className={`w-16 h-16 bg-primary mx-auto mb-2 ${r.cls}`} />
                    <p className="text-xs text-card-foreground font-[var(--font-weight-medium)]">{r.name}</p>
                    <code className="text-2xs text-muted-foreground">{r.token}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <SectionHeader icon={Sun} title="Shadow Elevations" />
            <div className="space-y-3">
              {[
                { name: 'Small', cls: 'shadow-sm', token: '--elevation-sm' },
                { name: 'Medium', cls: 'shadow-md', token: '--elevation-md' },
                { name: 'Large', cls: 'shadow-lg', token: '--elevation-lg' },
                { name: 'XL', cls: 'shadow-xl', token: '--elevation-xl' },
                { name: '2XL', cls: 'shadow-2xl', token: '--elevation-2xl' },
              ].map(s => (
                <div key={s.name} className={`bg-card border border-border rounded-[var(--radius-md)] p-4 ${s.cls}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-card-foreground font-[var(--font-weight-medium)]">{s.name}</span>
                    <code className="text-xs text-muted-foreground">{s.token}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  COMPONENTS TAB                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */
function ComponentsTab() {
  const categories = [...new Set(COMPONENT_REGISTRY.map(c => c.category))];

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-muted-foreground">
          {COMPONENT_REGISTRY.length} components registered across {categories.length} categories
        </p>
      </div>

      {categories.map(cat => (
        <section key={cat}>
          <h4 className="text-card-foreground mb-3">{cat}</h4>
          <div className="space-y-3">
            {COMPONENT_REGISTRY.filter(c => c.category === cat).map(comp => (
              <div key={comp.name} className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0">
                      <Box className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-card-foreground">{comp.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{comp.file}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {comp.variants.map(v => (
                      <span key={v} className="px-2 py-0.5 bg-accent/15 text-accent text-xs rounded-[var(--radius-sm)]">{v}</span>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Props</p>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.props.map(p => (
                        <code key={p} className="px-2 py-0.5 bg-muted border border-border rounded-[var(--radius-sm)] text-xs text-primary">{p}</code>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Usage</p>
                    <pre className="p-3 bg-muted border border-border rounded-[var(--radius-md)] overflow-x-auto">
                      <code className="text-xs text-primary">{comp.usage}</code>
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1.5">Design Tokens</p>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.designTokens.map(t => (
                        <span key={t} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  API TAB                                                               */
/* ═══════════════════════════════════════════════════════════════════════ */
function APITab() {
  return (
    <section>
      <SectionHeader icon={Database} title="API Endpoints" />
      <div className="space-y-3">
        {API_ENDPOINTS.map((ep, i) => (
          <div key={i} className="bg-card border border-border rounded-[var(--radius-lg)] p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-xs font-[var(--font-weight-medium)] ${
                ep.method === 'GET' ? 'bg-accent/20 text-accent'
                  : ep.method === 'DELETE' ? 'bg-destructive/20 text-destructive'
                  : 'bg-primary/20 text-primary'
              }`}>
                {ep.method}
              </span>
              <code className="text-sm text-card-foreground flex-1">{ep.endpoint}</code>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{ep.description}</p>
            <pre className="p-3 bg-muted border border-border rounded-[var(--radius-md)] overflow-x-auto">
              <code className="text-xs text-primary">{ep.payload}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  IMPLEMENTATION TAB                                                    */
/* ═══════════════════════════════════════════════════════════════════════ */
function ImplementationTab() {
  return (
    <>
      <section>
        <SectionHeader icon={Code} title="Implementation Notes" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h4 className="text-card-foreground mb-3">Frontend Stack</h4>
            <ul className="space-y-2">
              {[
                'React 18+ with TypeScript',
                'Tailwind CSS 4.0 with design tokens',
                'PropertyDataContext for state management',
                'React Router for navigation',
                'Lucide React for icons',
                'Sonner via notify.ts for toasts',
                'ConfirmDialog for confirmations',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
            <h4 className="text-card-foreground mb-3">Backend Integration</h4>
            <ul className="space-y-2">
              {[
                'Supabase KV store (kv_store_ead79e26)',
                'Hono web server (Edge Functions)',
                'localStorage-based auth token fallback',
                'superAdminFetch() for admin API calls',
                'Row-Level Security ready',
                'Supabase Storage for documents',
              ].map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader icon={Zap} title="Conventions" />
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-card-foreground mb-3">Do</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'Use CSS variables from globals.css (bg-primary, text-foreground, etc.)',
                  'Use notifySuccess/notifyError from /utils/notify.ts',
                  'Use ConfirmDialog instead of window.confirm()',
                  'Use DataTable + ActionBar + CSVImportModal for list pages',
                  'Label buttons "Import .CSV" / "Export .CSV"',
                  'Use "Inter Tight" font only (Courier New for receipts)',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-card-foreground mb-3">Don't</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {[
                  'No hardcoded Tailwind colors (text-blue-500, bg-red-100)',
                  'No alert() or window.confirm()',
                  'No direct sonner imports — use notify.ts',
                  'No inline styles (except 3 exempt showcase files)',
                  'No auto-seed or mock data on load',
                  'No pushing data to Supabase storage',
                ].map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0 text-center">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Shared helpers ──────────────────────────────────────────────────── */
function SectionHeader({ icon: Icon, title }: { icon: typeof Palette; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 bg-accent/10 rounded-[var(--radius-md)] flex items-center justify-center">
        <Icon className="w-4 h-4 text-accent" />
      </div>
      <h4 className="text-card-foreground">{title}</h4>
    </div>
  );
}