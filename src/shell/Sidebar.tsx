import { useState } from 'react';
import { ChevronDown, ChevronRight, Settings } from 'lucide-react';
import type { ModuleManifest, NavItem } from './types';
import { navGroups, routeKey, settingsManifests, type Area } from './registry';
import { can } from './session';

interface SidebarProps {
  current: string;
  onNavigate: (key: string) => void;
}

function visible(items: NavItem[]): NavItem[] {
  return items
    .filter(i => can(i.permission))
    .map(i => (i.children ? { ...i, children: visible(i.children) } : i));
}

export function Sidebar({ current, onNavigate }: SidebarProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([current.split('/').slice(0, 2).join('/')]));

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const renderManifest = (area: Area, m: ModuleManifest, items: NavItem[]) => {
    const groupId = `${area}/${m.id}`;
    const Icon = m.icon;
    const isExpanded = expanded.has(groupId);
    const groupActive = current.startsWith(groupId + '/');
    return (
      <div key={groupId}>
        <button
          onClick={() => toggle(groupId)}
          className="w-full flex items-center gap-2.5 rounded-lg transition-all"
          style={{
            padding: '8px 12px',
            backgroundColor: groupActive ? 'var(--sidebar-primary)' : 'transparent',
            color: groupActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
          }}
        >
          <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: groupActive ? 'var(--foreground)' : 'var(--muted-foreground)' }} />
          <span className="flex-1 text-left truncate" style={{ fontWeight: groupActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)' }}>
            {m.name}
          </span>
          {isExpanded
            ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
            : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />}
        </button>
        {isExpanded && (
          <div className="ml-4 pl-3 mt-0.5 space-y-0.5" style={{ borderLeft: '1px solid var(--sidebar-border)' }}>
            {renderItems(area, m.id, items)}
          </div>
        )}
      </div>
    );
  };

  const renderItems = (area: Area, manifestId: string, items: NavItem[]) =>
    items.map(item => {
      const key = routeKey(area, manifestId, item.route);
      const active = current === key;
      return (
        <div key={key}>
          <button
            onClick={() => onNavigate(key)}
            className="w-full text-left px-3 py-1.5 rounded-md transition-all"
            style={{
              backgroundColor: active ? 'var(--sidebar-primary)' : 'transparent',
              color: active ? 'var(--sidebar-primary-foreground)' : 'var(--muted-foreground)',
              fontWeight: active ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
            }}
          >
            {item.label}
          </button>
          {item.children && item.children.length > 0 && (
            <div className="ml-3">{renderItems(area, manifestId, item.children)}</div>
          )}
        </div>
      );
    });

  return (
    <aside
      className="h-full flex flex-col"
      style={{ width: '240px', backgroundColor: 'var(--sidebar)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group, gi) => {
          const manifests = group.manifests
            .map(m => ({ m, items: visible(m.nav) }))
            .filter(({ items }) => items.length > 0);
          if (manifests.length === 0) return null;
          return (
            <div key={group.area} className={gi > 0 ? 'mt-4' : ''}>
              <h6 className="px-3 mb-1" style={{ color: 'var(--muted-foreground)' }}>{group.label}</h6>
              <div className="space-y-0.5">
                {manifests.map(({ m, items }) => renderManifest(group.area, m, items))}
              </div>
            </div>
          );
        })}

        {settingsManifests.length > 0 && (
          <div className="mt-4">
            <h6 className="px-3 mb-1 flex items-center gap-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <Settings className="w-3.5 h-3.5" /> Settings
            </h6>
            <div className="space-y-0.5">
              {settingsManifests.map(m =>
                renderManifest('settings', m, visible(m.settings!.map(s => ({ label: s.label, route: s.route, permission: s.permission })))),
              )}
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
