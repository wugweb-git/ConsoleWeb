import React from 'react';
import { ChevronRight } from 'lucide-react';
import type { AppPage } from './AppSidebar';
import { breadcrumbTrails } from '../../shell/nav';

interface BreadcrumbItem {
  label: string;
  page?: AppPage;
}

// Maps each page to its breadcrumb trail (built from the module registry)
const breadcrumbMap: Record<AppPage, BreadcrumbItem[]> = breadcrumbTrails;

interface BreadcrumbsProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
}

export function Breadcrumbs({ currentPage, onNavigate }: BreadcrumbsProps) {
  const trail = breadcrumbMap[currentPage] || [{ label: currentPage }];

  return (
    <nav className="flex items-center gap-1">
      {trail.map((crumb, i) => {
        const isLast = i === trail.length - 1;
        return (
          <span key={i} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                className="w-3.5 h-3.5 flex-shrink-0"
                style={{ color: 'rgba(255,255,255,0.3)' }}
              />
            )}
            {crumb.page && !isLast ? (
              <button
                onClick={() => onNavigate(crumb.page!)}
                className="transition-opacity hover:opacity-100"
                style={{
                  color: 'rgba(255,255,255,0.5)',
                  fontWeight: 'var(--font-weight-regular)',
                }}
              >
                {crumb.label}
              </button>
            ) : (
              <span
                style={{
                  color: isLast ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)',
                  fontWeight: isLast ? 'var(--font-weight-medium)' : 'var(--font-weight-regular)',
                }}
              >
                {crumb.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}