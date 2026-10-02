import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { sidebarSections } from '../../shell/nav';

// Route key from the module registry: "<area>/<manifest id>/<route>"
export type AppPage = string;

interface NavItem {
  id: AppPage;
  label: string;
  icon: React.ElementType;
  children?: { id: AppPage; label: string }[];
}

// Navigation is built from the module registry (src/shell/nav.ts).
const navSections: { label: string; items: NavItem[] }[] = sidebarSections;

interface AppSidebarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function AppSidebar({ currentPage, onNavigate }: AppSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    // Auto-expand the group containing the current page
    const expanded = new Set<string>();
    for (const section of navSections) {
      for (const item of section.items) {
        if (item.children) {
          const hasActivePage = item.children.some(c => c.id === currentPage);
          if (hasActivePage || item.id === currentPage) {
            expanded.add(item.id);
          }
        }
      }
    }
    return expanded;
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (page: AppPage) => currentPage === page;
  const isGroupActive = (item: NavItem) => {
    if (isActive(item.id)) return true;
    return item.children?.some(c => isActive(c.id)) || false;
  };

  return (
    <aside
      className="h-full flex flex-col"
      style={{
        width: '240px',
        backgroundColor: 'var(--sidebar)',
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? 'mt-4' : ''}>
            {section.label && (
              <h6
                className="px-3 mb-1"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {section.label}
              </h6>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const groupActive = isGroupActive(item);
                const isExpanded = expandedGroups.has(item.id);
                const hasChildren = item.children && item.children.length > 0;

                return (
                  <div key={item.id}>
                    <button
                      onClick={() => {
                        if (hasChildren) {
                          toggleGroup(item.id);
                        } else {
                          onNavigate(item.id);
                        }
                      }}
                      className="w-full flex items-center gap-2.5 rounded-lg transition-all"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: groupActive ? 'var(--sidebar-primary)' : 'transparent',
                        color: groupActive ? 'var(--sidebar-primary-foreground)' : 'var(--sidebar-foreground)',
                      }}
                    >
                      <Icon
                        className="w-[18px] h-[18px] flex-shrink-0"
                        style={{
                          color: groupActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                        }}
                      />
                      <span className="flex items-center gap-2.5 flex-1 min-w-0">
                        <span
                          className="flex-1 text-left truncate"
                          style={{
                            fontWeight: groupActive
                              ? 'var(--font-weight-medium)'
                              : 'var(--font-weight-regular)',
                          }}
                        >
                          {item.label}
                        </span>
                        {hasChildren && (
                          isExpanded
                            ? <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                            : <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                        )}
                      </span>
                    </button>

                    {/* Children */}
                    {hasChildren && isExpanded && (
                      <div className="ml-4 pl-3 mt-0.5 space-y-0.5" style={{ borderLeft: '1px solid var(--sidebar-border)' }}>
                        {item.children!.map((child) => {
                          const childActive = isActive(child.id);
                          return (
                            <button
                              key={child.id}
                              onClick={() => onNavigate(child.id)}
                              className="w-full text-left px-3 py-1.5 rounded-md transition-all"
                              style={{
                                backgroundColor: childActive ? 'var(--sidebar-primary)' : 'transparent',
                                color: childActive ? 'var(--sidebar-primary-foreground)' : 'var(--muted-foreground)',
                                fontWeight: childActive ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                              }}
                            >
                              {child.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}