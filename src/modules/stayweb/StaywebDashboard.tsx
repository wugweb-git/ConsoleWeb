import React from 'react';
import {
  Activity, Terminal, Database, Zap, ShieldAlert,
  Layers, Users, BedDouble, Sparkles, IndianRupee, Coffee, ChevronRight, Building2,
  MessageSquare, Radio, Shield, Brush, Clock, Building, IdCard, UserCheck
} from 'lucide-react';
import type { ConfigTab } from './components/AdminConfigPage';

// Moved from SuperAdminView (dashboard section). Navigation maps to module routes.
type AdminPage = string;

const quickLinks = [
  { icon: Building2,    label: 'Properties',      page: 'admin-properties'    as AdminPage },
  { icon: MessageSquare,label: 'Communication',   page: 'admin-communication' as AdminPage },
  { icon: Radio,        label: 'OTA Simulator',   page: 'admin-ota-simulator' as AdminPage },
  { icon: Terminal,     label: 'System Logs',     page: 'admin-system-logs'   as AdminPage },
  { icon: Activity,     label: 'API Logs',        page: 'admin-api-logs'      as AdminPage },
  { icon: Database,     label: 'Database',        page: 'admin-database'      as AdminPage },
  { icon: Zap,          label: 'Performance',     page: 'admin-performance'   as AdminPage },
  { icon: ShieldAlert,  label: 'Security',        page: 'admin-security'      as AdminPage },
  { icon: Layers,       label: 'Platform Config', page: 'admin-config'        as AdminPage },
];

const configShortcuts: { icon: React.ElementType; label: string; sub: string; tab: ConfigTab }[] = [
  { icon: Users,       label: 'Staff Roles',      sub: 'Define roles & permissions',        tab: 'staff-roles'     },
  { icon: Building,    label: 'Departments',       sub: 'Team structure & role mapping',     tab: 'staff-depts'     },
  { icon: Clock,       label: 'Shift Types',       sub: 'Work shift schedules',              tab: 'shift-types'     },
  { icon: Shield,      label: 'Permissions Map',   sub: 'Role to module feature mapping',   tab: 'permissions-map' },
  { icon: Coffee,      label: 'POS Config',        sub: 'Categories, dietary tags, units',   tab: 'pos-config'      },
  { icon: BedDouble,   label: 'Room Types',        sub: 'Room & bed type catalogue',         tab: 'room-types'      },
  { icon: Sparkles,    label: 'Amenities',          sub: 'Global amenity library',           tab: 'amenities'       },
  { icon: IndianRupee, label: 'Manual Charges',    sub: 'Charge presets with icons',         tab: 'manual-charges'  },
  { icon: IdCard,      label: 'ID Doc Types',       sub: 'Identity document types',          tab: 'id-types'        },
  { icon: UserCheck,   label: 'Gender Options',     sub: 'Guest gender options',             tab: 'genders'         },
  { icon: Brush,       label: 'Housekeeping',       sub: 'Tasks, priorities, room items',    tab: 'hk-config'       },
];

export function StaywebDashboard({ go }: { go: (route: string) => void }) {
  const navigate = (page: string) => go(page.replace(/^admin-/, ''));
  const goToConfig = (tab: ConfigTab) => go(`config-${tab}`);

  return (
  <div className="h-full overflow-auto">
    <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">

      {/* Welcome */}
      <div>
        <h2 className="text-foreground">Welcome back</h2>
        <p className="text-muted-foreground text-[length:var(--text-sm)] mt-1">
          Monitor infrastructure, manage the database, and configure platform-wide settings.
        </p>
      </div>

      {/* Quick access grid */}
      <div>
        <p className="text-[length:var(--text-xs)] font-[var(--font-weight-bold)] uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Quick Access
        </p>
        <div className="grid grid-cols-3 gap-3">
          {quickLinks.map(({ icon: Icon, label, page }) => (
            <button
              key={page}
              onClick={() => navigate(page)}
              className="interactive-card flex flex-col items-center gap-3 p-5 rounded-xl border border-border bg-card cursor-pointer"
            >
              <Icon className="w-6 h-6 text-muted-foreground" strokeWidth={1.75} />
              <span className="font-[var(--font-weight-medium)] text-[length:var(--text-xs)] text-card-foreground text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform config shortcuts */}
      <div>
        <p className="text-[length:var(--text-xs)] font-[var(--font-weight-bold)] uppercase tracking-[0.15em] text-muted-foreground mb-3">
          Platform Configuration
        </p>
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm divide-y divide-border">
          {configShortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.tab}
                onClick={() => goToConfig(item.tab)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/50 transition-colors group text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-[var(--font-weight-medium)] text-card-foreground text-[length:var(--text-sm)] leading-tight">{item.label}</p>
                  <p className="text-muted-foreground text-[length:var(--text-xs)] leading-tight mt-0.5">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  </div>
  );
}
